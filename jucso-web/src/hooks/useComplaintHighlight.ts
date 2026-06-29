import { useEffect } from "react";

/** Open a complaint from `?c=` query or notification highlight after landing on dashboard. */
export function useComplaintHighlight(
  onHighlight: (complaintId: string, tabKey?: string) => void,
) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("c");
    const fromSession = sessionStorage.getItem("jucso-highlight-complaint");
    const tabKey = sessionStorage.getItem("jucso-highlight-tab") ?? params.get("tab") ?? undefined;
    const complaintId = fromUrl ?? fromSession;
    if (!complaintId) return;

    onHighlight(complaintId, tabKey ?? undefined);
    sessionStorage.removeItem("jucso-highlight-complaint");
    sessionStorage.removeItem("jucso-highlight-tab");

    if (fromUrl) {
      params.delete("c");
      params.delete("tab");
      const query = params.toString();
      const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", next);
    }
  }, [onHighlight]);
}
