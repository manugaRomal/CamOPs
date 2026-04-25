import { clearStoredToken, getStoredToken } from "../../auth/tokenStorage";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export function apiBaseUrlFor(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }
  const prefix = API_BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${p}`;
}

type ApiFetchOptions = RequestInit & { auth?: boolean };

let onUnauthorized: (() => void) | null = null;

export function setApiUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/**
 * Fetches a URL (relative to VITE_API_BASE_URL when set, or same origin for the Vite proxy).
 */
export async function apiFetch(path: string, init: ApiFetchOptions = {}): Promise<Response> {
  const { auth = true, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (auth) {
    const t = getStoredToken();
    if (t) {
      headers.set("Authorization", `Bearer ${t}`);
    }
  }
  const response = await fetch(apiBaseUrlFor(path), { ...rest, headers });
  if (response.status === 401) {
    clearStoredToken();
    onUnauthorized?.();
  }
  return response;
}
