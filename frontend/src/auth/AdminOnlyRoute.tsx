import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { isAdmin } from "./roleMap";

type AdminOnlyRouteProps = {
  children: ReactNode;
};

/**
 * Renders children only for users with the ADMIN role; otherwise redirects home.
 */
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const { user, isAuthReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="auth-gate" role="status">
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin(user?.roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
