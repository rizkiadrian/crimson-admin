// src/middleware.ts
import { NextResponse } from "next/server";
import { PATHS } from "@config/routing";
import type { NextRequest } from "next/server";
import { COOKIE_KEYS, ENV } from "@config/env";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_KEYS.accessToken)?.value;
  const { pathname } = request.nextUrl;

  // --- 1. HANDLE API PROXY (Inject Token ke Header) ---
  // Jika request mengarah ke API v1, kita suntikkan token jika ada
  if (pathname.startsWith(ENV.API_PROXY_PATH ?? "")) {
    const requestHeaders = new Headers(request.headers);

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    // Teruskan request dengan header yang sudah dimodifikasi
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // --- 2. HANDLE AUTH REDIRECTION (Proteksi Rute) ---
  const isDashboardPage =
    pathname.startsWith(PATHS.dashboard) || pathname === "/";

  if (isDashboardPage) {
    if (!token) {
      const loginUrl = new URL(PATHS.login, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === PATHS.login && token) {
    return NextResponse.redirect(new URL(PATHS.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Tambahkan '/api/v1/:path*' agar middleware juga menangkap rute API tersebut
    "/api/v1/:path*",
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
