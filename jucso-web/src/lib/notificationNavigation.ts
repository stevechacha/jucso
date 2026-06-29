/** Build dashboard URLs that open a specific complaint after sign-in. */
export function dashboardComplaintLink(trackingId: string, tab?: string): string {
  const params = new URLSearchParams({ c: trackingId });
  if (tab) params.set("tab", tab);
  return `/dashboard?${params.toString()}`;
}

export function applyNotificationLink(link: string, setPage: (page: "dashboard") => void): void {
  try {
    const url = new URL(link, window.location.origin);
    if (url.pathname !== "/dashboard") {
      if (link.startsWith("/")) window.location.href = link;
      return;
    }
    setPage("dashboard");
    const complaintId = url.searchParams.get("c");
    const tab = url.searchParams.get("tab");
    if (complaintId) sessionStorage.setItem("jucso-highlight-complaint", complaintId);
    if (tab) sessionStorage.setItem("jucso-highlight-tab", tab);
    const hash = url.hash.replace(/^#/, "");
    if (hash) {
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}#${hash}`);
    }
  } catch {
    setPage("dashboard");
  }
}
