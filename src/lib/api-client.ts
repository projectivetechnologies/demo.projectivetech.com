/**
 * Centralized API client for IMAGE-I Insight Hub.
 *
 * Every function here automatically attaches:
 *   Authorization: Bearer <JWT>          — required by @enforce_single_token_login
 *   X-CSRFToken: <cookie value>          — required for Django POST/PUT/DELETE
 *
 * Import from this module instead of writing raw fetch() calls.
 * The JWT is read from localStorage["token"] on every call so it is always fresh.
 */

/**
 * In development:  Django runs on http://localhost:8000  (default below)
 * In production:   Set VITE_API_BASE=https://your-ec2-url.amazonaws.com in
 *                  your CI/CD environment before running `npm run build`.
 *                  The built JS will bake the correct URL in at build time.
 */
// Dev: localhost:8000  |  Prod: swap this to your EC2 URL before npm run build
//export const API_BASE = "http://localhost:8000";
export const API_BASE = "http://ec2-13-233-125-32.ap-south-1.compute.amazonaws.com";
// ── Token helpers ────────────────────────────────────────────────────────────

/** Read the JWT stored by auth-context on login. */
export function getJwt(): string | null {
  try {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  } catch {
    return null;
  }
}

/** Build the Authorization header object (empty if no token). */
export function authHeader(): Record<string, string> {
  const token = getJwt();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Read the Django CSRF cookie. */
export function getCsrfToken(): string {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split("; csrftoken=");
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? "";
  } catch {}
  return "";
}

/**
 * Decode the numeric user id from the stored JWT.
 * The Django login view embeds  _id: str(user.id)  in the payload.
 */
export function getJwtUserId(): string | undefined {
  try {
    const token = getJwt();
    if (!token) return undefined;
    const payload = JSON.parse(atob(token.split(".")[1])) as { _id?: unknown };
    const id = String(payload._id ?? "");
    return /^\d+$/.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

/**
 * Drop-in replacement for fetch() that always injects the JWT.
 * Path is appended to API_BASE; pass a full URL to override.
 */
export async function apiFetch(
  pathOrUrl: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
  const jwt = getJwt();

  const extraHeaders: Record<string, string> = {
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };

  const merged: RequestInit = {
    credentials: "include",
    ...init,
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      ...extraHeaders,
    },
  };

  return fetch(url, merged);
}

// ── Convenience helpers ───────────────────────────────────────────────────────

/** POST JSON body — returns parsed response or throws on error. */
export async function apiPost(
  path: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const response = await apiFetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string; message?: string })?.error ?? (data as { message?: string })?.message ?? "Request failed");
  return data;
}

/** POST multipart/form-data — returns parsed response or throws on error. */
export async function apiPostForm(
  path: string,
  formData: FormData,
): Promise<unknown> {
  // Do NOT set Content-Type — browser sets it with the correct boundary
  const response = await apiFetch(path, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCsrfToken(),
    },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string; message?: string })?.error ?? (data as { message?: string })?.message ?? "Upload failed");
  return data;
}

/** GET request — returns parsed JSON or throws on error. */
export async function apiGet(path: string): Promise<unknown> {
  const response = await apiFetch(path, { method: "GET" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { message?: string })?.message ?? "Request failed");
  return data;
}

/**
 * Download a file from the backend and trigger browser save dialog.
 * Always sends JWT — required by EC2 backend.
 */
export async function apiDownload(
  path: string,
  filename: string,
): Promise<void> {
  const response = await apiFetch(path, { method: "GET" });
  if (!response.ok) throw new Error("Download failed");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
