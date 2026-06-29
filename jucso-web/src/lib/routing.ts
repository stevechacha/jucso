import type { PageId } from "@/types";

const PAGE_PATHS: Record<PageId, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  news: "/news",
  documents: "/documents",
  contact: "/contact",
  track: "/track",
  reports: "/reports",
  clubs: "/clubs",
  events: "/events",
  dashboard: "/dashboard",
  "reset-password": "/reset-password",
  "verify-email": "/verify-email",
};

const PATH_PAGES = new Map<string, PageId>(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page as PageId]),
);

export function pageToPath(page: PageId): string {
  return PAGE_PATHS[page];
}

export function pathToPage(pathname: string): PageId {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (/^\/news\/[^/]+$/.test(normalized)) return "news";
  return PATH_PAGES.get(normalized) ?? "home";
}

export function getNewsIdFromPath(pathname = window.location.pathname): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const match = normalized.match(/^\/news\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function newsArticlePath(newsId: string): string {
  return `/news/${encodeURIComponent(newsId)}`;
}

export function syncUrlForPage(page: PageId, replace = false): void {
  const path = pageToPath(page);
  if (window.location.pathname === path) return;

  if (replace) {
    window.history.replaceState({ page }, "", path);
  } else {
    window.history.pushState({ page }, "", path);
  }
}

export function syncNewsArticleUrl(newsId: string): void {
  const path = newsArticlePath(newsId);
  if (window.location.pathname === path) return;
  window.history.pushState({ page: "news", newsId }, "", path);
}
