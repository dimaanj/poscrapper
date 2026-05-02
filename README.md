# Vacancy Tracker

Мониторит Telegram-каналы с вакансиями, фильтрует по стеку (Node.js / NestJS / React / Next.js), показывает список в веб-интерфейсе. Отклик — только по кнопке: Telegram, Email или форма.

## Быстрый старт

### 1. Получить Telegram API credentials

Перейди на https://my.telegram.org/apps и создай приложение. Запиши `App api_id` и `App api_hash`.

### 2. Настроить `.env`

```bash
cp .env.example .env
```

Заполни значения:
```
TG_API_ID=12345678
TG_API_HASH=abcdef1234567890abcdef1234567890
TG_PHONE=+79001234567
TG_CHANNELS=nodejs_jobs,it_vacancies,remote_jobs_ru
CV_LINK=https://drive.google.com/file/d/...
CV_EMAIL=your@email.com
```

### 3. Установить зависимости

```bash
# Backend
cd backend && npm install

# Web
cd ../web && npm install
```

### 4. Первый запуск (авторизация)

```bash
cd backend
npm run dev
```

При первом запуске введёшь номер телефона и SMS-код. Сессия сохранится в `session/scraper.session` — больше авторизация не потребуется.

### 5. Запустить UI

В другом терминале:
```bash
cd web
npm run dev
```

Открой http://localhost:5173

---

## Деплой (Yandex Cloud / VPS)

### Требования

- Ubuntu 22.04
- Docker + Docker Compose
- Порт 80 открыт

### Шаги

```bash
git clone https://github.com/dimaanj/poscrapper.git
cd poscrapper
cp .env.example .env   # заполни .env

# Build backend (TypeScript → JS)
cd backend && npm ci && npm run build && cd ..

# Первый запуск для авторизации (интерактивный)
cd backend && node dist/index.js
# Введи номер и код, выйди (Ctrl+C) после "Session saved"
cd ..

# Запустить всё через Docker Compose
docker compose up -d --build

# Открыть UI
open http://YOUR_SERVER_IP
```

> **SSH-туннель для локального доступа:**
> ```bash
> ssh -L 8080:localhost:80 user@YOUR_SERVER_IP
> open http://localhost:8080
> ```

---

## Структура проекта

```
poscrapper/
├── backend/          # Node.js + TypeScript: scraper + REST API
│   └── src/
│       ├── index.ts      # точка входа
│       ├── scraper.ts    # gramjs: история + real-time
│       ├── filter.ts     # фильтрация по стеку
│       ├── parser.ts     # извлечение контакта
│       ├── telegram.ts   # gramjs клиент + sendMessage
│       ├── db.ts         # SQLite schema
│       ├── config.ts     # env-переменные
│       └── routes/
│           ├── vacancies.ts  # CRUD вакансий + send-telegram
│           └── templates.ts  # CV-шаблоны
├── web/              # React + Vite + TailwindCSS
│   └── src/
│       ├── App.tsx
│       ├── api.ts
│       ├── types.ts
│       └── components/
│           ├── VacancyCard.tsx
│           ├── VacancyList.tsx
│           ├── StatusFilter.tsx
│           ├── TelegramModal.tsx
│           └── EmailModal.tsx
├── db/               # SQLite файл (создаётся автоматически, gitignored)
├── session/          # gramjs сессия (gitignored — не коммитить!)
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Важно

- `session/scraper.session` — **не коммитить** (содержит авторизацию Telegram-аккаунта)
- Scraper только **читает** каналы; отправка сообщений происходит **только вручную** через кнопку в UI
- При первом запуске scraper забирает последние 200 сообщений из каждого канала

# Запустить всё через docker-compose
docker-compose up -d --build
```

UI будет доступен на `http://YOUR_SERVER_IP`

---

## Структура проекта

```
poscrapper/
├── backend/              # Node.js: scraper + Express API
│   └── src/
│       ├── index.ts      # точка входа (express + scraper)
│       ├── scraper.ts    # gramjs NewMessage listener
│       ├── telegram.ts   # gramjs client + sendMessage
│       ├── filter.ts     # фильтр ключевых слов
│       ├── parser.ts     # парсинг email/tg/@/форм
│       ├── db.ts         # SQLite
│       └── routes/
│           ├── vacancies.ts   # GET/PATCH/POST endpoints
│           └── templates.ts   # шаблоны сообщений
├── web/                  # React + Vite + Tailwind
│   └── src/
│       ├── App.tsx
│       ├── api.ts
│       ├── types.ts
│       └── components/
│           ├── VacancyCard.tsx
│           ├── VacancyList.tsx
│           ├── StatusFilter.tsx
│           ├── TelegramModal.tsx
│           └── EmailModal.tsx
├── db/                   # SQLite файл (gitignored)
├── session/              # gramjs session (gitignored)
├── .env.example
└── docker-compose.yml
```

---

## Как работает

1. `scraper.ts` подключается к Telegram через gramjs MTProto (твой аккаунт)
2. Слушает `NewMessage` в указанных каналах
3. Фильтрует: должен быть Node/NestJS/React/Next и не должен быть junior/intern/стажёр
4. Парсит контакт из текста (email → email, @username → telegram, URL → form)
5. Сохраняет в SQLite
6. В UI видишь список с кнопками:
   - **💬 Send TG** → открывает модал с редактируемым шаблоном, отправляет через gramjs
   - **📧 Написать** → модал с email-шаблоном, открывает в почтовом клиенте
   - **🔗 Open Form** → открывает ссылку на форму

---

## Переменные окружения

| Переменная | Описание |
|---|---|
| `TG_API_ID` | Telegram App ID (my.telegram.org) |
| `TG_API_HASH` | Telegram App Hash |
| `TG_PHONE` | Номер телефона (+7...) |
| `TG_CHANNELS` | Каналы через запятую (без @) |
| `CV_LINK` | Ссылка на PDF резюме |
| `CV_EMAIL` | Email для подписи |
| `PORT` | Порт API (default: 3000) |
