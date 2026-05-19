import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from './slices/authSlice.js';

const BACKEND = import.meta.env.VITE_BACKEND_URL || '';

export const createBaseQueryWithReauth = (baseUrl) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${BACKEND}${baseUrl}`,
    credentials: "include",
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      api.dispatch(logout());
    }

    return result;
  };
};
