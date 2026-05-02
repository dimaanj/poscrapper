import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { sendMessage } from '../telegram';

const router = Router();

const VALID_STATUSES = ['new', 'saved', 'applied', 'skipped'] as const;
type Status = (typeof VALID_STATUSES)[number];

function isValidStatus(s: unknown): s is Status {
  return VALID_STATUSES.includes(s as Status);
}

// GET /api/vacancies?status=new&page=1&limit=50
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { status, page = '1', limit = '50' } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const useFilter = status && isValidStatus(status);
  const where = useFilter ? 'WHERE status = ?' : '';
  const params: unknown[] = useFilter ? [status] : [];

  const { cnt } = db
    .prepare(`SELECT COUNT(*) as cnt FROM vacancies ${where}`)
    .get(...params) as { cnt: number };

  const items = db
    .prepare(`SELECT * FROM vacancies ${where} ORDER BY matched_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limitNum, offset);

  res.json({ total: cnt, page: pageNum, limit: limitNum, items });
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
