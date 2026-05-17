# Critical Fixes Log

Tracking all critical security fixes applied to the backend.

---

## C1: Remove verification token from registration response
**File:** `src/controllers/authControllers.js:122-127`
**Issue:** `rawToken` returned in JSON response — attacker can verify any account without email access.
**Fix:** Removed `rawToken` from the response object. Token now only delivered via verification email.

---

## C2: JWT secret validation at startup
**File:** `src/server.js` (top of file)
**Issue:** JWT secrets were `my_secret_key` / `my_refresh_secret_key` — trivially guessable, complete auth bypass.
**Fix:** Added startup validation that:
- Checks all required env vars exist (`ACCESS_TOKEN_JWT_SECRET`, `REFRESH_TOKEN_JWT_SECRET`, `DATABASE_URL`) — exits with error if missing.
- Detects known-weak JWT secrets and logs a fatal warning. In production (`NODE_ENV=production`), the process exits immediately.
- **Action needed:** Generate real secrets with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and update `.env`.

---

## C3: Credential rotation (manual action required)
**Issue:** Real credentials in `.env` — Google OAuth, Cloudinary, SMTP, Razorpay, DB password all exposed.
**Fix:** No code change — this requires manual credential rotation:
1. Generate new JWT secrets (see C2)
2. Rotate Google OAuth client secret
3. Rotate Cloudinary API secret
4. Rotate SMTP app password
5. Change database password (current: 8-digit number)
6. Rotate Razorpay key/secret
7. Rotate Google Maps API key

---

## C4: Mount CSRF middleware globally
**File:** `src/server.js` (before route mounting)
**Issue:** `requireCsrfHeader` was imported in `authRoutes.js` but never called — all state-changing endpoints vulnerable to CSRF.
**Fix:**
- Mounted CSRF middleware globally in `server.js` for all routes, with explicit skip for `/api/v1/payment/webhook` (uses its own signature verification).
- Removed unused `requireCsrfHeader` import from `authRoutes.js`.
- Removed redundant `cookieParser()` from `authRoutes.js` (already global).
- **Frontend note:** All mutating requests (POST/PUT/PATCH/DELETE) must now include the header `X-Requested-With: XMLHttpRequest`. If using axios, add this to defaults.

---

## C5: Add rate limiter to register endpoint
**File:** `src/routes/authRoutes.js:36`
**Issue:** `registerLimiter` existed but was never applied — enabled spam registration, email enumeration, and email flooding.
**Fix:** Added `registerLimiter` middleware to the register route.

---

## C6: Fix hardcoded OAuth failure redirect
**File:** `src/routes/authRoutes.js:45`
**Issue:** OAuth failure redirect was hardcoded to `http://localhost:5173/Login` — breaks in production.
**Fix:** Changed to `${process.env.CLIENT_URL || 'http://localhost:5173'}/Login`.

---

## C7: Use timing-safe comparison for payment signatures
**File:** `src/controllers/paymentController.js` (3 locations)
**Issue:** Used `!==` for HMAC signature comparison — vulnerable to timing attacks that could forge payment confirmations.
**Fix:**
- Added `safeCompareHex()` helper using `crypto.timingSafeEqual` with Buffer length check.
- Replaced all 3 occurrences:
  - `verifyAcademyPayment` (line ~146)
  - `handleWebhook` (line ~255)
  - `verifyTournamentPayment` (line ~449)

---

## C8: Add body size limits for uploads
**Files:** `src/server.js`, `src/controllers/playerController.js`
**Issue:** Global JSON limit was 50MB, no validation on base64 image size — single request could consume 50MB of server memory (DoS vector).
**Fix:**
- Reduced global `express.json()` limit from `50mb` to `10mb`.
- Reduced global `urlencoded()` limit from `50mb` to `10mb`.
- Added explicit 5MB check in `uploadProfilePic` before passing to Cloudinary — returns 413 if exceeded.

---

## C9: Fix coach controller creating separate PrismaClient
**File:** `src/controllers/coachControllers.js:1-3`
**Issue:** Created `new PrismaClient()` instead of using shared singleton — separate connection pool, risks exhausting DB connections under load.
**Fix:** Replaced with `import prisma from '../prismaClient.js'`.

---

## Bonus fixes applied alongside criticals

### Webhook JSON.parse safety
**File:** `src/server.js` (webhook raw body handler)
**Issue:** `JSON.parse(req.body)` could throw on malformed webhook payload, crashing the request.
**Fix:** Wrapped in try/catch, returns 400 on parse failure.

### PORT default alignment
**File:** `src/server.js:17`
**Issue:** Default port was `3000` but CLAUDE.md says `4000`.
**Fix:** Changed fallback to `4000`.

---
---

# Medium Fixes Log

---

## M1: Extract shared pagination utility
**Files:** `src/lib/pagination.js` (new), `src/controllers/academyControllers.js`, `src/controllers/tournamentsController.js`, `src/controllers/leaderboardController.js`
**Issue:** `parsePagination` and `paginationMeta` were copy-pasted across 3 controllers.
**Fix:**
- Created `src/lib/pagination.js` with both helpers. Accepts optional `defaultLimit` param (defaults to 10).
- Replaced inline definitions in all 3 controllers with imports.
- Leaderboard calls pass `defaultLimit: 20` to preserve existing behavior.

---

## M2: Add missing `return` before error responses in coach controller
**File:** `src/controllers/coachControllers.js` (4 catch blocks)
**Issue:** `res.status(500).json(...)` in catch blocks had no `return` — code after catch could continue executing, risking "headers already sent" crashes.
**Fix:** Added `return` before all 4 error responses in `getCoachProfile`, `updateCoachProfile`, `getAcademyRoster`, `createTeam`.

---

## M3: Remove unused dependencies
**File:** `package.json`
**Issue:** 6 packages imported but never used in any source file — increases attack surface and install size.
**Fix:** Uninstalled `kafkajs`, `motion`, `date-fn`, `dotted-map`, `axios`, `pg`. Kept `dotenv` (needed for production deployment).

---

## M4: Wrap gamificationController functions in try/catch
**File:** `src/controllers/gamificationController.js` (5 functions)
**Issue:** `getAchievements`, `getUnreadAchievements`, `markAchievementsRead`, `subscribePush`, `unsubscribePush` had no try/catch. Any Prisma error would crash as unhandled promise rejection.
**Fix:** Wrapped all 5 functions in try/catch with proper 500 error responses.

---

## M5: Fix playerTournament query using wrong ID + cache poisoning
**File:** `src/controllers/tournamentsController.js`
**Issue (bug):** `playerTournament.findMany` used `playerId: userId` but `playerId` references `PlayerProfile.id`, not `User.id`. Query always returned wrong results.
**Issue (cache):** User-specific `playerTournament` data was inside the shared cache callback — first user's data served to everyone.
**Fix:**
- Changed query to `where: { player: { userId } }` (joins through the relation).
- Moved `playerTournament` query outside the `cacheGet` callback so it runs per-request. Only tournament list + pagination is cached.

---

## M7: Change updatePlayerProfile from POST to PATCH
**Files:** `src/routes/playerRoutes.js`, `youth-football-website/src/redux/slices/playerSlice.js`
**Issue:** Partial update endpoint used `POST` instead of `PATCH` — violates REST conventions.
**Fix:** Changed route from `router.post` to `router.patch`. Updated frontend `api.post` to `api.patch` to match.

---

## M8: Webhook rawBody JSON.parse safety
Already fixed alongside critical fixes (see bonus section above).

---

## M9: Add User relation to PushSubscription in Prisma schema
**File:** `prisma/schema.prisma`
**Issue:** `PushSubscription.userId` had no `@relation` — no referential integrity, no cascading deletes, can't use Prisma relation queries.
**Fix:**
- Added `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` to `PushSubscription`.
- Added `pushSubscriptions PushSubscription[]` to `User` model.
- **Action needed:** Run `npx prisma migrate dev` to apply the schema change.

---

## Deferred (noted, not fixed)

### M6: Inconsistent logging
Most controllers use `console.error()` while `leaderboardController` uses structured `createLogger`. Migrating all controllers is mechanical but large blast radius — deferred to a dedicated refactor pass.

### M10: Denormalized `coachName` on Team
`coachName` stored as string on Team creation, goes stale if coach updates name. Fixing requires a migration to drop the column and updating all reads to join through the `coach` relation. Deferred to avoid schema churn.
