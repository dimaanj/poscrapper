import { useState, useEffect, useCallback } from 'react';
import { fetchVacancies, fetchCounts, fetchSessionStart, fetchChannels, resync } from './api';
import type { Vacancy, VacancyStatus, StatusCounts, TimelineFilter, LocationFilter } from './types';
import StatusFilter from './components/StatusFilter';
import VacancyList from './components/VacancyList';
import TimelineFilterControl from './components/TimelineFilter';
import LocationFilterControl from './components/LocationFilter';
import ChannelFilter from './components/ChannelFilter';

type FilterValue = VacancyStatus | 'all';

const EMPTY_COUNTS: StatusCounts = { new: 0, saved: 0, applied: 0, skipped: 0 };

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };
  return { dark, toggle };
}

export default function App() {
  const { dark, toggle: toggleTheme } = useTheme();
  const [filter, setFilter] = useState<FilterValue>('new');
  const [hasContact, setHasContact] = useState(false);
  const [noLead, setNoLead] = useState(false);
  const [sinceStartup, setSinceStartup] = useState(false);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineFilter>('all');
  const [location, setLocation] = useState<LocationFilter>('any');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [resyncing, setResyncing] = useState(false);
  const [resyncToast, setResyncToast] = useState<string | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<StatusCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const LIMIT = 50;

  const load = useCallback(
    async (
      f: FilterValue,
      p: number,
      hc: boolean,
      nl: boolean,
      ss: boolean,
      tl: TimelineFilter,
      loc: LocationFilter,
      chList: string[],
    ) => {
      setLoading(true);
      try {
        const [res, c] = await Promise.all([
          fetchVacancies(f, p, LIMIT, hc, nl, ss, tl, loc, chList),
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
    fetchSessionStart().then(setSessionStart).catch(() => {});
    fetchChannels().then(setChannels).catch(() => {});
  }, []);

  useEffect(() => {
    void load(filter, page, hasContact, noLead, sinceStartup, timeline, location, selectedChannels);
  }, [filter, page, hasContact, noLead, sinceStartup, timeline, location, selectedChannels, load]);

  const handleFilterChange = (f: FilterValue) => {
    setFilter(f);
    setPage(1);
  };

  const handleHasContactChange = (v: boolean) => {
    setHasContact(v);
    setPage(1);
  };

  const handleNoLeadChange = (v: boolean) => {
    setNoLead(v);
    setPage(1);
  };

  const handleSinceStartupChange = (v: boolean) => {
    setSinceStartup(v);
    setPage(1);
  };

  const handleTimelineChange = (v: TimelineFilter) => {
    setTimeline(v);
    setPage(1);
  };

  const handleLocationChange = (v: LocationFilter) => {
    setLocation(v);
    setPage(1);
  };

  const handleChannelsChange = (next: string[]) => {
    setSelectedChannels(next);
    setPage(1);
  };

  const handleStatusChange = () => {
    void load(filter, page, hasContact, noLead, sinceStartup, timeline, location, selectedChannels);
  };

  const handleResync = async () => {
    setResyncing(true);
    setResyncToast(null);
    try {
      const { added } = await resync();
      setResyncToast(added > 0 ? `+${added} новых вакансий` : 'Новых нет');
      if (added > 0) void load(filter, page, hasContact, noLead, sinceStartup, timeline, location, selectedChannels);
    } catch {
      setResyncToast('Ошибка синхронизации');
    } finally {
      setResyncing(false);
      setTimeout(() => setResyncToast(null), 4000);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress bar */}
      {resyncing && (
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gray-200 dark:bg-gray-800">
          <div className="h-full animate-[resync-bar_2s_ease-in-out_infinite] bg-indigo-500" />
        </div>
      )}

      {/* Toast */}
      {resyncToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700">
          {resyncToast}
        </div>
      )}

      {/* Top bar */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Vacancy Tracker</span>
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-300">
              Node · NestJS · React · Next
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {dark ? '☀️ Светлая' : '🌙 Тёмная'}
            </button>
            <button
              onClick={() => void handleResync()}
              disabled={resyncing}
              className="rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resyncing ? '⏳ Синхронизация...' : '⟳ Ресинк'}
            </button>
            <button
              onClick={() => void load(filter, page, hasContact, noLead, sinceStartup, timeline, location, selectedChannels)}
              className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ↻ Обновить
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-6">
        {/* Sidebar */}
        <aside className="w-44 shrink-0">
          <StatusFilter
            active={filter}
            counts={counts}
            onChange={handleFilterChange}
            hasContact={hasContact}
            onHasContactChange={handleHasContactChange}
            noLead={noLead}
            onNoLeadChange={handleNoLeadChange}
            sinceStartup={sinceStartup}
            onSinceStartupChange={handleSinceStartupChange}
            sessionStart={sessionStart}
          />
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              {filter === 'all' ? 'Все вакансии' : {
                new: 'Новые вакансии',
                saved: 'Сохранённые',
                applied: 'Отправлены',
                skipped: 'Пропущены',
              }[filter]}
              <span className="ml-2 text-gray-500">({total})</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
            <TimelineFilterControl value={timeline} onChange={handleTimelineChange} />
            <LocationFilterControl value={location} onChange={handleLocationChange} />
            <ChannelFilter channels={channels} selected={selectedChannels} onChange={handleChannelsChange} />
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
                className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
              >
                ← Назад
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40"
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
