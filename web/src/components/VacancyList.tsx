import type { Vacancy, VacancyStatus } from '../types';
import VacancyCard from './VacancyCard';

interface Props {
  vacancies: Vacancy[];
  loading: boolean;
  onStatusChange: (id: number, status: VacancyStatus) => void;
}

export default function VacancyList({ vacancies, loading, onStatusChange }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <span className="text-sm">Загрузка...</span>
      </div>
    );
  }

  if (vacancies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-600">
        <span className="text-3xl">📭</span>
        <span className="text-sm">Вакансий не найдено</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {vacancies.map((v) => (
        <VacancyCard key={v.id} vacancy={v} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}
