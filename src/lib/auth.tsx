/**
 * Compatibility shim — keeps the `useAuth()` hook API identical to before
 * while sourcing all state from the Zustand auth store.
 *
 * The `AuthProvider` now only handles:
 *  - calling `fetchProfile()` once on mount when a token already exists
 *    (e.g. after a hard refresh), so `user` is always populated.
 *  - clearing TanStack Query cache on logout.
 */
import { useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import type { UserProfile } from "@/store/auth.store";

export type { UserProfile };

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, fetchProfile, logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();

  // Re-hydrate user profile from API whenever the token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  // Wrap logout so TanStack Query cache is also cleared
  // (stored on the store so consumers can just call logout())
  useEffect(() => {
    // Patch logout to also clear query cache
    const originalLogout = useAuthStore.getState().logout;
    useAuthStore.setState({
      logout: () => {
        originalLogout();
        queryClient.clear();
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
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  return { token, user, restaurantId, isAuthenticated, login, logout };
}
