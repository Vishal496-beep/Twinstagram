import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1", // Your Port 3000
    withCredentials: true, // Crucial for your Refresh Token logic
});

// Interceptor to handle "401 Unauthorized" (Token Expired)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Calls your refreshAccessToken controller
                await axios.post("/api/v1/users/refresh-token", {}, { withCredentials: true });
                return api(originalRequest);
            } catch (err) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;