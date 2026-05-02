import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  apiId: parseInt(process.env.TG_API_ID || '0', 10),
  apiHash: process.env.TG_API_HASH || '',
  phone: process.env.TG_PHONE || '',
  channels: (process.env.TG_CHANNELS || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean),
  sessionPath: path.resolve(__dirname, '../../session/scraper.session'),
  dbPath: path.resolve(__dirname, '../../db/vacancies.sqlite'),
  cvLink: process.env.CV_LINK || '',
  cvEmail: process.env.CV_EMAIL || '',
};
