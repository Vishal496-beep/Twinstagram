import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 🚨 CHECK: Agar error 401 hai AUR ye request pehle se refresh ya login ki nahi hai
        if (
            error.response && 
            error.response.status === 401 && 
            !originalRequest._retry &&
            !originalRequest.url.includes("/login") && // Login par redirect mat karo
            !originalRequest.url.includes("/refresh-token") // Refresh fail ho toh loop mat banao
        ) {
            originalRequest._retry = true;
            try {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (err) {
                // Agar refresh fail ho jaye, toh bas login par bhejo
                // Lekin check karo ki hum pehle se login page par toh nahi hain?
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;