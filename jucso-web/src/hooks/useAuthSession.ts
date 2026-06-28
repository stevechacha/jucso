import { useCallback, useEffect, useState } from "react";
import { isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { PageId, User } from "@/types";
import { syncUrlForPage } from "@/lib/routing";

interface UseAuthSessionOptions {
  onNavigate: (page: PageId) => void;
  onUnauthorized: () => void;
}

export function useAuthSession({ onNavigate, onUnauthorized }: UseAuthSessionOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(isApiEnabled);

  const logout = useCallback(() => {
    jucsoApi.logout();
    setUser(null);
    onUnauthorized();
  }, [onUnauthorized]);

  useEffect(() => {
    if (!isApiEnabled) {
      setSessionLoading(false);
      return;
    }

    let cancelled = false;

    void jucsoApi
      .me()
      .then((sessionUser) => {
        if (cancelled) return;
        setUser(sessionUser);
        onNavigate("dashboard");
        syncUrlForPage("dashboard", true);
        window.scrollTo({ top: 0, behavior: "instant" });
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onNavigate]);

  const login = useCallback((nextUser: User) => {
    setUser(nextUser);
    onNavigate("dashboard");
  }, [onNavigate]);

  return {
    user,
    setUser,
    sessionLoading,
    login,
    logout,
  };
}
