import { authToken } from "@/lib/authToken";

export const AUTH_STORAGE_KEY = "circuit-studio-admin-auth";
export const AUTH_UNAUTHORIZED_EVENT = "teachly-auth-unauthorized";

export function clearAuthSession() {
  authToken.remove();
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("isAuthenticated");
  document.documentElement.removeAttribute("data-token");
}

export function notifyUnauthorized() {
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}
