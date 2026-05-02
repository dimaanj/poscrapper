import { useState, useEffect, useCallback } from 'react';
import { fetchVacancies, fetchCounts, fetchSessionStart, fetchChannels, resync } from './api';
import type { Vacancy, VacancyStatus, StatusCounts } from './types';
import StatusFilter from './components/StatusFilter';
import VacancyList from './components/VacancyList';

type FilterValue = VacancyStatus | 'all';

const EMPTY_COUNTS: StatusCounts = { new: 0, saved: 0, applied: 0, skipped: 0 };

export default function App() {
  const [filter, setFilter] = useState<FilterValue>('new');
  const [hasContact, setHasContact] = useState(false);
  const [isRemote, setIsRemote] = useState(false);
  const [noOffice, setNoOffice] = useState(false);
  const [noLead, setNoLead] = useState(false);
  const [sinceStartup, setSinceStartup] = useState(false);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [channel, setChannel] = useState<string>('');
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
    async (f: FilterValue, p: number, hc: boolean, ir: boolean, no: boolean, nl: boolean, ss: boolean, ch: string) => {
      setLoading(true);
      try {
        const [res, c] = await Promise.all([
          fetchVacancies(f, p, LIMIT, hc, ir, no, nl, ss, ch || undefined),
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
    void load(filter, page, hasContact, isRemote, noOffice, noLead, sinceStartup, channel);
  }, [filter, page, hasContact, isRemote, noOffice, noLead, sinceStartup, channel, load]);

  const handleFilterChange = (f: FilterValue) => {
    setFilter(f);
    setPage(1);
  };

  const handleHasContactChange = (v: boolean) => {
    setHasContact(v);
    setPage(1);
  };

  const handleIsRemoteChange = (v: boolean) => {
    setIsRemote(v);
    setPage(1);
  };

  const handleNoOfficeChange = (v: boolean) => {
    setNoOffice(v);
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

  const handleChannelChange = (v: string) => {
    setChannel(v);
    setPage(1);
  };

  const handleStatusChange = () => {
    void load(filter, page, hasContact, isRemote, noOffice, noLead, sinceStartup, channel);
  };

  const handleResync = async () => {
    setResyncing(true);
    setResyncToast(null);
    try {
      const { added } = await resync();
      setResyncToast(added > 0 ? `+${added} новых вакансий` : 'Новых нет');
      if (added > 0) void load(filter, page, hasContact, isRemote, noOffice, noLead, sinceStartup, channel);
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
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gray-800">
          <div className="h-full animate-[resync-bar_2s_ease-in-out_infinite] bg-indigo-500" />
        </div>
      )}

      {/* Toast */}
      {resyncToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-800 px-4 py-3 text-sm font-medium text-white shadow-2xl ring-1 ring-gray-700">
          {resyncToast}
        </div>
      )}

      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Vacancy Tracker</span>
            <span className="rounded-full bg-indigo-900/60 px-2 py-0.5 text-xs font-medium text-indigo-300">
              Node · NestJS · React · Next
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleResync()}
              disabled={resyncing}
              className="rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resyncing ? '⏳ Синхронизация...' : '⟳ Ресинк'}
            </button>
            <button
              onClick={() => void load(filter, page, hasContact, isRemote, noOffice, noLead, sinceStartup, channel)}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
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
          <StatusFilter active={filter} counts={counts} onChange={handleFilterChange} hasContact={hasContact} onHasContactChange={handleHasContactChange} isRemote={isRemote} onIsRemoteChange={handleIsRemoteChange} noOffice={noOffice} onNoOfficeChange={handleNoOfficeChange} noLead={noLead} onNoLeadChange={handleNoLeadChange} sinceStartup={sinceStartup} onSinceStartupChange={handleSinceStartupChange} sessionStart={sessionStart} channel={channel} channels={channels} onChannelChange={handleChannelChange} />
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
