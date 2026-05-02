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
  isRemote: boolean;
  onIsRemoteChange: (v: boolean) => void;
  noOffice: boolean;
  onNoOfficeChange: (v: boolean) => void;
  noLead: boolean;
  onNoLeadChange: (v: boolean) => void;
  sinceStartup: boolean;
  onSinceStartupChange: (v: boolean) => void;
  sessionStart: string | null;
  channel: string;
  channels: string[];
  onChannelChange: (v: string) => void;
}

export default function StatusFilter({ active, counts, onChange, hasContact, onHasContactChange, isRemote, onIsRemoteChange, noOffice, onNoOfficeChange, noLead, onNoLeadChange, sinceStartup, onSinceStartupChange, sessionStart, channel, channels, onChannelChange }: Props) {
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

      <div className="mt-3 border-t border-gray-800 pt-3 flex flex-col gap-1">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={hasContact}
            onChange={(e) => onHasContactChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span>С контактом</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(e) => onIsRemoteChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span>Удалённо</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={noOffice}
            onChange={(e) => onNoOfficeChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span>Не офис / не РФ</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={noLead}
            onChange={(e) => onNoLeadChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span>Не Lead</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={sinceStartup}
            onChange={(e) => onSinceStartupChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-indigo-500"
          />
          <span className="leading-tight">
            С запуска
            {sessionStart && (
              <span className="block text-[10px] text-gray-600">
                {new Date(sessionStart).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </span>
        </label>
      </div>

      {channels.length > 0 && (
        <div className="mt-3 border-t border-gray-800 pt-3">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Канал</p>
          <select
            value={channel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-xs text-gray-300 outline-none ring-1 ring-gray-700 focus:ring-indigo-500"
          >
            <option value="">Все каналы</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>
      )}
    </nav>
  );
}
