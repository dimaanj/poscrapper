import { useState } from 'react';
import { updateStatus } from '../api';
import type { Vacancy, VacancyStatus } from '../types';
import TelegramModal from './TelegramModal';
import EmailModal from './EmailModal';

const CONTACT_ICON: Record<string, string> = {
  telegram: '💬',
  email: '📧',
  form: '🔗',
  unknown: '❓',
};

const STATUS_BADGE: Record<VacancyStatus, { label: string; cls: string }> = {
  new: { label: 'Новая', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' },
  saved: { label: 'Сохранена', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300' },
  applied: { label: 'Отправлено', cls: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300' },
  skipped: { label: 'Пропущена', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

interface Props {
  vacancy: Vacancy;
  onStatusChange: (id: number, status: VacancyStatus) => void;
}

export default function VacancyCard({ vacancy, onStatusChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showTg, setShowTg] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const badge = STATUS_BADGE[vacancy.status];

  const handleStatus = async (status: VacancyStatus) => {
    setUpdatingStatus(true);
    try {
      await updateStatus(vacancy.id, status);
      onStatusChange(vacancy.id, status);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSent = async () => {
    setShowTg(false);
    setShowEmail(false);
    await handleStatus('applied');
  };

  return (
    <>
      <div
        className={[
          'rounded-xl border p-4 transition-colors',
          vacancy.status === 'skipped'
            ? 'border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40 opacity-60'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{vacancy.channel}</span>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{formatDate(vacancy.matched_at)}</span>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Preview text */}
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {expanded ? vacancy.text : vacancy.preview}
        </p>
        {vacancy.text.length > 200 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            {expanded ? 'Свернуть' : 'Читать полностью'}
          </button>
        )}

        {/* Contact + actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Contact badge */}
          <span className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
            <span>{CONTACT_ICON[vacancy.contact_type]}</span>
            <span className="max-w-[180px] truncate">{vacancy.contact_value || '—'}</span>
          </span>

          {/* tg_link */}
          {vacancy.tg_link && (
            <a
              href={vacancy.tg_link}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ↗ Открыть пост
            </a>
          )}

          <div className="ml-auto flex flex-wrap gap-2">
            {/* Action buttons by contact type */}
            {vacancy.contact_type === 'telegram' && vacancy.contact_value && vacancy.status !== 'applied' && (
              <button
                onClick={() => setShowTg(true)}
                className="rounded-lg bg-indigo-700 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
              >
                💬 Send TG
              </button>
            )}

            {vacancy.contact_type === 'email' && vacancy.contact_value && vacancy.status !== 'applied' && (
              <button
                onClick={() => setShowEmail(true)}
                className="rounded-lg bg-indigo-700 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
              >
                📧 Написать
              </button>
            )}

            {vacancy.contact_type === 'form' && vacancy.contact_value && (
              <a
                href={vacancy.contact_value}
                target="_blank"
                rel="noreferrer"
                onClick={() => void handleStatus('applied')}
                className="rounded-lg bg-indigo-700 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-600"
              >
                🔗 Open Form
              </a>
            )}

            {/* Save / Skip */}
            {vacancy.status === 'new' && (
              <>
                <button
                  disabled={updatingStatus}
                  onClick={() => void handleStatus('saved')}
                  className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  ★ Сохранить
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => void handleStatus('skipped')}
                  className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Skip
                </button>
              </>
            )}

            {vacancy.status === 'saved' && (
              <button
                disabled={updatingStatus}
                onClick={() => void handleStatus('skipped')}
                className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Skip
              </button>
            )}

            {vacancy.status === 'skipped' && (
              <button
                disabled={updatingStatus}
                onClick={() => void handleStatus('new')}
                className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                ↩ Вернуть
              </button>
            )}
          </div>
        </div>
      </div>

      {showTg && (
        <TelegramModal vacancy={vacancy} onClose={() => setShowTg(false)} onSent={handleSent} />
      )}
      {showEmail && (
        <EmailModal vacancy={vacancy} onClose={() => setShowEmail(false)} onSent={handleSent} />
      )}
    </>
  );
}
