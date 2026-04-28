import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true, // Include cookies in requests
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
})

//Response interceptor to handle responses globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const isRefreshCall = originalRequest?.url?.includes('/auth/refresh-token');

      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
        originalRequest._retry = true;

        try {
          await api.post("/auth/refresh-token");
          return api(originalRequest); // retry original request
        } catch (refreshError) {
          console.error("Refresh failed:", refreshError);
          // Dynamic import avoids circular dep (store → authSlice → axios → store)
          const { store } = await import('../redux/store.js');
          const { logout } = await import('../redux/slices/authSlice.js');
          store.dispatch(logout());
        }
      }
      return Promise.reject(error);
    }
  );

export default api;