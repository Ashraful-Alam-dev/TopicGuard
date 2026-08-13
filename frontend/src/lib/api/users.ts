import { apiClient } from "./client";
import type { UserProfile } from "@/lib/types";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  me: () => apiClient.get<UserProfile>("/users/me").then((res) => res.data),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient
      .patch<{ message: string }>("/users/me/password", payload)
      .then((res) => res.data),
};
