import { useCallback, useEffect, useState } from "react";

export function tabToHash(tab: string): string {
  return tab.replace(/\s+/g, "-").toLowerCase();
}

export function hashToTab<T extends string>(hash: string, tabs: readonly T[]): T | null {
  const normalized = hash.replace(/^#/, "");
  return tabs.find((t) => tabToHash(t) === normalized) ?? null;
}

export function useDashboardTab<T extends string>(tabs: readonly T[], defaultTab: T): [T, (tab: T) => void] {
  const [tab, setTabState] = useState<T>(() => {
    if (!window.location.pathname.includes("dashboard")) return defaultTab;
    return hashToTab(window.location.hash, tabs) ?? defaultTab;
  });

  const setTab = useCallback(
    (next: T) => {
      setTabState(next);
      if (!window.location.pathname.includes("dashboard")) return;
      const hash = `#${tabToHash(next)}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(
          { ...window.history.state, dashboardTab: next },
          "",
          `${window.location.pathname}${hash}`,
        );
      }
    },
    [],
  );

  useEffect(() => {
    const syncFromHash = () => {
      if (!window.location.pathname.includes("dashboard")) return;
      const fromHash = hashToTab(window.location.hash, tabs);
      if (fromHash) setTabState(fromHash);
    };

    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [tabs]);

  useEffect(() => {
    if (!window.location.pathname.includes("dashboard")) return;
    if (!window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}#${tabToHash(defaultTab)}`,
      );
    }
  }, [defaultTab]);

  return [tab, setTab];
}
