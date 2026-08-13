"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  usersApi,
  type ChangePasswordPayload,
} from "@/lib/api/users";

export const PROFILE_QUERY_KEY = ["users", "me"] as const;

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: usersApi.me,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      usersApi.changePassword(payload),
  });
}
