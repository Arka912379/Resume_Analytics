import axios from "axios";
import { auth } from "../lib/firebase.js";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    // timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            return config;
        }

        try {
            const token = await firebaseUser.getIdToken();

            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error(
                "Unable to retrieve Firebase authentication token:",
                error
            );
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            console.warn("User authentication failed.");
        }

        return Promise.reject(error);
    }
);

export default api;