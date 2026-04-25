import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../api/apiFetch";
import { useAuth } from "../../auth/AuthContext";
import type { TokenResponse } from "../../auth/types";
import "./loginPage.css";

type Mode = "sign-in" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { isAuthenticated, isAuthReady, setToken, refreshUser, startGoogleLogin } = useAuth();

  const [mode, setMode] = useState<Mode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = search.get("token");
    const oauthErr = search.get("oauthError");
    if (oauthErr) {
      setError(decodeURIComponent(oauthErr.replace(/\+/g, " ")));
    }
    if (token) {
      setToken(token);
      void (async () => {
        const ok = await refreshUser();
        if (ok) {
          void navigate("/", { replace: true });
        } else {
          setError("Session could not be started from Google. Try again or use email and password.");
        }
      })();
    }
  }, [search, setToken, refreshUser, navigate]);

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      void navigate("/", { replace: true });
    }
  }, [isAuthReady, isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    const unreachableMsg =
      "Cannot reach the backend. Start the Spring Boot app on port 8080, ensure MySQL is running, then try again. (Vite proxies /api to http://localhost:8080.)";

    try {
      if (mode === "register") {
        const res = await apiFetch("/api/auth/register", {
          method: "POST",
          auth: false,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            department: department.trim(),
          }),
        });
        if (!res.ok) {
          if (res.status === 502 || res.status === 503 || res.status === 504) {
            setError(unreachableMsg);
            return;
          }
          const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string> };
          if (body.errors) {
            setError(Object.values(body.errors).join(" "));
          } else {
            setError(body.message ?? "Registration failed");
          }
          return;
        }
        const data = (await res.json()) as TokenResponse;
        setToken(data.accessToken);
        await refreshUser();
        void navigate("/", { replace: true });
        return;
      }

      const res = await apiFetch("/api/auth/sign-in", {
        method: "POST",
        auth: false,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.status === 401) {
        setError("Invalid email or password");
        return;
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        setError(unreachableMsg);
        return;
      }
      if (!res.ok) {
        setError("Sign-in failed");
        return;
      }
      const data = (await res.json()) as TokenResponse;
      setToken(data.accessToken);
      await refreshUser();
      void navigate("/", { replace: true });
    } catch {
      setError("Network error. Is the API running on port 8080?");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await startGoogleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google sign-in");
    }
  }

  if (!isAuthReady) {
    return (
      <div className="login-page" role="status">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">C</div>
          <div>
            <h1>CamOps</h1>
            <p>Campus operations</p>
          </div>
        </div>

        <h2 className="login-title">{mode === "register" ? "Create an account" : "Sign in"}</h2>

        {error ? (
          <div className="login-error" role="alert">
            {error}
          </div>
        ) : null}

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="login-field">
              <span>Full name</span>
              <input
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={1}
                maxLength={150}
              />
            </label>
          ) : null}

          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 8 : 1}
            />
          </label>

          {mode === "register" ? (
            <>
              <label className="login-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                />
              </label>
              <label className="login-field">
                <span>Phone (optional)</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
              </label>
              <label className="login-field">
                <span>Department (optional)</span>
                <input value={department} onChange={(e) => setDepartment(e.target.value)} maxLength={100} />
              </label>
            </>
          ) : null}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="login-toggle">
          {mode === "register" ? (
            <button type="button" className="link-button" onClick={() => setMode("sign-in")}>
              Already have an account? Sign in
            </button>
          ) : (
            <button type="button" className="link-button" onClick={() => setMode("register")}>
              New user? Create an account
            </button>
          )}
        </div>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button type="button" className="login-google" onClick={() => void handleGoogle()} disabled={submitting}>
          <span className="login-google-icon" aria-hidden>
            G
          </span>
          Continue with Google
        </button>

        <p className="login-hint">Google sign-in opens in the same window. We’ll fix the flow if something breaks.</p>
      </div>
    </div>
  );
}
