import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Read token from Zustand store
    let token = useAuthStore.getState().token;

    // Fallback: If store isn't hydrated yet (e.g. very first request on refresh),
    // try reading directly from localStorage to prevent premature 401 logouts.
    if (!token && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auth-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed.state?.token;
        }
      } catch (e) {
        // Silently fail if storage is corrupted
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auto-logout on 401 Unauthorized and popup on subscription limit errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    const status = error.response?.status;
    const errorMsg = error.response?.data?.message || error.response?.data?.error || "";

    // Check if it's a subscription limit error
    const isLimitError =
      status === 402 ||
      (status === 403 && /limit|upgrade|subscription|plan/i.test(errorMsg)) ||
      (status === 400 && /limit|upgrade|subscription|plan/i.test(errorMsg)) ||
      /subscription limit|limit reached|reached your limit|upgrade your plan|billing status/i.test(errorMsg);

    if (isLimitError) {
      useAuthStore.getState().setLimitModalOpen(
        true,
        errorMsg || "You have reached the limit of your current subscription. Please update your billing status to continue."
      );
    }
    return Promise.reject(error);
  },
);

export default api;
