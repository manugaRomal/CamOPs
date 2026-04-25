import { clearStoredToken, getStoredToken } from "../../auth/tokenStorage";

type UnauthorizedHandler = (() => void) | null;

let onUnauthorized: UnauthorizedHandler = null;

export function setApiUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

export async function apiFetch(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<Response> {
  const { auth: useAuth = true, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (useAuth) {
    const t = getStoredToken();
    if (t) {
      headers.set("Authorization", `Bearer ${t}`);
    }
  }
  const res = await fetch(path, { ...rest, headers });
  if (res.status === 401 && useAuth && getStoredToken()) {
    clearStoredToken();
    onUnauthorized?.();
  }
  return res;
}
