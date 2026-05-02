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
      UNIQUE(channel, message_id)
    );
  `);

  return _db;
}
