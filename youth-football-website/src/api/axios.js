import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from './tokenStorage.js';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
      ? `${import.meta.env.VITE_BACKEND_URL}/api/v1`
      : '/api/v1',
    withCredentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const isRefreshCall = originalRequest?.url?.includes('/auth/refresh-token');

      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();
          const res = await api.post("/auth/refresh-token",
            refreshToken ? { refreshToken } : undefined
          );
          if (res.data?.tokens) storeTokens(res.data.tokens);
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          const { store } = await import('../redux/store.js');
          const { logout } = await import('../redux/slices/authSlice.js');
          store.dispatch(logout());
        }
      }
      return Promise.reject(error);
    }
  );

export default api;
