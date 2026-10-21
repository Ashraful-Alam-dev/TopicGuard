/**
 * Only allow same-origin relative paths ("/foo"), never "//evil.com" or
 * "https://...", so the ?next= param can't be used as an open redirect.
 */
export function getSafeRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/"
  return next
}

/**
 * Full-page navigation used right after login/registration. A soft
 * router.push("/") can reuse a cached "/" -> "/login" redirect that Next stored
 * while the user was still logged out, bouncing them back to the login page.
 * A hard navigation always hits the server with the fresh session cookie.
 */
export function navigateAfterAuth(next?: string | null): void {
  window.location.assign(getSafeRedirect(next))
}
