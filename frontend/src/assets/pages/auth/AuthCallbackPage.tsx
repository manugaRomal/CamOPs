import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

const AuthCallbackPage = () => {
  const { setToken, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState<"loading" | "ok" | "err">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setReady("err");
      return;
    }
    setToken(token);
    void (async () => {
      await refreshUser();
      setReady("ok");
    })();
  }, [searchParams, setToken, refreshUser]);

  if (ready === "err") {
    return <Navigate to="/login?error=1" replace />;
  }
  if (ready === "ok") {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="auth-gate">
      <p>Completing sign-in…</p>
    </div>
  );
};

export default AuthCallbackPage;
