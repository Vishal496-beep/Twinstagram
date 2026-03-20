import axios from "axios";

// Ek hi jagah base URL define karo taaki confusion na ho
const BASE_URL = "https://twinstagram-c5ko.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Login ya Refresh routes par loop prevent karna [cite: 9]
      if (originalRequest.url.includes("/login") || originalRequest.url.includes("/refresh-token")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        // Yahan BASE_URL variable use karo bajaye env ke, taaki error na aaye
        await axios.post(`${BASE_URL}/users/refresh-token`, {}, { withCredentials: true });
        
        // Retry original request with new token [cite: 13]
        return api(originalRequest);
      } catch (err) {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;