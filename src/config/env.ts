export const ENV = {
  // Server-side
  API_URL: process.env.API_URL,
  // Client-side
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Crimson Admin Panel",
  API_PROXY_PATH: process.env.NEXT_PUBLIC_API_PROXY_PATH,
};

export const COOKIE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  roleName: "role_name",
};

export const ROLE_NOTIFICATION_ENDPOINT: Record<string, string> = {
  Admin: "/admin/notifications",
  Backoffice: "/backoffice/notifications",
  Finance: "/finance/notifications",
  Marketing: "/marketing/notifications",
  Sales: "/sales/notifications",
};

export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  Admin: "/dashboard",
  Backoffice: "/backoffice-dashboard",
  Finance: "/finance-dashboard",
  Marketing: "/marketing-dashboard",
  Sales: "/sales-dashboard",
};
