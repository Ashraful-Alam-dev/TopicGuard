import { apiClient } from "./client";
import type { AuthResponse, User } from "@/lib/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient
      .post<AuthResponse>("/auth/register", payload)
      .then((res) => res.data),

  login: (payload: LoginPayload) =>
    apiClient
      .post<AuthResponse>("/auth/login", payload)
      .then((res) => res.data),

  logout: () =>
    apiClient.post<{ message: string }>("/auth/logout").then((res) => res.data),

  me: () => apiClient.get<User>("/auth/me").then((res) => res.data),
};
