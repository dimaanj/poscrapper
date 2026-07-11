import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './config';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new Database(config.dbPath);
  _db.pragma('journal_mode = WAL');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS vacancies (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      channel       TEXT NOT NULL,
      message_id    INTEGER NOT NULL,
      text          TEXT NOT NULL,
      preview       TEXT,
      contact_type  TEXT DEFAULT 'unknown',
      contact_value TEXT DEFAULT '',
      tg_link       TEXT,
      status        TEXT DEFAULT 'new',
      matched_at    DATETIME DEFAULT (datetime('now')),
      message_date  DATETIME,
      UNIQUE(channel, message_id)
    );

    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // migration: add message_date if it doesn't exist yet
  const cols = (_db.pragma('table_info(vacancies)') as Array<{ name: string }>).map((c) => c.name);
  if (!cols.includes('message_date')) {
    _db.exec('ALTER TABLE vacancies ADD COLUMN message_date DATETIME');
  }

  return _db;
}

/**
 * Returns the timestamp of the previous session start (or null on first run),
 * then updates the stored value to now.
 */
export function rotateSessionStart(): string | null {
  const db = getDb();
  const now = new Date().toISOString();

  const row = db
    .prepare("SELECT value FROM meta WHERE key = 'last_session_start'")
    .get() as { value: string } | undefined;

  const previous = row?.value ?? null;

  db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('last_session_start', ?)")
    .run(now);

  return previous;
}
