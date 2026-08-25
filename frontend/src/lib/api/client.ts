import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "@/lib/types";

/**
 * Base URL for the NestJS API. Set NEXT_PUBLIC_API_URL in .env.local, e.g.
 * NEXT_PUBLIC_API_URL=http://localhost:3000/api
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends/receives the httpOnly access_token cookie
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        try {
          await apiClient.post("/auth/logout");
        } catch {}

        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);


export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<ApiErrorBody>).response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (error.message) return error.message;
  }
  return "Something went wrong. Please try again.";
}
