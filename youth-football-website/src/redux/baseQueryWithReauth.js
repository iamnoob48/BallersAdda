import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { logout } from './slices/authSlice.js'

// ──────────────────────────────────────────────────────────────────────
//  Shared base query with silent 401 → refresh → retry logic.
//
//  How it works:
//  1. Any RTK Query request fires normally.
//  2. If the backend responds with 401, we pause ALL concurrent requests
//     using a mutex (so only one refresh hits the server).
//  3. We POST /api/v1/auth/refresh-token (cookie-based, no body needed).
//  4. If the refresh succeeds (new accessToken cookie is set by the server),
//     we retry the ORIGINAL request transparently.
//  5. If the refresh itself fails (refresh token is also dead),
//     we redirect the user to /Login.
//  6. The user never sees the 401 — they only see the skeleton loader
//     while the retry is in-flight.
// ──────────────────────────────────────────────────────────────────────

// Mutex prevents multiple simultaneous refresh calls (e.g. 3 queries
// all get 401 at the same time — only the first one refreshes).
const mutex = new Mutex();

/**
 * Creates a baseQueryWithReauth for a given baseUrl.
 * Use this in every createApi() instead of raw fetchBaseQuery().
 *
 * @param {string} baseUrl — e.g. "/api/v1" or "/api/v1/coach"
 */
export const createBaseQueryWithReauth = (baseUrl) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "include", // 🔥 cookies are always sent
    prepareHeaders: (headers) => {
      headers.set('X-Requested-With', 'XMLHttpRequest');
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    // Wait if another slice is already refreshing
    await mutex.waitForUnlock();

    let result = await rawBaseQuery(args, api, extraOptions);

    // ── 401 detected — time to silently refresh ──
    if (result.error && result.error.status === 401) {
      // Only one refresh at a time
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();

        try {
          // Use a dedicated query pointed at /api/v1 so the refresh URL
          // is always correct regardless of the slice's own baseUrl
          const refreshBaseQuery = fetchBaseQuery({
            baseUrl: "/api/v1",
            credentials: "include",
            prepareHeaders: (headers) => {
              headers.set('X-Requested-With', 'XMLHttpRequest');
              return headers;
            },
          });

          const refreshResult = await refreshBaseQuery(
            {
              url: "/auth/refresh-token",
              method: "POST",
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            // Refresh succeeded — retry the original request
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            // Refresh token is also dead — force re-login
            // Don't dispatch logout action here; just redirect.
            // The ProtectedRoute will handle the rest.
            api.dispatch(logout());
          }
        } finally {
          release();
        }
      } else {
        // Another request already triggered a refresh — wait for it, then retry
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }

    return result;
  };
};
