# Youth Football Platform Summary

## 1. Executive Summary

This repository is building **BallersAdda**, a youth football platform that sits between:

- players who want to build a football profile, find academies, and join tournaments
- academies that want to register their club, manage staff, and eventually manage rosters/training
- coaches who need academy-linked profiles, player rosters, and team creation tools

At its current stage, the project is already more than a simple player website. The codebase shows a clear attempt to become a **multi-sided football ecosystem + academy operations platform**.

The current product is strongest in these areas:

- authentication and session handling
- player profile creation and update
- academy listing, filtering, detail view, and join flow
- tournament discovery with backend-backed filtering/pagination
- academy registration and coach-linking flow
- early coach onboarding and roster/team APIs

The product direction suggested by the schema and UI is much bigger:

- academy management OS
- internal player performance tracking
- attendance and session tracking
- academy plans/pricing
- staff invites and team drafting
- match and tournament stat systems
- player ranking/leaderboard style experiences

## 2. Repository Shape

The repo is effectively split into two main applications:

- `backend/`
  - Express API
  - Prisma ORM
  - PostgreSQL data model
  - cookie-based JWT auth
  - Redis caching
  - Google OAuth

- `youth-football-website/`
  - React 19 + Vite frontend
  - Redux Toolkit + RTK Query
  - Tailwind CSS v4
  - Framer Motion-heavy UI
  - player-facing and coach-facing flows

There are about **95 relevant project files** outside `node_modules`, but most business logic lives in:

- `backend/src`
- `backend/prisma/schema.prisma`
- `youth-football-website/src`
- `youth-football-website/src/redux`

## 3. What The Platform Is Trying To Be

The clearest reading of the codebase is:

> A football talent and academy platform where players build profiles, discover academies, join them, enter tournaments, and eventually get measured on attendance, stats, ranks, and academy performance, while academies and coaches manage rosters, staff, schedules, teams, and memberships.

This is supported by both the frontend experience and the database model.

### Core business entities in the Prisma schema

- `User`
  - base identity for every person
  - roles: `PLAYER`, `ACADEMY`, `COACH`, `SCOUT`, `ADMIN`

- `PlayerProfile`
  - player bio, physical data, playing position, dominant foot, experience level, rankings, ratings

- `Academy`
  - academy identity, contact details, address, logo, verification state, owner linkage

- `Coach`
  - coach profile tied to user and optionally to an academy

- `Tournament`
  - public competitions with pricing, capacity, registration deadline, organizer, category, status

- `Team`
  - academy/coach-created teams linked to tournaments

- `PlayerTournament`
  - player participation in tournaments plus stats like goals, assists, cards, rating

- `AcademyPlan`
  - academy pricing plans / membership plans

- `AcademySchedule`
  - recurring training schedule by weekday

- `AcademyPicture`
  - image gallery and primary academy picture

- `AcademySession` and `SessionAttendance`
  - training/session attendance model

- `PlayerAcademyStats`
  - academy-specific stats for official and practice matches

- `Match`
  - distinguishes `OFFICIAL_TOURNAMENT` vs `INTERNAL_PRACTICE`

- `AcademyInvite`
  - pending invite flow for staff, currently focused on coaches

This schema is the strongest indicator that the long-term product is meant to go beyond discovery into **day-to-day academy operations and player development tracking**.

## 4. Backend Analysis (`backend/`)

## 4.1 Stack and Architecture

- `Express 5`
- `Prisma` for database access
- `PostgreSQL` as the main datastore
- `ioredis` for cache reads/writes
- `passport-google-oauth20` for Google sign-in
- `jsonwebtoken` + cookies for auth

Main entry point:

- `backend/src/server.js`

Mounted route groups:

- `/api/v1/auth`
- `/api/v1/player`
- `/api/v1/academy`
- `/api/v1/tournament`
- `/api/v1/coach`

## 4.2 Auth Model

Auth is one of the more complete parts of the backend.

Implemented behavior:

- email/password registration
- email/password login
- Google OAuth login
- JWT access token via cookie
- JWT refresh token via cookie
- verify current session
- logout
- fetch basic user profile
- check if an email already exists

Important implementation details:

- access token lifetime: 15 minutes
- refresh token lifetime: 7 days
- both tokens are stored in `httpOnly` cookies
- frontend requests use `credentials: include`

Relevant files:

- `backend/src/controllers/authControllers.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/config/passportConfig.js`

## 4.3 Backend Features Already Implemented

### A. Player features

Implemented API support:

- create player profile
- update player profile
- fetch player profile
- fetch the player's academy details
- join an academy

Relevant file:

- `backend/src/controllers/playerController.js`

Notes:

- input validation is reasonably solid for age, height, weight, gender, position, dominant foot
- player profile fetch is cached in Redis
- player profile includes joined tournaments

### B. Academy features

Implemented API support:

- list academies with pagination
- fetch academy detail by ID
- filter academies by city/rating
- register a new academy

Relevant file:

- `backend/src/controllers/academyControllers.js`

Academy registration is especially important because it reveals the B2B direction:

- current user can become an academy owner
- user role is upgraded to `ACADEMY`
- existing users entered as coach emails can be upgraded/linked
- missing users create `AcademyInvite` records
- updated role causes new auth cookies to be issued

### C. Tournament features

Implemented API support:

- paginated tournament listing
- filters by status/location/category
- sorting by date or prize

Relevant file:

- `backend/src/controllers/tournamentsController.js`

### D. Coach features

Implemented API support:

- fetch coach profile
- update coach profile
- fetch academy roster
- create a team for a tournament

Relevant file:

- `backend/src/controllers/coachControllers.js`

This tells us coaches are meant to be operational users, not just display-only profiles.

## 4.4 Caching

Redis caching is used for:

- player profile
- academy list
- academy details
- filtered academy results
- tournament list

Relevant files:

- `backend/src/config/redisClient.js`
- `backend/src/config/cacheUtils.js`

This suggests the app expects public-ish listing/detail traffic and is already thinking about read performance.

## 4.5 Backend Maturity Assessment

The backend is conceptually ambitious and the schema is ahead of the currently exposed APIs.

Already production-shaped:

- auth flow design
- Prisma schema depth
- API route organization
- pagination/filtering patterns
- Redis abstraction

Still partially implemented:

- attendance/session workflows
- academy stats workflows
- match workflows
- real invite acceptance flow
- tournament registration beyond discovery
- academy owner dashboard behavior

## 5. Frontend Analysis (`youth-football-website/`)

## 5.1 Stack and State Management

- `React 19`
- `Vite`
- `Tailwind CSS v4`
- `Framer Motion`
- `Redux Toolkit`
- `RTK Query` for academy/coach/tournament APIs
- custom Axios instance with refresh-token retry behavior

Important files:

- `src/App.jsx`
- `src/api/axios.js`
- `src/redux/store.js`
- `src/redux/slices/*`
- `vite.config.js`

Frontend dev server proxies `/api` to `http://localhost:4000`, so the intended dev setup is:

- frontend on `5173`
- backend on `4000` via env

## 5.2 Frontend Route Structure

### Public routes

- `/`
  - landing page
- `/Register`
  - signup
- `/Login`
  - login
- `/auth/success`
  - Google auth completion

### Protected routes

- `/home`
- `/tournaments`
- `/profile`
- `/profile-complete`
- `/academies`
- `/academy/details/:id`
- `/test`
- `/academy/payment/:id`
- `/my-academy`
- `/register-academy`
- `/coach-setup`
- `/coach-dashboard`

Protected pages are wrapped with:

- `src/ProtectedRoutes/ProtectedRoute.jsx`
- `src/components/AppLayout.jsx`

## 5.3 Frontend Features Already Implemented

### A. Public marketing site

The landing page includes:

- brand-led hero
- tournament teaser
- academy teaser
- CTA
- footer

Relevant files:

- `src/pages/LandingPage.jsx`
- `src/LandingComponents/*`

This is mostly marketing/scaffold content rather than data-connected content.

### B. Auth flows

Implemented UI:

- email/password registration
- email/password login
- Google login redirect
- OTP/phone UI shells
- auth success sync page

Relevant files:

- `src/pages/SignUp.jsx`
- `src/pages/LoginPage.jsx`
- `src/LoggedInPages/AuthSuccess.jsx`
- `src/LandingComponents/OTP.jsx`

What is real vs placeholder:

- email/password is real
- Google is real
- phone/OTP UI is present but not backed by the backend

### C. Player onboarding and profile

Implemented UI:

- player profile completion wizard
- player profile view
- profile editing modal
- academy section in profile
- tournament history section in profile
- settings / dark mode

Relevant files:

- `src/pages/CompleteProfilePage.jsx`
- `src/pages/ProfilePage.jsx`
- `src/ProfilePageComponents/PlayerProfilePage.jsx`

What is real:

- create profile
- update profile
- load academy details
- logout

What is partly real / partly visual:

- profile page is real for core fields
- some stats, achievements, and parts of the profile experience are still placeholder-like

### D. Home dashboard

The home dashboard is player-facing and polished visually.

It currently provides:

- welcome hero
- player card concept
- academy membership status
- quick CTAs to tournaments and academies
- tournament teaser cards
- regional leaderboard UI

Relevant file:

- `src/HomeComponents/HeroHome.jsx`

Important note:

- much of this page is **UI-led with mock/hardcoded performance content**
- it is not yet fully driven by backend metrics

### E. Academy browsing and academy detail

Implemented UI:

- academy listing page
- academy filtering
- pagination
- academy detail page
- academy gallery/schedule/pricing/coaches layout
- academy join CTA

Relevant files:

- `src/AcademyPageComponents/*`
- `src/pages/AcademyPage.jsx`
- `src/pages/AcademyViewPage.jsx`
- `src/AcademyDetailsPage/*`

What is real:

- academy list API
- academy detail API
- academy filter API

What is partly visual:

- some academy card/detail fields use fallback or hardcoded values
- several UI assumptions do not perfectly match backend response shape yet

### F. Join academy / payment flow

Implemented UI:

- checkout-like payment page
- fake card form validation
- processing state
- success state

Relevant file:

- `src/pages/PaymentPage.jsx`

Real backend behavior:

- after fake payment delay, the page calls `joinAcademy`
- no real payment gateway exists yet

So this is currently a **simulated payment + real academy join mutation**.

### G. Academy registration flow

This is one of the clearest product-defining flows in the repo.

Implemented UI:

- multi-step academy registration form
- academy identity and contact details
- number of coaches
- coach email validation against backend
- success state

Relevant file:

- `src/pages/AcademyRegistration.jsx`

Real backend behavior:

- academy creation
- user role upgrade to academy owner
- coach linking or invite creation

This is the strongest proof that the app is moving toward a **B2B academy onboarding workflow**, not just a player browsing app.

### H. Coach setup and coach dashboard

Implemented UI:

- coach setup page for incomplete coach profiles
- coach dashboard shell
- academy roster view
- tabbed layout for roster/teams/stats

Relevant files:

- `src/pages/CoachSetupPage.jsx`
- `src/pages/CoachDashboard.jsx`
- `src/redux/slices/coachSlice.js`

What is real:

- coach profile fetch/update
- roster fetch
- create team API exists

What is not fully realized yet:

- no complete academy owner dashboard
- no full team drafting workflow in UI
- some coach dashboard tabs are mostly scaffolding

### I. Tournament browsing

Implemented UI:

- hero section
- search
- status filters
- sorting
- grid/list toggle
- pagination

Relevant files:

- `src/TournamentComponents/TournamentPage.jsx`
- `src/redux/slices/tournamentSlice.js`

This page is one of the more fully connected frontend surfaces after auth and academy discovery.

## 6. What Is Clearly Implemented Today

If I reduce the repo to "what can already be demonstrated as implemented," it is this:

### Real backend + real frontend flows

- register/login/logout with cookies
- Google sign-in callback flow
- verify auth session on protected pages
- create and update player profile
- show player profile data
- browse academies with pagination
- filter academies by city/rating
- view academy details
- simulate payment and actually join an academy
- browse tournaments with backend filters and pagination
- register an academy as an owner
- pre-link or invite coaches during academy registration
- complete coach profile
- fetch coach profile and academy roster

### Strongly designed, but still partly mocked or incomplete

- player home dashboard stats
- player academy dashboard analytics
- player achievements / badges
- academy coach cards and some academy detail visuals
- tournament registration action beyond browsing
- academy operations dashboard for owners
- coach teams/stats UI
- phone/OTP auth

## 7. What You Are Trying To Build (Inferred Product Direction)

The codebase is pointing toward a platform with **three layers**:

### Layer 1: Marketplace / discovery

- players discover academies
- players discover tournaments
- academies gain visibility
- coaches become part of academy staffing

### Layer 2: Identity and progression

- each player has a football profile
- players track participation, rankings, badges, ratings
- academy membership becomes part of player identity

### Layer 3: Academy operating system

- academy owner onboarding
- coach invitations and linking
- pricing plans
- schedules
- training sessions and attendance
- team creation
- academy-specific stats
- practice vs official match separation

That third layer is not fully exposed in the UI yet, but the schema makes the intent very clear.

## 8. Current Gaps, Mismatches, and In-Progress Areas

This section is important because it explains why some parts feel "implemented" while still not fully cohesive.

### A. Backend and frontend are not fully aligned everywhere

Examples:

- `CoachDashboard` and academy detail coach cards expect fields like `coach.image`, `coach.name`, `coach.role`, `coach.exp`, but the backend returns `firstName`, `lastName`, `profilePicLogo`, `experienceYears`
- `AcademyDetailsPage/Right-Card.jsx` reads `ACADEMY_DATA.pricing` instead of `ACADEMY_DATA.academy.pricing`
- `AcademyResults.jsx` grid mode expects `academy.image`, but backend academy records expose `academyLogoURL`
- `PlayerProfilePage` uses `player.ratings`, while schema/backend really distinguish `trainingRatings` and `tournamentRatings`

### B. Some routes and navigation paths are stale

Examples:

- academy registration success navigates to `/dashboard`, but that route does not exist
- landing header links to `/academy`, `/host`, and mobile nav links to `/community`, but those routes do not exist in `App.jsx`
- `AcademyList.jsx` looks like an older static page and is not actually routed

### C. Some business logic is scaffolded but not fully working yet

Examples:

- payment flow is simulated, not integrated with a real payment gateway
- tournament registration button is UI-only
- phone/OTP auth is UI-only
- academy owner dashboard is implied but not delivered
- coach team creation exists in the backend, but the dashboard does not yet expose a complete drafting flow

### D. Some backend code suggests unfinished integration

Examples:

- `getAcademyRoster` includes `metrics: true`, but there is no `metrics` relation in the Prisma schema
- `getCoachProfile` checks `req.user.role`, but JWT middleware currently stores only `{ id }` on `req.user`
- there are experimental files like `backend/src/redis-test/*`

### E. A lot of the future product is already modeled in Prisma but not yet surfaced

Examples:

- sessions
- attendance
- academy stats
- matches
- staff invites lifecycle
- academy pictures/media management
- academy plans/pricing management

## 9. Folder-by-Folder Intent

## `backend/`

This folder is trying to become the **core business API** and domain model for the platform.

Best way to think about it:

- identity + auth service
- football domain model
- academy operations data layer
- coach/team/tournament backend

## `youth-football-website/`

This folder is trying to become the **main user-facing application** with:

- public marketing pages
- player app
- academy discovery
- tournament discovery
- coach onboarding and roster experience
- early B2B academy onboarding

## 10. Verification Notes

I did a lightweight verification pass while analyzing the repo:

- frontend production build succeeds with `npm run build`
- the frontend bundle is large, and Vite warns about chunk size
- backend source files parse successfully with `node --check`
- there are effectively **no real automated tests** in the repo right now
- the only obvious test-like file is `youth-football-website/src/AcademyDetailsPage/test-api.jsx`

## 11. Final Read On The Product

If I had to describe the project in one sentence:

**You are building a youth football platform that starts as a player discovery/profile app, but is clearly evolving into a full academy and coach management ecosystem with tournaments, memberships, attendance, and performance tracking.**

If I had to describe the current maturity in one sentence:

**Authentication, player profile basics, academy discovery, tournament browsing, academy registration, and early coach onboarding are implemented; academy operations and performance intelligence are modeled well but still partly scaffolded.**
