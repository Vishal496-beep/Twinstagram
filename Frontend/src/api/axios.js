import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Your Port 3000
    withCredentials: true, // Crucial for your Refresh Token logic
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ✅ Check karo ki error.response exist karta hai ya nahi
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Refresh token logic
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/refresh-token`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (err) {
                window.location.href = "/login";
            }
        }

        // Agar response nahi hai, toh ye Network error ho sakta hai
        if (!error.response) {
            console.error("Network Error: Check if your backend is running!");
        }

        return Promise.reject(error);
    }
    
);

export default api;