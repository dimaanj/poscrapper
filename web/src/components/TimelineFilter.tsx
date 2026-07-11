import type { TimelineFilter as TimelineFilterValue } from '../types';

interface Props {
  value: TimelineFilterValue;
  onChange: (value: TimelineFilterValue) => void;
}

const OPTIONS: Array<{ value: TimelineFilterValue; label: string }> = [
  { value: 'all', label: 'Все время' },
  { value: '1d', label: '1 день' },
  { value: '3d', label: '3 дня' },
  { value: '7d', label: 'Неделя' },
  { value: '30d', label: 'Месяц' },
];

export default function TimelineFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Таймлайн</span>
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              value === option.value
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
