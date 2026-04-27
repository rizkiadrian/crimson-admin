// src/middleware.ts
import { NextResponse } from "next/server";
import { PATHS } from "@config/routing";
import type { NextRequest } from "next/server";
import { COOKIE_KEYS, ENV, BUSINESSFLOW } from "@config/env";

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
  const isSalesPage =
    pathname.startsWith(PATHS.salesDashboard) ||
    pathname.startsWith(PATHS.salesActivities);

  if (isDashboardPage || isSalesPage) {
    if (!token) {
      const loginUrl = new URL(PATHS.login, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === PATHS.login && token) {
    return NextResponse.redirect(new URL(PATHS.dashboard, request.url));
  }

  // --- 3. ROLE-BASED ROUTING ---
  const roleName = request.cookies.get(COOKIE_KEYS.roleName)?.value;

  if (roleName && token) {
    const isSalesUser = BUSINESSFLOW.salesRoles.includes(roleName);
    const isBackofficeUser = BUSINESSFLOW.backofficeRoles.includes(roleName);

    // Sales mengakses /dashboard atau /dashboard/* → redirect ke /sales-dashboard
    if (
      isSalesUser &&
      (pathname === PATHS.dashboard ||
        pathname.startsWith(PATHS.dashboard + "/"))
    ) {
      return NextResponse.redirect(new URL(PATHS.salesDashboard, request.url));
    }

    // Backoffice mengakses /sales-dashboard atau /sales-activities → redirect ke /dashboard
    if (
      isBackofficeUser &&
      (pathname.startsWith(PATHS.salesDashboard) ||
        pathname.startsWith(PATHS.salesActivities))
    ) {
      return NextResponse.redirect(new URL(PATHS.dashboard, request.url));
    }
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
