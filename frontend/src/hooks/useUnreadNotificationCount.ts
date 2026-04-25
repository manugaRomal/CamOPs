import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { notificationsApi } from "../assets/api/notificationsApi";

export function useUnreadNotificationCount(): number {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const next = await notificationsApi.unreadCount();
        if (!cancelled) {
          setCount(next);
        }
      } catch {
        if (!cancelled) {
          setCount(0);
        }
      }
    }

    void load();
    const interval = window.setInterval(() => void load(), 45_000);

    function onFocus() {
      void load();
    }
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [isAuthenticated, location.pathname]);

  return count;
}
