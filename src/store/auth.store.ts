import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  restaurantId?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  restaurantId: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  setRestaurantId: (id: string) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      restaurantId: null,
      isAuthenticated: false,

      login: (token, user) => {
        set({
          token,
          user,
          restaurantId: user.restaurantId ?? get().restaurantId,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          restaurantId: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => {
        set({ user, restaurantId: user.restaurantId ?? get().restaurantId });
      },

      setRestaurantId: (id) => {
        set({ restaurantId: id });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Failed to fetch profile");

          const data: UserProfile = await res.json();
          set({
            user: data,
            restaurantId: data.restaurantId ?? get().restaurantId,
          });
        } catch (err) {
          console.error("[AuthStore] fetchProfile failed:", err);
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      // Only persist these fields — avoid persisting derived/action state
      partialize: (state) => ({
        token: state.token,
        restaurantId: state.restaurantId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
