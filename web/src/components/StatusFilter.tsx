import type { StatusCounts, VacancyStatus } from '../types';

type FilterValue = VacancyStatus | 'all';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'saved', label: 'Сохранённые' },
  { value: 'applied', label: 'Отправлены' },
  { value: 'skipped', label: 'Пропущены' },
];

interface Props {
  active: FilterValue;
  counts: StatusCounts;
  onChange: (v: FilterValue) => void;
  hasContact: boolean;
  onHasContactChange: (v: boolean) => void;
  noLead: boolean;
  onNoLeadChange: (v: boolean) => void;
  sinceStartup: boolean;
  onSinceStartupChange: (v: boolean) => void;
  sessionStart: string | null;
}

export default function StatusFilter({ active, counts, onChange, hasContact, onHasContactChange, noLead, onNoLeadChange, sinceStartup, onSinceStartupChange, sessionStart }: Props) {
  return (
    <nav className="flex flex-col gap-1">
      {FILTERS.map(({ value, label }) => {
        const count = value === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[value as VacancyStatus] ?? 0;

        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={[
              'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active === value
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
            ].join(' ')}
          >
            <span>{label}</span>
            <span
              className={[
                'ml-2 rounded-full px-2 py-0.5 text-xs',
                active === value ? 'bg-indigo-500 text-indigo-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
              ].join(' ')}
            >
              {count}
            </span>
          </button>
        );
      })}

      <div className="mt-3 border-t border-gray-200 dark:border-gray-800 pt-3 flex flex-col gap-1">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={hasContact}
            onChange={(e) => onHasContactChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span>С контактом</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={noLead}
            onChange={(e) => onNoLeadChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span>Не Lead</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={sinceStartup}
            onChange={(e) => onSinceStartupChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span className="leading-tight">
            После старта
            {sessionStart && (
              <span className="block text-[10px] text-gray-400 dark:text-gray-600">
                {new Date(sessionStart).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </span>
        </label>
      </div>
    </nav>
  );
}
