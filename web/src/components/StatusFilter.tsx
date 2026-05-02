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
}

export default function StatusFilter({ active, counts, onChange }: Props) {
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
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100',
            ].join(' ')}
          >
            <span>{label}</span>
            <span
              className={[
                'ml-2 rounded-full px-2 py-0.5 text-xs',
                active === value ? 'bg-indigo-500 text-indigo-100' : 'bg-gray-800 text-gray-400',
              ].join(' ')}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
