import { NewMessage, NewMessageEvent } from 'telegram/events';
import { Api } from 'telegram';
import { getClient } from './telegram';
import { getDb } from './db';
import { shouldApply } from './filter';
import { parseContact } from './parser';
import { config } from './config';

const HISTORY_DAYS  = 7;    // how many days back to fetch on startup
const HISTORY_BATCH = 100;  // Telegram API max per request

function makeSaveMessage(db: ReturnType<typeof getDb>) {
  const insertVacancy = db.prepare(`
    INSERT OR IGNORE INTO vacancies
      (channel, message_id, text, preview, contact_type, contact_value, tg_link)
    VALUES
      (@channel, @message_id, @text, @preview, @contact_type, @contact_value, @tg_link)
  `);

  return function saveMessage(channelName: string, username: string | undefined, msg: { id: number; text?: string | null }) {
    if (!msg?.text) return false;
    if (!shouldApply(msg.text)) return false;

    const contact = parseContact(msg.text);
    const tgLink = username ? `https://t.me/${username}/${msg.id}` : null;

    try {
      const result = insertVacancy.run({
        channel: channelName,
        message_id: msg.id,
        text: msg.text,
        preview: msg.text.slice(0, 200),
        contact_type: contact.type,
        contact_value: contact.value,
        tg_link: tgLink,
      });
      return result.changes > 0;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('UNIQUE')) console.error('DB insert error:', err);
      return false;
    }
  };
}

export async function fetchHistory(): Promise<number> {
  const client = await getClient();
  const db = getDb();
  const saveMessage = makeSaveMessage(db);

  const cutoffTs = Math.floor(Date.now() / 1000) - HISTORY_DAYS * 86400;
  let totalSaved = 0;

  console.log(`📚 Fetching history (last ${HISTORY_DAYS} days per channel)...`);
  for (const channel of config.channels) {
    try {
      let fetched = 0;
      let saved = 0;
      let offsetId = 0;
      let reachedCutoff = false;

      while (!reachedCutoff) {
        const result = await client.invoke(
          new Api.messages.GetHistory({
            peer: channel,
            limit: HISTORY_BATCH,
            offsetId,
            offsetDate: 0,
            addOffset: 0,
            maxId: 0,
            minId: 0,
            hash: BigInt(0),
          }),
        );

        const messages =
          'messages' in result
            ? (result.messages as Array<{ id: number; message?: string; date?: number; className?: string }>)
            : [];

        if (messages.length === 0) break;

        for (const m of messages) {
          if (m.className !== 'Message') continue;
          if (m.date !== undefined && m.date < cutoffTs) {
            reachedCutoff = true;
            break;
          }
          if (saveMessage(`@${channel}`, channel, { id: m.id, text: m.message })) saved++;
          fetched++;
        }

        if (!reachedCutoff) {
          offsetId = messages[messages.length - 1].id;
          if (messages.length < HISTORY_BATCH) break;
        }
      }

      console.log(`  @${channel}: fetched ${fetched}, saved ${saved} new`);
      totalSaved += saved;
    } catch (err) {
      console.warn(`  ⚠️  Could not fetch history for @${channel}:`, err instanceof Error ? err.message : err);
    }
  }

  return totalSaved;
}

export async function startScraper(): Promise<void> {
  if (config.channels.length === 0) {
    console.warn('⚠️  TG_CHANNELS is empty — scraper will not listen to any channel.');
    console.warn('   Add channel usernames to .env: TG_CHANNELS=it_vacancies');
    return;
  }

  await fetchHistory();

  const client = await getClient();
  const db = getDb();
  const saveMessage = makeSaveMessage(db);

  // Listen for new messages going forward
  client.addEventHandler(async (event: NewMessageEvent) => {
    const msg = event.message;
    if (!msg?.text) return;

    const chat = await msg.getChat();
    const username = (chat as Record<string, unknown>)?.username as string | undefined;
    const channelName = username ? `@${username}` : String((chat as Record<string, unknown>)?.id ?? '');

    if (saveMessage(channelName, username, { id: msg.id, text: msg.text })) {
      const contact = parseContact(msg.text);
      console.log(`📥 New vacancy: ${channelName} #${msg.id} [${contact.type}]`);
    }
  }, new NewMessage({ chats: config.channels }));

  console.log(`👀 Scraper watching: ${config.channels.join(', ')}`);
}

