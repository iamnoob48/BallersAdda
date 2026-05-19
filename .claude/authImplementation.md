 

***

# Auth Implementation Plan — BallersAdda

## P0 — Security (Do Now)

* **#1: Unconfigured Auth Surface**
    * **Problem:** `lib/auth.js` + `better-auth` mount in `server.js` — exposed unconfigured auth surface on `/api/auth/*`, no rate limit, no CSRF.
    * **Fix:** Delete file, remove import + `app.all` mount, remove `better-auth` from `package.json`.
    * **File(s):** `server.js`, `lib/auth.js`, `package.json`
    * **Size:** S
* **#2: Hardcoded Redirect**
    * **Problem:** `failureRedirect` hardcoded to `localhost:5173` in `authRoutes.js:40` — breaks prod.
    * **Fix:** Use `` `${process.env.CLIENT_URL}/Login` ``.
    * **File(s):** `authRoutes.js`
    * **Size:** S
* **#3: CSRF Weakness**
    * **Problem:** CSRF `requireCsrfHeader` has no Origin check — relies purely on CORS preflight.
    * **Fix:** Add `req.get('Origin')` check against `CLIENT_URL` as defense-in-depth.
    * **File(s):** `csrfMiddleware.js`
    * **Size:** S
* **#4: Refresh Rotation Race Condition**
    * **Problem:** Refresh rotation is NOT atomic — two concurrent refreshes from same valid token both pass `tokenVersion` check. No reuse detection.
    * **Fix:** Switch to per-token `jti` stored in Redis (`GETDEL` for atomicity). Reuse = bump `tokenVersion` + log.
    * **File(s):** `authControllers.js`, new `lib/refreshTokenStore.js`
    * **Size:** M

---

## P1 — Correctness & Reliability

| # | Problem | Fix | File(s) | Size |
| :--- | :--- | :--- | :--- | :--- |
| **5** | `isCoach` hits DB every request, role already in JWT | Use `req.user.role`, drop `ACADEMY` check, remove Prisma import | `authMiddleware.js` | S |
| **6** | Google OAuth username collision — only 1000 buckets, racy check-then-create | Generate only inside `!user` branch, use `nanoid(6)` suffix, retry on `P2002` | `passportConfig.js` | S |
| **7** | Email case inconsistency — register/login exact match, `checkEmail` case-insensitive → duplicate accounts possible | Normalize to lowercase at write (register, Google) and at read (login) | `authControllers.js`, `passportConfig.js`, migration | S |
| **8** | `clearCookieOpts` missing `maxAge: 0` | Add `maxAge: 0` | `authControllers.js` | S |
| **9** | `verifyAccessToken` doesn't validate decoded shape — missing `id` or `role` causes cryptic downstream errors | Guard `decoded.id` is number + `decoded.role` is known enum | `authMiddleware.js` | S |
| **10** | Login limiter keys on IP only — shared NAT blocks offices, rotating IPs bypass | Composite key: `` `${ip}:${email}` `` for login; two-layer per-IP + per-email | `rateLimiters.js` | S |
| **11** | Dead import of rate limiters in controller | Remove the import line | `authControllers.js` | S |
| **12** | `redisClient.js` silently falls back to localhost if `REDIS_URL` undefined | Throw at startup in production if unset | `redisClient.js` | S |
| **13** | Add `verifyAccessTokenStrict` for sensitive routes (password change, delete account) that checks `tokenVersion` in DB | New middleware variant, apply only on high-stakes endpoints | `authMiddleware.js` | S |

---

## P2 — Dead Code & Quality

| # | Problem | Fix | File(s) | Size |
| :--- | :--- | :--- | :--- | :--- |
| **14** | `passport.serializeUser` / `passport.deserializeUser` never called (`session: false`) | Delete both blocks | `passportConfig.js` | S |
| **15** | `console.log('>> verifyUser is hit')` debug log | Delete | `authControllers.js` | S |
| **16** | `@@index([email, role])` redundant — email already `@unique` | Drop it, add `@@index([role])` instead if needed | `schema.prisma`, migration | S |
| **17** | `logoutUser` swallows `tokenVersion` bump failure silently — user thinks logged out but refresh still works | Structured log minimum | `authControllers.js` | S |
| **18** | Remove `ACADEMY` from Role enum | Migrate existing `ACADEMY` users → `COACH`, update enum, `AcademyInvite` default | `schema.prisma`, migration | M |

---

## P3 — New Features

| # | Feature | Notes | Size |
| :--- | :--- | :--- | :--- |
| **19** | Email verification | `isVerified` field exists but never set. Redis or DB token, 24h TTL | M |
| **20** | Password reset | `POST /forgot-password` → email link → `POST /reset-password` → bump `tokenVersion` | M |
| **21** | Auth event audit log | `AuthEvent` table: `userId`, `type`, `ip`, `userAgent`, `createdAt`. Log login/fail/refresh/reuse/logout | M |
| **22** | Per-account login lockout | Redis counter per `userId`, suspend after 10 fails, clear on success | S |

---

## Suggested Execution Order

1.  **P0 #1 → P0 #2 → P0 #3** *(Quick security surface cleanup)*
2.  **P0 #4** *(`jti`-based refresh — biggest security impact)*
3.  **P1 #5, 6, 7, 8, 9, 11** *(Correctness sweep)*
4.  **P1 #10, 12** *(Rate limiter hardening)*
5.  **P2 #14, 15, 16, 17** *(Dead code cleanup)*
6.  **P2 #18** *(`ACADEMY` role removal — coordinate with academy domain)*
7.  **P3 #19, 20** *(User-facing features)*
8.  **P3 #21, 22** *(Hardening)*