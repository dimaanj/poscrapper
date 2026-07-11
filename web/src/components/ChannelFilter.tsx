interface Props {
  channels: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function ChannelFilter({ channels, selected, onChange }: Props) {
  const toggleChannel = (channel: string) => {
    if (selected.includes(channel)) {
      onChange(selected.filter((item) => item !== channel));
      return;
    }
    onChange([...selected, channel]);
  };

  return (
    <details className="group relative">
      <summary className="list-none cursor-pointer rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700">
        Каналы: {selected.length > 0 ? selected.length : 'все'}
      </summary>

      <div className="absolute right-0 top-9 z-20 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 flex items-center justify-between px-2 py-1">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Выбери каналы</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
          >
            Сброс
          </button>
        </div>

        <div className="max-h-64 space-y-1 overflow-auto pr-1">
          {channels.map((channel) => (
            <label
              key={channel}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <input
                type="checkbox"
                checked={selected.includes(channel)}
                onChange={() => toggleChannel(channel)}
                className="h-3.5 w-3.5 rounded accent-indigo-500"
              />
              <span className="truncate">{channel}</span>
            </label>
          ))}
          {channels.length === 0 && (
            <p className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Каналы пока не найдены</p>
          )}
        </div>
      </div>
    </details>
  );
}
