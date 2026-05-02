import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';
import fs from 'fs';
import path from 'path';
import { config } from './config';

let _client: TelegramClient | null = null;

export async function getClient(): Promise<TelegramClient> {
  if (_client?.connected) return _client;

  const sessionDir = path.dirname(config.sessionPath);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const sessionStr = fs.existsSync(config.sessionPath)
    ? fs.readFileSync(config.sessionPath, 'utf-8').trim()
    : '';

  const session = new StringSession(sessionStr);

  _client = new TelegramClient(session, config.apiId, config.apiHash, {
    connectionRetries: 5,
  });

  if (!sessionStr) {
    await _client.start({
      phoneNumber: async () => config.phone || (await input.text('Phone number: ')),
      password: async () => await input.text('2FA password (leave blank if none): '),
      phoneCode: async () => await input.text('SMS code: '),
      onError: (err) => console.error('Auth error:', err),
    });
    const saved = _client.session.save() as unknown as string;
    fs.writeFileSync(config.sessionPath, saved);
    console.log('✅ Session saved to', config.sessionPath);
  } else {
    await _client.connect();
  }

  return _client;
}

export async function sendMessage(target: string, message: string): Promise<void> {
  const client = await getClient();
  await client.sendMessage(target, { message });
}
