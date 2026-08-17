import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "access_token";
const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = [...AUTH_ROUTES, "/forgot-password", "/about"];

/** Lightweight route gate based on cookie presence only (no signature verification — that happens server-side on every API call). */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE);
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!hasSession && !isPublicRoute && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
