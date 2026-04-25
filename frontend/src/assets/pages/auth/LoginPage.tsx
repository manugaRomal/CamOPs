import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

const LoginPage = () => {
  const { isAuthReady, isAuthenticated, startGoogleLogin } = useAuth();
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (oauthError) {
      setError("Sign-in was cancelled or failed. Try again.");
    }
  }, [oauthError]);

  if (isAuthReady && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleLogin() {
    setError("");
    try {
      await startGoogleLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Google sign-in");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">CamOps</div>
        <h1>Sign in</h1>
        <p className="auth-sub">Use your Google account to access the operations hub.</p>
        {error ? <p className="error-text">{error}</p> : null}
        <button type="button" className="primary-btn auth-google-btn" onClick={() => void handleLogin()}>
          Continue with Google
        </button>
        <p className="auth-hint">
          <Link to="/">Back to app</Link> (requires sign-in for most pages)
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
