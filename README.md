# Ahavat Chesed

> Full-stack Gemach management platform built with NestJS, PostgreSQL, React, and TypeScript.

## Quick Navigation
- [Project Summary](#project-summary)
- [Core Roles](#core-roles)
- [Functional Domains](#functional-domains)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Backend Modules](#backend-modules)
- [Frontend Routes](#frontend-routes)
- [Announcements (System Messages)](#announcements-system-messages)
- [Environment Setup](#environment-setup)
- [Run Locally](#run-locally)
- [Database & Migrations](#database--migrations)
- [Scripts Reference](#scripts-reference)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

## Project Summary
Ahavat Chesed centralizes all core Gemach operations in one system:
- User lifecycle and membership segmentation
- Loan creation, repayment, and balance tracking
- Donations, deposits, investments, and expenses
- Monthly financial flows and standing order returns
- Operational dashboards and yearly summaries
- Nedarim Plus integrations
- Internal announcements with read receipts

The platform includes dedicated admin and user experiences with permission-based access.

## Core Roles
| Role | Access Scope |
|---|---|
| `Admin` | Full management across users, loans, finance domains, reports, and announcements |
| `User` | Personal dashboard and personal financial/communication records |

Authentication is JWT-based and guarded by backend and frontend route protections.

## Functional Domains
| Domain | Description |
|---|---|
| Users | Profiles, membership type, role separation |
| Loans | Loan lifecycle, repayments, loan actions |
| Loan Requests | Intake and admin approval process |
| Monthly Payments | Recurring obligations and debt status |
| Donations | Donation records and receipt-related flows |
| Deposits | Deposit records + detailed actions |
| Investments | Investment records + transaction history |
| Expenses | Categorized expense management |
| Standing Orders | Return/collection tracking |
| Funds Overview | Financial summary and annual dashboards |
| Nedarim Plus | External credit/collection integration flows |
| Announcements | Broadcast messages + read/unread status |
| Mail/Cron | Scheduled daily notifications and automation |

## Architecture
### Backend
- NestJS 11
- TypeORM
- PostgreSQL
- JWT + Guards
- `@nestjs/schedule`

### Frontend
- React + TypeScript
- Vite
- MUI
- Redux Toolkit
- React Router

## Repository Layout
```text
.
?? back-end/      # NestJS API, modules, entities, migrations
?? front-end/     # React app (admin + user)
?? .gitlab-ci.yml
?? README.md
```

## Backend Modules
Located in `back-end/src/modules`:
- `auth`
- `users`
- `loans`
- `loan-requests`
- `monthly_deposits`
- `donations`
- `deposits`
- `investments`
- `expenses`
- `order-return`
- `funds`
- `funds-overview`
- `funds-overview-by-year`
- `bank-current`
- `cash-holdings`
- `regulation`
- `membership_roles`
- `role_monthly_rates`
- `user_role_history`
- `nedarim-plus`
- `announcements`
- `mail`
- `requests`

Main Nest application composition: `back-end/src/app.module.ts`.

## Frontend Routes
Main route config: `front-end/src/App.tsx`.

### Public
- `/` (login)
- `/forgot-password`

### Admin
- `/home`
- `/users`, `/users/new`
- `/loans`, `/loans/new`, `/loans/:id`
- `/loan-requests`
- `/paymentsPage`
- `/donations`
- `/deposits`, `/deposit/:id`
- `/investments`, `/investments/:id`
- `/expenses`
- `/standing-orders`
- `/funds`, `/FundsOverviewByYear`
- `/nedarim-plus`
- `/announcements`

### User
- `/u`
- `/u/profile`
- `/u/loans`
- `/u/loan-requests`
- `/u/deposits`
- `/u/overview`
- `/u/payments`
- `/u/donations`
- `/u/standing-orders`
- `/u/statistics`
- `/u/announcements`

## Announcements (System Messages)
### Admin capabilities
- Create message with audience targeting:
  - `all`
  - `members`
  - `friends`
  - `custom` (specific users)
- View sent announcements
- Inspect read/unread per recipient
- Delete announcement

### User capabilities
- View personal inbox (`/u/announcements`)
- See unread indicator in navbar bell
- Messages are auto-marked as read on page entry (current behavior)

### API endpoints
- `POST /announcements`
- `GET /announcements`
- `GET /announcements/:id/recipients`
- `DELETE /announcements/:id`
- `GET /announcements/my`
- `POST /announcements/:id/read`

## Environment Setup
Create local env files:
- `back-end/.env`
- `front-end/.env`

### Backend `.env` (example)
```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
```

### Frontend `.env` (example)
```env
VITE_API_URL=http://localhost:3000
```

## Run Locally
Use two terminals.

### 1) Backend
```bash
cd back-end
npm install
npm run start:dev
```

### 2) Frontend
```bash
cd front-end
npm install
npm run dev
```

## Database & Migrations
Migrations folder: `back-end/src/migrations`.

Run migrations:
```bash
cd back-end
npm run migration:run
```

Generate migration:
```bash
cd back-end
npm run migration:generate -- src/migrations/<migration-name>
```

Current note:
- `back-end/src/app.module.ts` currently includes `synchronize: true`.
- For production, use `synchronize: false` and run migrations explicitly.

## Scripts Reference
### Backend (`back-end/package.json`)
| Command | Purpose |
|---|---|
| `npm run start:dev` | Run API in watch mode |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Lint + fix |
| `npm run test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run migration:run` | Run DB migrations |

### Frontend (`front-end/package.json`)
| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run lint` | Lint project |
| `npm run preview` | Preview production build |

## Production Checklist
- Disable TypeORM auto-sync.
- Keep secrets strictly in env vars.
- Restrict CORS origins.
- Verify PostgreSQL SSL requirements.
- Configure scheduler/mail credentials per environment.
- Run migrations as part of deployment pipeline.

## Troubleshooting
- Garbled Hebrew text: ensure UTF-8 file encoding.
- Frontend import/export runtime error: restart Vite and hard refresh.
- Migration failures: validate `DATABASE_URL`, DB permissions, and migration order.

## License
Private internal project.
