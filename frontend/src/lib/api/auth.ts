import { apiClient } from "./client";
import type { AuthResponse, RegisterPendingResponse, User } from "@/lib/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyForgotPasswordOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient
      .post<RegisterPendingResponse>("/auth/register", payload)
      .then((res) => res.data),

  verifyRegisterOtp: (payload: VerifyOtpPayload) =>
    apiClient
      .post<AuthResponse>("/auth/register/verify-otp", payload)
      .then((res) => res.data),

  resendRegisterOtp: (payload: ResendOtpPayload) =>
    apiClient
      .post<{ message: string }>("/auth/register/resend-otp", payload)
      .then((res) => res.data),

  login: (payload: LoginPayload) =>
    apiClient
      .post<AuthResponse>("/auth/login", payload)
      .then((res) => res.data),

  logout: () =>
    apiClient.post<{ message: string }>("/auth/logout").then((res) => res.data),

  me: () => apiClient.get<User>("/auth/me").then((res) => res.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient
      .post<{ message: string }>("/auth/forgot-password", payload)
      .then((res) => res.data),

  verifyForgotPasswordOtp: (payload: VerifyForgotPasswordOtpPayload) =>
    apiClient
      .post<{ message: string }>("/auth/forgot-password/verify-otp", payload)
      .then((res) => res.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient
      .post<{ message: string }>("/auth/reset-password", payload)
      .then((res) => res.data),
};
