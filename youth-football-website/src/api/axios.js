import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
      ? `${import.meta.env.VITE_BACKEND_URL}/api/v1`
      : '/api/v1',
    withCredentials: true,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        const { store } = await import('../redux/store.js');
        const { logout } = await import('../redux/slices/authSlice.js');
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );

export default api;
