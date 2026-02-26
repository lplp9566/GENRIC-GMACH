# Ahavat Chesed

Comprehensive full-stack management system for a Gemach (loans, donations, deposits, investments, monthly payments, expenses, and operations).

## Table of Contents
1. [Project Purpose](#project-purpose)
2. [Core Users and Permissions](#core-users-and-permissions)
3. [Main Functional Areas](#main-functional-areas)
4. [System Architecture](#system-architecture)
5. [Repository Structure](#repository-structure)
6. [Backend Modules](#backend-modules)
7. [Frontend Routes and Screens](#frontend-routes-and-screens)
8. [Announcements System](#announcements-system)
9. [Environment Variables](#environment-variables)
10. [Local Development](#local-development)
11. [Database and Migrations](#database-and-migrations)
12. [Common Commands](#common-commands)
13. [Production Notes](#production-notes)
14. [Troubleshooting](#troubleshooting)
15. [License](#license)

## Project Purpose
This system centralizes day-to-day Gemach operations:
- User lifecycle and membership management
- Loan origination and repayment tracking
- Donations and recurring/one-time financial flows
- Deposit and investment tracking
- Expenses and financial oversight dashboards
- Integrations (Nedarim Plus, mail notifications)
- Internal communications (system announcements + read receipts)

The project supports both **admin workflows** and **end-user self-service** screens.

## Core Users and Permissions
The system is role-based:
- `Admin`:
  - Full management access (users, loans, donations, investments, expenses, reports)
  - System operations and review actions
  - Create/manage system announcements
- `User`:
  - Personal dashboard and personal financial records
  - Access own loans/deposits/payments/donations
  - View personal announcements

Auth is JWT-based, and route guards enforce role boundaries in both backend and frontend.

## Main Functional Areas
- **Users**: profile, membership type, admin/user segmentation
- **Loans**: loan lifecycle, payments, remaining balance, actions history
- **Loan Requests**: request intake, admin approvals/status
- **Monthly Payments**: recurring member payments and debt visibility
- **Donations**: records, edits, receipts logic
- **Deposits**: deposit records + deposit actions/details
- **Investments**: investment records + transaction timelines
- **Expenses**: categorized expense tracking
- **Order Returns (Standing Orders)**: return status and related records
- **Funds Overview**: aggregate financial health dashboards and yearly summaries
- **Nedarim Plus**: external import/monitoring flows
- **Announcements**: admin broadcasts with per-recipient read state
- **Mail/Cron**: scheduled daily email operations

## System Architecture
### Backend
- Framework: **NestJS 11**
- ORM: **TypeORM**
- DB: **PostgreSQL**
- Auth: **JWT + Guards**
- Scheduling: **@nestjs/schedule**

### Frontend
- Framework: **React + TypeScript**
- Build tool: **Vite**
- UI: **MUI**
- State: **Redux Toolkit**
- Routing: **react-router-dom**

## Repository Structure
```text
.
?? back-end/      # NestJS API + TypeORM entities/migrations/modules
?? front-end/     # React admin/user application
?? .gitlab-ci.yml
?? README.md
```

## Backend Modules
From `back-end/src/modules`, the main domains are:
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
- `funds`, `funds-overview`, `funds-overview-by-year`
- `bank-current`, `cash-holdings`
- `regulation`
- `membership_roles`, `role_monthly_rates`, `user_role_history`
- `nedarim-plus`
- `announcements`
- `mail`
- `requests`

App wiring is done in `back-end/src/app.module.ts`.

## Frontend Routes and Screens
Primary routing lives in `front-end/src/App.tsx`.

### Public
- `/` login
- `/forgot-password`

### Admin area
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

### User area
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

## Announcements System
The project includes a full “system announcements” capability.

### Admin can
- Create a message with audience targeting:
  - `all`
  - `members`
  - `friends`
  - `custom` (specific users)
- View sent messages
- See read/unread recipient breakdown
- Delete a message

### User can
- View personal inbox (`/u/announcements`)
- See unread indication in navbar bell
- Messages are marked as read when opening the page (current behavior)

### Main API endpoints
- `POST /announcements`
- `GET /announcements`
- `GET /announcements/:id/recipients`
- `DELETE /announcements/:id`
- `GET /announcements/my`
- `POST /announcements/:id/read`

## Environment Variables
Create local files:
- `back-end/.env`
- `front-end/.env`

### Backend example
```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
```

### Frontend example
```env
VITE_API_URL=http://localhost:3000
```

## Local Development
Run backend and frontend in separate terminals.

### Backend
```bash
cd back-end
npm install
npm run start:dev
```

### Frontend
```bash
cd front-end
npm install
npm run dev
```

## Database and Migrations
TypeORM migrations are in `back-end/src/migrations`.

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

Important:
- `back-end/src/app.module.ts` currently has `synchronize: true`.
- For production, prefer `synchronize: false` and run migrations explicitly.

## Common Commands
### Backend (`back-end/package.json`)
- `npm run start:dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run migration:run`

### Frontend (`front-end/package.json`)
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Production Notes
- Disable TypeORM auto-sync in production.
- Keep secrets only in environment variables.
- Enforce strict CORS origins.
- Validate PostgreSQL SSL requirements for hosting provider.
- Keep cron and email credentials configured per environment.

## Troubleshooting
- If UI text appears as garbled characters, verify file encoding is UTF-8.
- If frontend shows import/export errors, restart Vite and hard refresh browser cache.
- If migrations fail, verify `DATABASE_URL` points to the correct database/user.

## License
Private internal project.
