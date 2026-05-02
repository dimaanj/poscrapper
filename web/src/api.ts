import type { VacanciesResponse, StatusCounts, Templates, VacancyStatus } from './types';

const BASE = '/api';

export async function fetchVacancies(
  status?: VacancyStatus | 'all',
  page = 1,
  limit = 50,
): Promise<VacanciesResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status && status !== 'all') params.set('status', status);
  const res = await fetch(`${BASE}/vacancies?${params}`);
  if (!res.ok) throw new Error('Failed to fetch vacancies');
  return res.json() as Promise<VacanciesResponse>;
}

export async function fetchCounts(): Promise<StatusCounts> {
  const res = await fetch(`${BASE}/vacancies/counts`);
  if (!res.ok) throw new Error('Failed to fetch counts');
  return res.json() as Promise<StatusCounts>;
}

export async function updateStatus(id: number, status: VacancyStatus): Promise<void> {
  const res = await fetch(`${BASE}/vacancies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
}

export async function sendTelegram(id: number, message: string): Promise<void> {
  const res = await fetch(`${BASE}/vacancies/${id}/send-telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? 'Failed to send Telegram message');
  }
}

export async function fetchTemplates(params: {
  channel?: string;
  position?: string;
  tgLink?: string;
}): Promise<Templates> {
  const q = new URLSearchParams();
  if (params.channel) q.set('channel', params.channel);
  if (params.position) q.set('position', params.position);
  if (params.tgLink) q.set('tgLink', params.tgLink);
  const res = await fetch(`${BASE}/templates?${q}`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json() as Promise<Templates>;
}
