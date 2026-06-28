import type { PageId } from "@/types";

const PAGE_PATHS: Record<PageId, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  news: "/news",
  documents: "/documents",
  contact: "/contact",
  dashboard: "/dashboard",
  "reset-password": "/reset-password",
};

const PATH_PAGES = new Map<string, PageId>(
  Object.entries(PAGE_PATHS).map(([page, path]) => [path, page as PageId]),
);

export function pageToPath(page: PageId): string {
  return PAGE_PATHS[page];
}

export function pathToPage(pathname: string): PageId {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return PATH_PAGES.get(normalized) ?? "home";
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
