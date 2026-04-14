# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Youth football platform ("BallersAdda") — a full-stack app for tournament registration, academy management, player profiles, and coach dashboards.

## Commands

### Backend (`/backend`)
```bash
npm run dev      # Start Express server with hot-reload (node --watch --env-file=.env ./src/server.js)
```

### Frontend (`/youth-football-website`)
```bash
npm run dev      # Start Vite dev server on http://localhost:5173
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### Database
```bash
# Run from /backend
npx prisma migrate dev    # Create and apply a new migration
npx prisma studio         # Open Prisma Studio GUI
npx prisma generate       # Regenerate Prisma client after schema changes
```

## Architecture

### Backend (`backend/src/`)
Express 5 REST API running on port 4000. Five route groups all prefixed `/api/v1/`:
- `/auth` — JWT login/register + Google OAuth (Passport)
- `/player`, `/academy`, `/coach`, `/tournament` — domain resources

**Key files:**
- `server.js` — app entry, middleware, route mounting, Passport init
- `prismaClient.js` — shared Prisma instance (import from here, don't create new instances)
- `middleware/authMiddleware.js` — `verifyAccessToken` (JWT cookie check) + `isCoach` role guard
- `config/redisClient.js` + `config/cacheUtils.js` — ioredis client and cache helpers (get/invalidate/del)
- `config/passportConfig.js` — Google OAuth strategy

**Auth flow:** Bcrypt-hashed passwords; access token (15 min) + refresh token (7 days) stored in HttpOnly cookies.

### Frontend (`youth-football-website/src/`)
React 19 SPA built with Vite. Vite proxies `/api` → `http://localhost:4000`.

**State management:** Redux Toolkit with:
- `authSlice` — current user, login/logout
- `themeSlice` — light/dark mode
- `playerSlice` — player profile state
- RTK Query APIs — `academyApi`, `tournamentApi`, `coachApi` (in `redux/`)

**Routing** (`App.jsx`): Public routes (Landing, Login, SignUp) + protected routes wrapped in `AppLayout` (sidebar + nav). Protected pages: Academy dashboards, Coach dashboard, Player profile, Tournaments.

**Page/component convention:** Feature folders under `src/` (e.g., `TournamentRegistrationPage/`, `AcademyPageComponents/`) contain both the page component and its sub-components.

### Database (PostgreSQL — "BallersAdda")
Managed via Prisma. Core models:
- `User` — base auth entity; role enum: `PLAYER | ACADEMY | COACH | SCOUT | ADMIN | ORGANIZER`
- `PlayerProfile` — stats, position, experience level, badges/ratings
- `Academy` — institution with plans (`AcademyPlan`), sessions (`AcademySession`), coaches, players
- `Coach` — linked to Academy, certifications
- `Tournament` — teams, matches, player registrations; status: `UPCOMING | ONGOING | COMPLETED`
- `Team` — squad (academy-based or captain-created), tied to a tournament
- `TeamInvite` — email-based invites with status: `PENDING | ACCEPTED | DECLINED | EXPIRED`
- `Match` — official or practice matches with scores
- `PlayerAcademyStats` — per-academy career stats (caps, goals, assists, ratings)

### Environment Variables (backend `.env`)
```
PORT=4000
ACCESS_TOKEN_JWT_SECRET=
REFRESH_TOKEN_JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback
DATABASE_URL=postgresql://...
REDIS_HOST=127.0.0.1   # optional, defaults to 127.0.0.1
REDIS_PORT=6379         # optional, defaults to 6379
CLIENT_URL=http://localhost:5173  # optional
```
Backend uses `--env-file=.env` (Node built-in), not `dotenv`. Frontend has no `.env`; API base URL is configured via the Vite proxy.
