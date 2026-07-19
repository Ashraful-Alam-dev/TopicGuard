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

/**
 * Normalizes NestJS's error response shape into a single readable message,
 * so callers (mutations, forms) don't need to know about the API's error format.
 */
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
