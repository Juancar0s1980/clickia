import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AUTH_LOGOUT_EVENT, tokenStorage } from "./tokenStorage";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
});

httpClient.interceptors.request.use((config) => {
  const session = tokenStorage.get();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const session = tokenStorage.get();
  if (!session) return null;

  try {
    const { data } = await axios.post(`${httpClient.defaults.baseURL}/auth/refresh`, {
      refreshToken: session.refreshToken,
    });
    tokenStorage.set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken as string;
  } catch {
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;

      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });

      const newAccessToken = await refreshInFlight;
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      }

      tokenStorage.clear();
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { error?: string } | undefined;
    if (body?.error) return body.error;
    if (error.message) return error.message;
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}
