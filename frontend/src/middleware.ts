import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "access_token";
const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/classroom"];

/**
 * Lightweight route gating based on cookie presence only. This does not
 * verify the JWT (middleware runs on the edge and doesn't have the
 * server's JWT secret) — real enforcement still happens on every API
 * call. This just avoids flashing protected/auth pages to the wrong
 * audience before the API call would reject them anyway.
 */
export function middleware(request: NextRequest) {
  const hasToken = request.cookies.has(AUTH_COOKIE);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((isAuthRoute || pathname === "/") && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/classroom/:path*"],
};
