const INCLUDE = [
  'node.js',
  'nodejs',
  'node js',
  'nestjs',
  'nest.js',
  'nextjs',
  'next.js',
  'react',
];

const EXCLUDE = [
  'junior',
  'джуниор',
  'джун',
  'стажёр',
  'стажер',
  'intern',
  'trainee',
  '0-1 год',
  '0-2 год',
  '1-2 год',
  'без опыта',
  'вакансия закрыта',
  'вакансия закрыта',
  'позиция закрыта',
  'закрыто',
  'закрыт',
];

export function shouldApply(text: string): boolean {
  const lower = text.toLowerCase();
  const hasStack = INCLUDE.some((kw) => lower.includes(kw));
  const isJunior = EXCLUDE.some((kw) => lower.includes(kw));
  return hasStack && !isJunior;
}
