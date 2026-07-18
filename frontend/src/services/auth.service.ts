import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  async register(input: RegisterInput): Promise<User> {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", input);
    return data.user;
  },

  async login(input: LoginInput): Promise<User> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", input);
    return data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
