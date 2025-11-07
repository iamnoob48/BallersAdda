import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true, // Include cookies in requests
})

//Response interceptor to handle responses globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          await api.post("/auth/refresh-token");
          return api(originalRequest); // retry original request
        } catch (refreshError) {
          console.error("Refresh failed:", refreshError);
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

export default api;