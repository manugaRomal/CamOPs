import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { isAdmin } from "./roleMap";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return <div className="auth-gate">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

type AdminOnlyRouteProps = {
  children: ReactNode;
};

/**
 * Bookings (admin queue) and resource create/edit: ADMIN only. Technicians use ticket flows when implemented.
 */
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const { user, isAuthReady, isAuthenticated } = useAuth();

  if (!isAuthReady) {
    return <div className="auth-gate">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin(user?.roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
