// src/middleware.ts
import { NextResponse } from "next/server";
import { PATHS } from "@config/routing";
import type { NextRequest } from "next/server";
import { COOKIE_KEYS, ENV, ROLE_DASHBOARD_MAP } from "@config/env";

/** Paths each role is allowed to access (besides their own dashboard) */
const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  Admin: [
    "/dashboard",
    "/backoffice-dashboard",
    "/finance-dashboard",
    "/marketing-dashboard",
  ],
  Backoffice: [
    "/backoffice-dashboard",
    "/dashboard/backoffice-members",
    "/dashboard/client-members",
    "/dashboard/mitra-members",
    "/dashboard/sales-members",
    "/dashboard/leads",
    "/dashboard/activity-logs",
    "/dashboard/service-categories",
    "/dashboard/notifications",
  ],
  Finance: [
    "/finance-dashboard",
    "/dashboard/deposit-requests",
    "/dashboard/notifications",
  ],
  Marketing: [
    "/marketing-dashboard",
    "/dashboard/banners",
    "/dashboard/vouchers",
    "/dashboard/referral-campaigns",
    "/dashboard/referrals",
    "/dashboard/articles",
    "/dashboard/authors",
    "/dashboard/article-categories",
    "/dashboard/article-tags",
    "/dashboard/event-registry",
    "/dashboard/popup-promotions",
    "/dashboard/analytics",
    "/dashboard/notifications",
  ],
  Sales: ["/sales-dashboard", "/sales-activities"],
};

function isPathAllowed(roleName: string, pathname: string): boolean {
  // Admin can access all /dashboard/* pages
  if (roleName === "Admin" && pathname.startsWith("/dashboard")) return true;

  const allowed = ROLE_ALLOWED_PATHS[roleName];
  if (!allowed) return false;

  return allowed.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

function isDashboardPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/backoffice-dashboard") ||
    pathname.startsWith("/finance-dashboard") ||
    pathname.startsWith("/marketing-dashboard") ||
    pathname.startsWith("/sales-dashboard") ||
    pathname.startsWith("/sales-activities")
  );
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_KEYS.accessToken)?.value;
  const { pathname } = request.nextUrl;

  // --- 1. HANDLE API PROXY (Inject Token ke Header) ---
  if (pathname.startsWith(ENV.API_PROXY_PATH ?? "")) {
    const requestHeaders = new Headers(request.headers);
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // --- 2. HANDLE AUTH REDIRECTION (Proteksi Rute) ---
  if (isDashboardPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL(PATHS.login, request.url));
    }
  }

  if (pathname === PATHS.login && token) {
    const roleName = request.cookies.get(COOKIE_KEYS.roleName)?.value;
    const defaultDashboard =
      (roleName && ROLE_DASHBOARD_MAP[roleName]) || PATHS.dashboard;
    return NextResponse.redirect(new URL(defaultDashboard, request.url));
  }

  // --- 3. ROLE-BASED ROUTING ---
  const roleName = request.cookies.get(COOKIE_KEYS.roleName)?.value;

  if (roleName && token && isDashboardPath(pathname)) {
    const defaultDashboard = ROLE_DASHBOARD_MAP[roleName] || PATHS.dashboard;

    // Redirect root to role's default dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL(defaultDashboard, request.url));
    }

    // Check if user can access this path
    if (!isPathAllowed(roleName, pathname)) {
      return NextResponse.redirect(new URL(defaultDashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/v1/:path*",
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
