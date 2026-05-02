import { useState, useEffect } from 'react';
import { fetchTemplates } from '../api';
import type { Vacancy } from '../types';

interface Props {
  vacancy: Vacancy;
  onClose: () => void;
  onSent: () => void;
}

export default function EmailModal({ vacancy, onClose, onSent }: Props) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    fetchTemplates({ channel: vacancy.channel })
      .then((t) => {
        setSubject(t.emailSubject);
        setBody(t.emailBody);
      })
      .catch(() => {});
  }, [vacancy]);

  const handleOpenMailto = () => {
    const mailto = `mailto:${vacancy.contact_value}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    onSent();
  };

  const handleOpenGmail = () => {
    const gmail = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(vacancy.contact_value)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmail, '_blank');
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-xl bg-gray-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Написать Email</h2>
            <p className="mt-0.5 text-sm text-gray-400">
              Кому: <span className="font-medium text-indigo-400">{vacancy.contact_value}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-400">Тема письма</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none ring-1 ring-gray-700 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-400">Текст письма</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full resize-y rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none ring-1 ring-gray-700 focus:ring-indigo-500"
          />
        </div>

        <p className="text-xs text-gray-500">
          Тему и текст можно отредактировать перед отправкой.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleOpenGmail}
            disabled={!subject.trim() || !body.trim()}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📧 Gmail
          </button>
          <button
            onClick={handleOpenMailto}
            disabled={!subject.trim() || !body.trim()}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Другой клиент
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
