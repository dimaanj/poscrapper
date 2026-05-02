import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

// GET /api/templates?channel=@nodejs_jobs&position=Senior+Node.js+Dev&tgLink=https://...
router.get('/', (req: Request, res: Response) => {
  const {
    channel = '',
    position = '',
    tgLink = '',
  } = req.query as Record<string, string>;

  const channelStr = channel ? ` в ${channel}` : '';
  const positionStr = position ? ` «${position}»` : '';
  const cvLine = config.cvLink
    ? `CV: ${config.cvLink} | ${config.cvEmail}`
    : `CV: ${config.cvEmail}`;

  const telegram = [
    `Senior Backend / Fullstack | Node.js · NestJS · React · Next.js | HealthTech · B2B SaaS | 6 лет | Remote`,
    ``,
    `Привет! Увидел вакансию${channelStr}, откликаюсь.`,
    ``,
    `— NestJS microservices (J&J, 8+ сервисов, Kafka/CDC, Keycloak SSO)`,
    `— React/Next.js с SSR, TypeScript, Tanstack Query`,
    `— CI/CD: Jenkins → ArgoCD → K8s, Grafana observability`,
    tgLink ? `` : null,
    tgLink ? `Вакансия: ${tgLink}` : null,
    ``,
    cvLine,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const emailSubject = `Senior Node.js / Fullstack Developer — отклик на вакансию${positionStr}`;

  const emailBody = [
    `Добрый день!`,
    ``,
    `Откликаюсь на вашу вакансию${positionStr}.`,
    ``,
    `Релевантный опыт:`,
    `— 6 лет fullstack (Node.js / NestJS / React / Next.js)`,
    `— NestJS microservices в J&J: 8+ сервисов, Kafka/CDC, Keycloak SSO, K8s`,
    `— React/Next.js фронты с SSR, TypeScript, Tanstack Query`,
    `— CI/CD: Jenkins → ArgoCD, Grafana observability`,
    ``,
    `Буду рад обсудить детали.`,
    ``,
    `С уважением, Дмитрий Томашевич`,
    cvLine,
  ].join('\n');

  res.json({ telegram, emailSubject, emailBody });
});

export default router;
