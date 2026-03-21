import axios from "axios";

// Yahan define karo variable ko sahi tarike se
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "https://twinstagram-c5ko.onrender.com/api/v1";

const api = axios.create({
    baseURL: BACKEND_URL, // Ab ye error nahi dega
    withCredentials: true 
});

// ... baaki interceptor ka code same rahega ...
// Response Interceptor: Taaki agar token expire ho toh automatically refresh ho jaye
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Agar backend 401 (Unauthorized) bhejta hai
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            
            // Login page ya refresh request par loop na bane isliye check
            if (originalRequest.url.includes("/login") || originalRequest.url.includes("/refresh-token")) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            try {
                // Refresh token ke liye direct axios use karo taaki interceptor repeat na ho
                await axios.post(`${BACKEND_URL}/users/refresh-token`, {}, { withCredentials: true });
                
                // Naye token ke saath purani request dobara try karo
                return api(originalRequest);
            } catch (err) {
                // Agar refresh bhi fail ho gaya, toh seedha Login bhej do
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