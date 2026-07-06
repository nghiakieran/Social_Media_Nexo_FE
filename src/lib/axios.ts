import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type { TokenPayload, TokenResponse } from "@/features/auth/types";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  AUTH_LOGIN_ENDPOINT,
  AUTH_LOGOUT_ENDPOINT,
  AUTH_REFRESH_ENDPOINT,
  BEARER_TOKEN_PREFIX,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/utils/constants";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional SPA navigation callback for unauthorized redirects
let onUnauthorizedNavigate: ((path: string) => void) | null = null;
export const setOnUnauthorizedNavigate = (handler: (path: string) => void) => {
  onUnauthorizedNavigate = handler;
};

const navigateToLogin = (reason?: string) => {
  const path = reason
    ? `${AUTH_LOGIN_ENDPOINT}?reason=${reason}`
    : AUTH_LOGIN_ENDPOINT;
  if (onUnauthorizedNavigate) {
    onUnauthorizedNavigate(path);
  } else {
    window.location.href = path;
  }
};

// Simple token storage helpers
const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

const setTokens = (
  accessToken?: string | null,
  refreshToken?: string | null
) => {
  if (typeof accessToken !== "undefined" && accessToken !== null) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  }
  if (typeof refreshToken !== "undefined" && refreshToken !== null) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

// Header helper to set Authorization in a type-safe way
function setAuthHeader(config: AxiosRequestConfig, token: string) {
  if (!config.headers) config.headers = new AxiosHeaders();
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set("Authorization", `${BEARER_TOKEN_PREFIX} ${token}`);
  } else {
    (
      config.headers as Record<string, string>
    ).Authorization = `${BEARER_TOKEN_PREFIX} ${token}`;
  }
}

// Refresh handling state
let isRefreshing = false;
let requestQueue: Array<(token: string | null) => void> = [];
let refreshAbortController: AbortController | null = null;

const processQueue = (token: string | null) => {
  requestQueue.forEach((resolve) => resolve(token));
  requestQueue = [];
};

// Public API: allow app to cancel an in-flight token refresh (e.g., on logout)
export const abortAuthRefresh = () => {
  if (refreshAbortController) {
    refreshAbortController.abort();
    refreshAbortController = null;
  }
  isRefreshing = false;
  processQueue(null);
};

// Logout API: abort refresh, call server logout with refresh_token, clear tokens, drop default auth header
export const performLogout = async (options?: { redirect?: boolean }) => {
  try {
    // Abort refresh + clear tokens and default headers immediately (fail-safe)
    abortAuthRefresh();
    const baseURL = api.defaults.baseURL || "";
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    clearTokens();
    if (api.defaults.headers) {
      if (api.defaults.headers instanceof AxiosHeaders) {
        api.defaults.headers.delete("Authorization");
      } else {
        const defaultsHeaders = api.defaults.headers as unknown as {
          common?: Record<string, string>;
        };
        if (defaultsHeaders.common) delete defaultsHeaders.common.Authorization;
      }
    }
    // Best-effort notify backend (don't block logout semantics on failure)
    if (refreshToken) {
      await axios.post(
        `${baseURL}${AUTH_LOGOUT_ENDPOINT}`,
        {},
        { headers: { Authorization: `${BEARER_TOKEN_PREFIX} ${refreshToken}` } }
      );
    }
  } catch (_) {
    // ignore logout errors
  } finally {
    if (options?.redirect !== false) {
      navigateToLogin();
    }
  }
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip attaching token for auth endpoints if desired (optional)
    const token = getAccessToken();
    if (token) {
      setAuthHeader(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const isAuthLogin = originalRequest?.url?.includes(AUTH_LOGIN_ENDPOINT);
    const isAuthRefresh = originalRequest?.url?.includes(AUTH_REFRESH_ENDPOINT);

    if (status === 401 && !isAuthLogin && !isAuthRefresh) {
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          // Queue the request until refresh completes
          return new Promise((resolve) => {
            requestQueue.push((token) => {
              if (token && originalRequest.headers) {
                (
                  originalRequest.headers as Record<string, string>
                ).Authorization = `${BEARER_TOKEN_PREFIX} ${token}`;
              }
              resolve(api(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          // Call refresh token endpoint using a bare axios instance to avoid interceptors recursion
          const baseURL = api.defaults.baseURL || "";
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
          if (!refreshToken) {
            clearTokens();
            navigateToLogin("session_expired");
            return Promise.reject(error);
          }
          // Prepare abort controller for this refresh call
          if (refreshAbortController) {
            refreshAbortController.abort();
          }
          refreshAbortController = new AbortController();
          const refreshResponse = await axios.post(
            `${baseURL}${AUTH_REFRESH_ENDPOINT}`,
            {},
            {
              signal: refreshAbortController.signal,
              headers: {
                Authorization: `${BEARER_TOKEN_PREFIX} ${refreshToken}`,
              },
            }
          );

          const body = refreshResponse.data as TokenResponse;
          const payload: TokenPayload = body.data ?? body;
          const newAccessToken: string | null = payload?.access_token ?? null;
          const newRefreshToken: string | null = payload?.refresh_token ?? null;

          setTokens(newAccessToken, newRefreshToken);
          processQueue(newAccessToken);

          // Retry original request with new token
          if (newAccessToken) {
            setAuthHeader(originalRequest, newAccessToken);

            // Also update defaults so new requests get the fresh token immediately
            if (api.defaults.headers) {
              if (api.defaults.headers instanceof AxiosHeaders) {
                api.defaults.headers.set(
                  "Authorization",
                  `${BEARER_TOKEN_PREFIX} ${newAccessToken}`
                );
              } else {
                const defaultsHeaders = api.defaults.headers as unknown as {
                  common?: Record<string, string>;
                };
                defaultsHeaders.common = defaultsHeaders.common || {};
                defaultsHeaders.common.Authorization = `${BEARER_TOKEN_PREFIX} ${newAccessToken}`;
              }
            }
          }

          return api(originalRequest);
        } catch (refreshError: unknown) {
          const err = refreshError as AxiosError & { code?: string };
          // If refresh was explicitly canceled (e.g., user logged out), do not navigate
          if (err?.code === "ERR_CANCELED") {
            isRefreshing = false;
            return Promise.reject(err);
          }
          processQueue(null);
          clearTokens();
          navigateToLogin("session_expired");
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
          if (refreshAbortController) {
            refreshAbortController = null;
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
