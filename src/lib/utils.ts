export { cn } from "cn";

/**
 * Returns a same-origin relative path from an untrusted `?redirect=` value, or
 * null when it would leave the site (`https://…`, `//evil.com`).
 */
export function safeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
