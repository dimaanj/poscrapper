import { useState, useEffect } from 'react';
import { fetchTemplates, sendTelegram } from '../api';
import type { Vacancy } from '../types';

interface Props {
  vacancy: Vacancy;
  onClose: () => void;
  onSent: () => void;
}

export default function TelegramModal({ vacancy, onClose, onSent }: Props) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates({
      channel: vacancy.channel,
      tgLink: vacancy.tg_link ?? undefined,
    })
      .then((t) => setMessage(t.telegram))
      .catch(() => setMessage(''));
  }, [vacancy]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError('');
    try {
      await sendTelegram(vacancy.id, message);
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/70 p-4">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Отправить в Telegram</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Получатель: <span className="font-medium text-indigo-600 dark:text-indigo-400">{vacancy.contact_value}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">
            ×
          </button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={12}
          className="w-full resize-y rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none ring-1 ring-gray-300 dark:ring-gray-700 focus:ring-indigo-500"
          placeholder="Загрузка шаблона..."
        />

        {error && <p className="rounded-lg bg-red-100 dark:bg-red-900/40 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Отправка...' : '💬 Отправить'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
