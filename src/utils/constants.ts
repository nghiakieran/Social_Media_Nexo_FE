// Environment variable keys
export const ENV_API_BASE_URL = "VITE_API_URL";

// API endpoint paths
export const AUTH_LOGIN_ENDPOINT = "/auth/login";
export const AUTH_REGISTER_ENDPOINT = "/auth/register";
export const AUTH_VERIFY_EMAIL_ENDPOINT = "/auth/verify-email";
export const AUTH_REFRESH_ENDPOINT = "/auth/refresh";
export const AUTH_LOGOUT_ENDPOINT = "/auth/logout";
export const AUTH_FORGOT_PASSWORD_ENDPOINT = "/auth/forgot-password";

export const OAUTH_REDIRECT_URI =
  import.meta.env.VITE_OAUTH_REDIRECT_URI ||
  "http://localhost:3000/auth/oauth/callback";
export const OAUTH_AUTH_BASE_URL =
  import.meta.env.VITE_OAUTH_AUTH_BASE_URL ||
  "http://localhost:9090/realms/nexo-network/protocol/openid-connect/auth";
export const USER_FOLLOWERS_ENDPOINT = "/users/followers";
export const USER_FOLLOWING_ENDPOINT = "/users/followings";

// Local storage keys for tokens
export const ACCESS_TOKEN_STORAGE_KEY = "access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";

// Token type prefix
export const BEARER_TOKEN_PREFIX = "Bearer";

// Default avatar fallback - Beautiful gradient SVG
export const DEFAULT_AVATAR_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjA5NDMzO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6I2VjNGE5OTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYTg1NWY3O3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+CjxwYXRoIGQ9Ik0yMCA4NSBRIDIwIDY1IDUwIDY1IFEgODAgNjUgODAgODUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz4KPC9zdmc+";

/**
 * Format number to short format (K, M, B)
 * Example: 1234 -> 1.2K, 1234567 -> 1.2M
 */
export const formatNumber = (num: number): string => {
  if (num < 1000) {
    return num.toString();
  }

  if (num < 1000000) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith(".0")
      ? formatted.slice(0, -2) + "K"
      : formatted + "K";
  }

  if (num < 1000000000) {
    const formatted = (num / 1000000).toFixed(1);
    return formatted.endsWith(".0")
      ? formatted.slice(0, -2) + "M"
      : formatted + "M";
  }

  const formatted = (num / 1000000000).toFixed(1);
  return formatted.endsWith(".0")
    ? formatted.slice(0, -2) + "B"
    : formatted + "B";
};
