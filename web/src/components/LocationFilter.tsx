import type { LocationFilter as LocationFilterValue } from '../types';

interface Props {
  value: LocationFilterValue;
  onChange: (value: LocationFilterValue) => void;
}

export default function LocationFilter({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Локация</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LocationFilterValue)}
        className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700 outline-none ring-1 ring-gray-300 transition focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
      >
        <option value="any">Любая</option>
        <option value="russia">Россия</option>
        <option value="remote">Удаленка</option>
      </select>
    </label>
  );
}
