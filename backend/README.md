# CareShift API

Node.js + Express + TypeScript + PostgreSQL (via Prisma) backend for the CareShift app.
Covers **auth, nurses, shifts/schedule, leave requests, and availability** — the "core"
pass. Coverage-analytics breakdowns and report generation on the app side still use local
mock data for now (see the note at the bottom).

This is a **simple/demo auth setup**, as requested: bcrypt-hashed passwords and a signed JWT,
but no refresh-token rotation, no email verification, no rate limiting, no password reset
flow. Don't ship this auth layer to production as-is.

## 1. Start Postgres

The easiest path is Docker:

```bash
cd backend
docker compose up -d
```

This starts Postgres on `localhost:5432` with a `careshift` database/user/password already
matching `.env.example`. No Docker? Install Postgres yourself and update `DATABASE_URL`
accordingly.

## 2. Configure environment

```bash
cp .env.example .env
```

The defaults already match the docker-compose setup, so you likely don't need to change
anything for local dev.

## 3. Install, migrate, seed

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

This creates the schema and seeds demo data:

- **HR login:** `victoria.mensah@hospital.com` / `password123`
- **Nurse login:** `sarah.johnson@hospital.com` / `password123` (7 other nurses are seeded
  too, same password)

## 4. Run the server

```bash
npm run dev
```

Runs on `http://localhost:4000` by default. Check `http://localhost:4000/api/health`.

## API overview

| Method | Path | Who | What |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | create account (`role: "NURSE" \| "HR"`) |
| POST | `/api/auth/login` | anyone | returns `{ token, user }` |
| GET | `/api/auth/me` | authed | current user |
| GET | `/api/nurses?search=&ward=` | HR | staff directory |
| GET | `/api/nurses/:id` | HR, or self | nurse detail |
| POST | `/api/nurses` | HR | add a nurse |
| PATCH | `/api/nurses/:id` | HR | update status/ward/phone |
| GET | `/api/shifts/me` | nurse | own shifts, current week |
| GET | `/api/shifts?start=&end=&nurseId=` | authed | shifts in a date range |
| GET | `/api/shifts/:id` | owner or HR | shift detail |
| GET | `/api/shifts/coverage/week?start=` | HR | 7-day × 3-shift coverage grid |
| POST | `/api/shifts` | HR | assign a shift |
| DELETE | `/api/shifts/:id` | HR | remove a shift |
| GET | `/api/leave?status=` | nurse (own) / HR (all) | leave requests |
| GET | `/api/leave/:id` | owner or HR | leave request detail |
| POST | `/api/leave` | nurse | apply for leave |
| PATCH | `/api/leave/:id` | HR | `{ status: "APPROVED" \| "REJECTED" }` |
| GET | `/api/availability/me` | nurse | weekly availability |
| PUT | `/api/availability/me` | nurse | save weekly availability |
| GET | `/api/stats/hr` | HR | aggregated HR dashboard numbers |

All routes except `/api/auth/*` and `/api/health` require `Authorization: Bearer <token>`.

## Not covered yet

- **Shift Requirements** (per-ward staffing targets) are fixed constants in
  `src/utils/coverage.ts`, not an editable resource — there's no admin UI for these in the
  app either yet.
- **Coverage Analytics breakdown / Reports / nurse hours-worked charts** are not backed by
  real endpoints — the app still shows mock numbers there, matching what you asked to leave
  for a later pass.
- **Leave balance** (days used/remaining) shown on the nurse dashboard is still a static
  mock number — it isn't derived from approved `LeaveRequest` rows yet.

## Useful commands

- `npx prisma studio` — visual DB browser
- `npx prisma migrate dev` — after changing `schema.prisma`
- `npm run build && npm start` — production-style run (no ts-node)
