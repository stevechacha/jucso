import { useCallback, useEffect, useState } from "react";
import type { PageId } from "@/types";
import { pathToPage, syncUrlForPage } from "@/lib/routing";

export function usePageNavigation(): [PageId, (target: PageId) => void] {
  const [page, setPageState] = useState<PageId>(() => pathToPage(window.location.pathname));

  const setPage = useCallback((value: PageId) => {
    setPageState(value);
    syncUrlForPage(value);
  }, []);

  useEffect(() => {
    const onPopState = () => setPageState(pathToPage(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goToPage = useCallback(
    (target: PageId) => {
      setPage(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setPage],
  );

  return [page, goToPage];
}
