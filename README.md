# Life Board

Личный планировщик времени с проактивным ИИ-ассистентом. Раскладывает задачи по реальному свободному времени в календаре и ведёт к сроку через Telegram. Проектируется под тех, кто систематически не укладывается в дедлайны и у кого задачи из разных сфер жизни конкурируют за одно время.

Self-host, один пользователь на инсталляцию.

## Документы

| Документ | Что внутри |
|---|---|
| [Одностраничник](docs/ONE-PAGER.md) · [PDF](docs/ONE-PAGER.pdf) | Проблема, аудитория, как работает, чем отличается |
| [PRD](docs/PRD.md) | Проблема и обоснование, бизнес-цели и метрики, аудитория, возможности с приоритетами, риски |
| [SRS](docs/SRS.md) | Требования к MVP: 41 функциональное и 16 нефункциональных с критериями приёмки, бизнес-правила, интерфейсы |
| [User Stories](docs/USER-STORIES.md) | 24 истории в 7 эпиках, критерии «Дано / Когда / Тогда» |
| [RTM](docs/RTM.md) | Трассировка цели → истории → требования → тест-кейсы, статусы реализации |
| [Архитектура](docs/ARCHITECTURE.md) | Процессы, сценарии запуска, агент, модель данных, развёртывание |
| [База данных](docs/DATABASE.md) | ER-диаграмма, группы таблиц, правила связей |

## Архитектура

pnpm-монорепозиторий по образцу solvehub: Next.js и Gravity UI на фронте, NestJS и tRPC на бэке, PostgreSQL и Prisma, ИИ-агент на Claude Agent SDK, внешние инструменты как MCP-модули. Подробно в [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```
frontend/      Next.js + Gravity UI + tRPC
backend/       NestJS: tRPC, SSE, WebSocket для раннеров
workers/       Telegram, синхронизация CalDAV, напоминания, прогоны агента
modules/       MCP-модули: браузер, рабочий трекер
runner/        агент на машине владельца
packages/      common, db (Prisma), nest-common, agent
deploy/        compose, Caddy, установщик, CLI lifeboard
mvp/           рабочий MVP-срез из домашних заданий
docs/          продуктовая и техническая документация
```

## Статус

Целевая архитектура описана и заложена скелетом: модули, контракты, схема данных, точки входа. Работает **MVP-срез** в [mvp/](mvp/): разделы и задачи с CRUD, веб-интерфейс, PostgreSQL, 16 автотестов, развёртывание в Docker Compose и Kubernetes. Статусы требований — в [RTM](docs/RTM.md).

## Разработка

```bash
corepack pnpm install
pnpm db:generate
pnpm typecheck
```

## Установка (целевая)

```bash
curl -fsSL https://github.com/vvs-code/life-board/releases/latest/download/install.sh | sh -s -- --domain life.example.com
```

## Автор

Веселов Владислав
