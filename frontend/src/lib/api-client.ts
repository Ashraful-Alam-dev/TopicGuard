import axios, { AxiosError } from "axios";

/**
 * Normalized error shape thrown for every failed API call, matching the
 * backend's AllExceptionsFilter response body:
 *   { statusCode, message, error, timestamp, path }
 */
export class ApiError extends Error {
  readonly status: number;
  readonly error: string;

  constructor(status: number, message: string, error: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // The backend issues the access token as an httpOnly cookie — this lets
  // the browser send/receive it automatically without the frontend ever
  // touching the token value.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[]; error?: string }>) => {
    if (error.response) {
      const { status, data } = error.response;
      const rawMessage = data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage ?? "Something went wrong. Please try again.";
      return Promise.reject(new ApiError(status, message, data?.error ?? "Error"));
    }

    if (error.request) {
      return Promise.reject(
        new ApiError(0, "Can't reach the server. Check your connection.", "Network Error"),
      );
    }

    return Promise.reject(new ApiError(0, error.message, "Error"));
  },
);
