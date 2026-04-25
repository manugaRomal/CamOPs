import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setApiUnauthorizedHandler } from "../assets/api/apiFetch";
import { clearStoredToken, getStoredToken, setStoredToken } from "./tokenStorage";
import type { CurrentUser, OauthLoginInfo } from "./types";
import { mapHomeDashboard, mapShellRole, type HomeDashboard, type ShellRole } from "./roleMap";

type AuthContextValue = {
  user: CurrentUser | null;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  homeDashboard: HomeDashboard;
  shellRole: ShellRole;
  setToken: (token: string) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  startGoogleLogin: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const refreshUser = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      return;
    }
    const res = await apiFetch("/api/auth/me", { method: "GET", auth: true });
    if (res.ok) {
      const data = (await res.json()) as CurrentUser;
      setUser({
        ...data,
        phone: data.phone ?? "",
        department: data.department ?? "",
      });
    } else {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    void navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setApiUnauthorizedHandler(() => {
      setUser(null);
      void navigate("/login", { replace: true });
    });
    return () => {
      setApiUnauthorizedHandler(null);
    };
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!getStoredToken()) {
        if (!cancelled) {
          setIsAuthReady(true);
        }
        return;
      }
      await refreshUser();
      if (!cancelled) {
        setIsAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const setToken = useCallback(
    (token: string) => {
      setStoredToken(token);
    },
    [],
  );

  const startGoogleLogin = useCallback(async () => {
    const res = await apiFetch("/api/auth/login", { method: "GET", auth: false });
    if (!res.ok) {
      throw new Error("Could not get Google sign-in URL");
    }
    const data = (await res.json()) as OauthLoginInfo;
    if (!data.googleAuthorizationUrl) {
      throw new Error("Missing googleAuthorizationUrl");
    }
    window.location.href = data.googleAuthorizationUrl;
  }, []);

  const homeDashboard = useMemo(() => mapHomeDashboard(user?.roles), [user]);

  const shellRole = useMemo(() => mapShellRole(user), [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthReady,
      isAuthenticated: user !== null,
      homeDashboard,
      shellRole,
      setToken,
      refreshUser,
      logout,
      startGoogleLogin,
    }),
    [user, isAuthReady, homeDashboard, shellRole, setToken, refreshUser, logout, startGoogleLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
