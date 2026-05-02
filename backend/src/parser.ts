export type ContactType = 'email' | 'telegram' | 'form' | 'unknown';

export interface ParsedContact {
  type: ContactType;
  value: string;
}

export function parseContact(text: string): ParsedContact {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  if (emailMatch) return { type: 'email', value: emailMatch[0] };

  const formMatch = text.match(
    /https?:\/\/\S+(?:form|apply|job|hh\.ru|rabota\.ru|superjob|career|lever\.co|greenhouse\.io|workable|bamboo)\S*/i,
  );
  if (formMatch) return { type: 'form', value: formMatch[0] };

  const tgLinkMatch = text.match(/https?:\/\/t\.me\/([\w]+)/i);
  if (tgLinkMatch) return { type: 'telegram', value: `@${tgLinkMatch[1]}` };

  const tgHandleMatch = text.match(/(?<![/\w])@([\w]{4,})/);
  if (tgHandleMatch) return { type: 'telegram', value: `@${tgHandleMatch[1]}` };

  return { type: 'unknown', value: '' };
}
