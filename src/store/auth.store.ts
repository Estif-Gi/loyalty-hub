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
  themeColor: string | null;
  billingStatus: string | null;
  _hasHydrated: boolean;
  isLimitModalOpen: boolean;
  limitModalMessage: string | null;

  // Actions
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  setRestaurantId: (id: string) => void;
  setThemeColor: (color: string | null) => void;
  setBillingStatus: (status: string | null) => void;
  setLimitModalOpen: (open: boolean, message?: string | null) => void;
  updateBillingStatus: (restaurantId: string, status: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      restaurantId: null,
      isAuthenticated: false,
      themeColor: null,
      billingStatus: null,
      _hasHydrated: false,
      isLimitModalOpen: false,
      limitModalMessage: null,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

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
          themeColor: null,
          billingStatus: null,
          isLimitModalOpen: false,
          limitModalMessage: null,
        });
      },

      setUser: (user) => {
        set({ user, restaurantId: user.restaurantId ?? get().restaurantId });
      },

      setRestaurantId: (id) => {
        set({ restaurantId: id });
      },

      setThemeColor: (color) => {
        set({ themeColor: color });
      },

      setBillingStatus: (status) => {
        set({ billingStatus: status });
      },

      setLimitModalOpen: (open, message = null) => {
        set({ isLimitModalOpen: open, limitModalMessage: message });
      },

      updateBillingStatus: async (restaurantId, status) => {
        const { token } = get();
        if (!token) throw new Error("No authorization token found");
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${restaurantId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ billingStatus: status }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to update billing status");
        }
        const updatedRestaurant = await res.json();
        set({ billingStatus: updatedRestaurant.billingStatus ?? status });
      },

      fetchProfile: async () => {
        const { token, logout } = get();
        if (!token) return;

        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 401) {
            console.warn("[AuthStore] Token expired or invalid, logging out.");
            logout();
            return;
          }

          if (!res.ok) throw new Error("Failed to fetch profile");

          const data: UserProfile = await res.json();
          set({
            user: data,
            restaurantId: data.restaurantId ?? get().restaurantId,
            isAuthenticated: true, // Ensure the flag is true if we have a valid profile
          });

          // Fetch restaurant data for themeColor and billingStatus
          const rid = data.restaurantId ?? get().restaurantId;
          if (rid) {
            try {
              const resRestaurant = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/restaurants/${rid}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              if (resRestaurant.ok) {
                const restaurant = await resRestaurant.json();
                set({
                  themeColor: restaurant.themeColor ?? null,
                  billingStatus: restaurant.billingStatus ?? null,
                });
              }
            } catch (err) {
              console.error("[AuthStore] Failed to fetch restaurant data:", err);
            }
          }
        } catch (err) {
          console.error("[AuthStore] fetchProfile failed:", err);
          // Don't logout on network errors, only on explicit 401/403
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (!error && rehydratedState) {
            rehydratedState.setHasHydrated(true);
          }
        };
      },
      // Only persist these fields — avoid persisting derived/action state
      partialize: (state) => ({
        token: state.token,
        restaurantId: state.restaurantId,
        isAuthenticated: state.isAuthenticated,
        themeColor: state.themeColor,
        billingStatus: state.billingStatus,
      }),
    },
  ),
);
