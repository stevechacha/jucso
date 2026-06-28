const TOKEN_KEY = "jucso_access_token";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }

  const { protocol, hostname } = window.location;
  if (hostname.includes("jucso-web")) {
    return `${protocol}//${hostname.replace("jucso-web", "jucso-api")}`;
  }

  return "";
}

const API_BASE = resolveApiBase();

export const apiBaseUrl = API_BASE;
export const isApiEnabled = Boolean(API_BASE);

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function parseErrorDetail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  if ("detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map(String).join(" ");
    if (detail && typeof detail === "object") {
      return Object.entries(detail as Record<string, unknown>)
        .flatMap(([field, value]) => {
          if (Array.isArray(value)) return value.map((item) => `${field}: ${String(item)}`);
          return [`${field}: ${String(value)}`];
        })
        .join(" ");
    }
  }

  const messages = Object.entries(payload as Record<string, unknown>).flatMap(([field, value]) => {
    if (field === "non_field_errors" && Array.isArray(value)) {
      return value.map(String);
    }
    if (Array.isArray(value)) {
      return value.map((item) => `${field}: ${String(item)}`);
    }
    return [];
  });

  return messages.length > 0 ? messages.join(" ") : null;
}

function unwrapPaginated<T>(data: T | { results: T }): T {
  if (data && typeof data === "object" && "results" in data && Array.isArray(data.results)) {
    return data.results as T;
  }
  return data as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE) {
    throw new ApiError("API URL is not configured", 0);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body !== undefined && !options.isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const useAuth = options.auth ?? true;
  const token = useAuth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.isFormData
          ? (options.body as BodyInit)
          : JSON.stringify(options.body),
  });

  if (response.status === 401 && token) {
    setToken(null);
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const err = await response.json();
      detail = parseErrorDetail(err) ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) return undefined as T;

  const data = (await response.json()) as T | { results: T };
  return unwrapPaginated(data);
}
