import axios from "axios";

const api = axios.create({
  baseURL: "https://your-backend-url.onrender.com/api/v1",
  withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Agar error 401 hai (Unauthorized)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            
            // 🛑 CRITICAL CHECK: Agar hum pehle se login ya refresh-token request kar rahe hain, toh loop mat banao
            if (originalRequest.url.includes("/login") || originalRequest.url.includes("/refresh-token")) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            try {
                // Refresh token attempt
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (err) {
                // Agar refresh bhi fail ho jaye aur hum login page par NAHI hain, tabhi redirect karo
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