export type ContactType = 'telegram' | 'email' | 'form' | 'unknown';
export type VacancyStatus = 'new' | 'saved' | 'applied' | 'skipped';
export type TimelineFilter = 'all' | '1d' | '3d' | '7d' | '30d';
export type LocationFilter = 'any' | 'russia' | 'remote';

export interface Vacancy {
  id: number;
  channel: string;
  message_id: number;
  text: string;
  preview: string;
  contact_type: ContactType;
  contact_value: string;
  tg_link: string | null;
  status: VacancyStatus;
  matched_at: string;
  message_date: string | null;
}

export interface VacanciesResponse {
  total: number;
  page: number;
  limit: number;
  items: Vacancy[];
}

export interface StatusCounts {
  new: number;
  saved: number;
  applied: number;
  skipped: number;
}

export interface Templates {
  telegram: string;
  emailSubject: string;
  emailBody: string;
}
