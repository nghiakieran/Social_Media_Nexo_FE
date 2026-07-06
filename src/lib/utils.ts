import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasAdminRole(token: string | null): boolean {
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode the payload (second part)
    const payload = parts[1];
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = JSON.parse(atob(paddedPayload));

    const resourceAccess = decodedPayload?.resource_access;
    const authServiceClient = resourceAccess?.["auth-service-client"];
    const roles = authServiceClient?.roles || [];

    return roles.includes("ADMIN") || roles.includes("MODERATOR");
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return false;
  }
}
