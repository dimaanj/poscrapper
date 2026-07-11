import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { sendMessage } from '../telegram';

const router = Router();

// Set by index.ts after DB init — the start time of the PREVIOUS session
let _prevSessionStart: string | null = null;
export function setPrevSessionStart(ts: string | null) { _prevSessionStart = ts; }

const VALID_STATUSES = ['new', 'saved', 'applied', 'skipped'] as const;
type Status = (typeof VALID_STATUSES)[number];

function isValidStatus(s: unknown): s is Status {
  return VALID_STATUSES.includes(s as Status);
}

const TIMELINE_SQL: Record<string, string> = {
  '1d': '-1 day',
  '3d': '-3 days',
  '7d': '-7 days',
  '30d': '-30 days',
};

const REMOTE_CONDITION = "(text LIKE '%удалённо%' OR text LIKE '%удаленно%' OR text LIKE '%remote%' OR text LIKE '%ремоут%' OR text LIKE '%дистанционно%')";
const RUSSIA_CONDITION = "(text LIKE '%россия%' OR text LIKE '%российская федерация%' OR text LIKE '% РФ%' OR text LIKE '%РФ.%' OR text LIKE '%москва%' OR text LIKE '%санкт-петербург%' OR text LIKE '%спб%' OR text LIKE '%екатеринбург%' OR text LIKE '%новосибирск%' OR text LIKE '%казань%')";

// GET /api/vacancies?status=new&hasContact=true&isRemote=true&page=1&limit=50
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const {
    status,
    hasContact,
    isRemote,
    noOffice,
    noLead,
    sinceStartup,
    channel,
    channels,
    since,
    location,
    exclude,
    page = '1',
    limit = '50',
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && isValidStatus(status)) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (hasContact === 'true') {
    conditions.push("contact_type != 'unknown'");
  }
  if (location === 'remote') {
    conditions.push(REMOTE_CONDITION);
  }
  if (location === 'russia') {
    conditions.push(RUSSIA_CONDITION);
  }
  if (isRemote === 'true' && (!location || location === 'any')) {
    conditions.push(REMOTE_CONDITION);
  }
  if (noOffice === 'true' && (!location || location === 'any')) {
    conditions.push("(text NOT LIKE '%офис%' AND text NOT LIKE '%office%' AND text NOT LIKE '% РФ%' AND text NOT LIKE '%РФ.%' AND text NOT LIKE '%российская федерация%' AND text NOT LIKE '%россия%' AND text NOT LIKE '%москва%' AND text NOT LIKE '%санкт-петербург%' AND text NOT LIKE '%спб%')");
  }
  if (noLead === 'true') {
    conditions.push("(text NOT LIKE '%lead%' AND text NOT LIKE '%лид%' AND text NOT LIKE '%team lead%' AND text NOT LIKE '%tech lead%')");
  }
  if (since && TIMELINE_SQL[since]) {
    conditions.push("COALESCE(message_date, matched_at) >= datetime('now', ?)");
    params.push(TIMELINE_SQL[since]);
  }
  if (sinceStartup === 'true' && _prevSessionStart) {
    conditions.push('matched_at >= ?');
    params.push(_prevSessionStart);
  }

  const channelList = (channels ?? '')
    .split(',')
    .map((ch) => ch.trim())
    .filter(Boolean);

  if (channelList.length > 0) {
    conditions.push(`channel IN (${channelList.map(() => '?').join(',')})`);
    params.push(...channelList);
  } else if (channel) {
    conditions.push('channel = ?');
    params.push(channel);
  }

  // exclude specific statuses (e.g. exclude=saved,skipped)
  if (exclude) {
    const excludeList = exclude
      .split(',')
      .map((s) => s.trim())
      .filter((s) => VALID_STATUSES.includes(s as Status));
    if (excludeList.length > 0) {
      conditions.push(`status NOT IN (${excludeList.map(() => '?').join(',')})`);
      params.push(...excludeList);
    }
  }

  // always hide closed vacancies
  conditions.push("(text NOT LIKE '%закрыт%' AND text NOT LIKE '%закрыто%' AND text NOT LIKE '%вакансия закрыта%')");

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { cnt } = db
    .prepare(`SELECT COUNT(*) as cnt FROM vacancies ${where}`)
    .get(...params) as { cnt: number };

  const items = db
    .prepare(`SELECT * FROM vacancies ${where} ORDER BY COALESCE(message_date, matched_at) DESC LIMIT ? OFFSET ?`)
    .all(...params, limitNum, offset);

  res.json({ total: cnt, page: pageNum, limit: limitNum, items });
});

// GET /api/vacancies/channels — list of distinct channels in DB
router.get('/channels', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db
    .prepare('SELECT DISTINCT channel FROM vacancies ORDER BY channel ASC')
    .all() as Array<{ channel: string }>;
  res.json(rows.map((r) => r.channel));
});

// GET /api/vacancies/counts
router.get('/counts', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db
    .prepare('SELECT status, COUNT(*) as cnt FROM vacancies GROUP BY status')
    .all() as Array<{ status: string; cnt: number }>;

  const counts: Record<string, number> = { new: 0, saved: 0, applied: 0, skipped: 0 };
  rows.forEach((r) => {
    counts[r.status] = r.cnt;
  });

  res.json(counts);
});

// PATCH /api/vacancies/:id
router.patch('/:id', (req: Request, res: Response) => {
  const { status } = req.body as { status: unknown };
  if (!isValidStatus(status)) {
    res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }

  const db = getDb();
  const result = db
    .prepare('UPDATE vacancies SET status = ? WHERE id = ?')
    .run(status, req.params.id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Vacancy not found' });
    return;
  }

  res.json({ ok: true });
});

// POST /api/vacancies/:id/send-telegram
router.post('/:id/send-telegram', async (req: Request, res: Response) => {
  const db = getDb();
  const vacancy = db
    .prepare('SELECT * FROM vacancies WHERE id = ?')
    .get(req.params.id) as Record<string, unknown> | undefined;

  if (!vacancy) {
    res.status(404).json({ error: 'Vacancy not found' });
    return;
  }

  const { message } = req.body as { message?: string };
  if (!message?.trim()) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const target = vacancy.contact_value as string;
  if (!target) {
    res.status(400).json({ error: 'No Telegram contact found for this vacancy' });
    return;
  }

  try {
    await sendMessage(target, message.trim());
    db.prepare('UPDATE vacancies SET status = ? WHERE id = ?').run('applied', vacancy.id);
    res.json({ ok: true });
  } catch (err: unknown) {
    console.error('Send Telegram error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

export default router;
