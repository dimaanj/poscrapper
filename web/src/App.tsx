import { useState, useEffect, useCallback } from 'react';
import { fetchVacancies, fetchCounts } from './api';
import type { Vacancy, VacancyStatus, StatusCounts } from './types';
import StatusFilter from './components/StatusFilter';
import VacancyList from './components/VacancyList';

type FilterValue = VacancyStatus | 'all';

const EMPTY_COUNTS: StatusCounts = { new: 0, saved: 0, applied: 0, skipped: 0 };

export default function App() {
  const [filter, setFilter] = useState<FilterValue>('new');
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<StatusCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const LIMIT = 50;

  const load = useCallback(
    async (f: FilterValue, p: number) => {
      setLoading(true);
      try {
        const [res, c] = await Promise.all([
          fetchVacancies(f, p, LIMIT),
          fetchCounts(),
        ]);
        setVacancies(res.items);
        setTotal(res.total);
        setCounts(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load(filter, page);
  }, [filter, page, load]);

  const handleFilterChange = (f: FilterValue) => {
    setFilter(f);
    setPage(1);
  };

  const handleStatusChange = () => {
    void load(filter, page);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Vacancy Tracker</span>
            <span className="rounded-full bg-indigo-900/60 px-2 py-0.5 text-xs font-medium text-indigo-300">
              Node · NestJS · React · Next
            </span>
          </div>
          <button
            onClick={() => void load(filter, page)}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
          >
            ↻ Обновить
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-6">
        {/* Sidebar */}
        <aside className="w-44 shrink-0">
          <StatusFilter active={filter} counts={counts} onChange={handleFilterChange} />
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-gray-300">
              {filter === 'all' ? 'Все вакансии' : {
                new: 'Новые вакансии',
                saved: 'Сохранённые',
                applied: 'Отправлены',
                skipped: 'Пропущены',
              }[filter]}
              <span className="ml-2 text-gray-500">({total})</span>
            </h1>
          </div>

          <VacancyList
            vacancies={vacancies}
            loading={loading}
            onStatusChange={handleStatusChange}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-40"
              >
                ← Назад
              </button>
              <span className="text-xs text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-40"
              >
                Вперёд →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
