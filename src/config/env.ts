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
};

export const BUSINESSFLOW = {
  backofficeRoles: ["Admin", "Backoffice"],
  salesRoles: ["Sales"],
};
