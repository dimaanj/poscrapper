import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { getDb, rotateSessionStart } from './db';
import { getClient } from './telegram';
import { startScraper, fetchHistory } from './scraper';
import vacanciesRouter from './routes/vacancies';
import { setPrevSessionStart } from './routes/vacancies';
import templatesRouter from './routes/templates';

async function main() {
  if (!config.apiId || !config.apiHash) {
    console.error('❌ TG_API_ID and TG_API_HASH must be set in .env');
    console.error('   Get them at https://my.telegram.org/apps');
    process.exit(1);
  }

  // Init DB and rotate session start timestamp
  getDb();
  const prevSessionStart = rotateSessionStart();
  setPrevSessionStart(prevSessionStart);
  if (prevSessionStart) {
    console.log(`🕐 Previous session: ${new Date(prevSessionStart).toLocaleString('ru-RU')}`);
  }

  // Connect to Telegram (prompts for SMS code on first run)
  console.log('🔐 Connecting to Telegram...');
  await getClient();
  console.log('✅ Telegram connected');

  // Start scraper
  await startScraper();

  // Express API
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/vacancies', vacanciesRouter);
  app.use('/api/templates', templatesRouter);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/session-start', (_req, res) => res.json({ sessionStart: prevSessionStart }));

  let resyncing = false;
  app.post('/api/resync', async (_req, res) => {
    if (resyncing) {
      res.status(409).json({ error: 'Resync already in progress' });
      return;
    }
    resyncing = true;
    try {
      const added = await fetchHistory();
      res.json({ added });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Resync failed' });
    } finally {
      resyncing = false;
    }
  });

  // Serve built frontend in production
  const webDist = path.resolve(__dirname, '../../web/dist');
  if (require('fs').existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get('*', (_req, res) => res.sendFile(path.join(webDist, 'index.html')));
  }

  app.listen(config.port, () => {
    console.log(`🚀 API listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
