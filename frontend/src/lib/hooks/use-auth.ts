"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

/**
 * Fetches the current user via GET /auth/me. Treats a 401 as "not logged in"
 * rather than a hard error, so pages can branch on `user` being undefined.
 */
export function useAuth() {
  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.me,
    retry: false,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    error: query.error,
  };
}

export function useInvalidateAuth() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
}
