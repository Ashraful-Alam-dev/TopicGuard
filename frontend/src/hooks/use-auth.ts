"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService, LoginInput, RegisterInput } from "@/services/auth.service";
import { ApiError } from "@/lib/api-client";

export const authKeys = {
  currentUser: ["auth", "me"] as const,
};

/**
 * Fetches the signed-in user. 401s are expected on logged-out visitors, so
 * retries are disabled and the query simply resolves to "no user" via
 * isError, rather than throwing to an error boundary.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
      router.push("/dashboard");
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Clear everything, not just the user — classroom data is
      // user-specific and must not leak across sessions.
      queryClient.clear();
      router.push("/login");
    },
  });
}

export function isUnauthenticatedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
