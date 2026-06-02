/**
 * Compatibility shim — keeps the `useAuth()` hook API identical to before
 * while sourcing all state from the Zustand auth store.
 *
 * The `AuthProvider` now only handles:
 *  - calling `fetchProfile()` once on mount when a token already exists
 *    (e.g. after a hard refresh), so `user` is always populated.
 *  - clearing TanStack Query cache on logout.
 *  - applying the dynamic theme color from the restaurant.
 */
import { useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { applyThemeColor } from "@/lib/theme";
import type { UserProfile } from "@/store/auth.store";

export type { UserProfile };

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, themeColor, fetchProfile, logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();

  // Re-hydrate user profile from API whenever the token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  // Apply dynamic theme color whenever it changes
  useEffect(() => {
    applyThemeColor(themeColor);
  }, [themeColor]);

  // Clear theme overrides on logout (themeColor becomes null)
  useEffect(() => {
    if (!token) {
      applyThemeColor(null);
    }
  }, [token]);

  // Wrap logout so TanStack Query cache is also cleared
  // (stored on the store so consumers can just call logout())
  useEffect(() => {
    // Patch logout to also clear query cache
    const originalLogout = useAuthStore.getState().logout;
    useAuthStore.setState({
      logout: () => {
        originalLogout();
        queryClient.clear();
        applyThemeColor(null);
      },
    });
    // Restore on unmount
    return () => {
      useAuthStore.setState({ logout: originalLogout });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  return <>{children}</>;
}

/**
 * Drop-in replacement for the old `useAuth()` hook.
 * Components importing this do NOT need any changes.
 */
export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const themeColor = useAuthStore((s) => s.themeColor);
  const billingStatus = useAuthStore((s) => s.billingStatus);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setThemeColor = useAuthStore((s) => s.setThemeColor);
  const setBillingStatus = useAuthStore((s) => s.setBillingStatus);

  return {
    token,
    user,
    restaurantId,
    isAuthenticated,
    themeColor,
    billingStatus,
    _hasHydrated,
    login,
    logout,
    setThemeColor,
    setBillingStatus,
  };
}
