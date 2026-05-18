import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { logout } from './slices/authSlice.js';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from '../api/tokenStorage.js';

const mutex = new Mutex();

const BACKEND = import.meta.env.VITE_BACKEND_URL || '';

function attachBearerToken(headers) {
  headers.set('X-Requested-With', 'XMLHttpRequest');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export const createBaseQueryWithReauth = (baseUrl) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${BACKEND}${baseUrl}`,
    credentials: "include",
    prepareHeaders: attachBearerToken,
  });

  return async (args, api, extraOptions) => {
    await mutex.waitForUnlock();

    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();

        try {
          const refreshBaseQuery = fetchBaseQuery({
            baseUrl: `${BACKEND}/api/v1`,
            credentials: "include",
            prepareHeaders: attachBearerToken,
          });

          const refreshToken = getRefreshToken();
          const refreshResult = await refreshBaseQuery(
            {
              url: "/auth/refresh-token",
              method: "POST",
              body: refreshToken ? { refreshToken } : undefined,
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            if (refreshResult.data.tokens) storeTokens(refreshResult.data.tokens);
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            clearTokens();
            api.dispatch(logout());
          }
        } finally {
          release();
        }
      } else {
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }

    return result;
  };
};
