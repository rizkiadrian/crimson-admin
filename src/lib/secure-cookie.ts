import { cookies } from "next/headers";
import { ILoginResponse } from "@services/auth";
import { COOKIE_KEYS } from "@config/env";
/**
 * Helper untuk menyimpan token ke HTTP-Only Cookie
 */
export async function setSecureCookie(tokenName: string, item: string) {
  const cookieStore = await cookies();

  cookieStore.set(tokenName, item, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Set expiry sesuai kebutuhan, misal 1 hari (dalam detik)
    maxAge: 60 * 60 * 24,
  });
}

/**
 * Helper untuk menghapus token (Logout)
 */
export async function removeSecureCookie(tokenName: string) {
  const cookieStore = await cookies();
  cookieStore.delete(tokenName);
}

/**
 * Helper untuk mengambil token (jika butuh di server-side fetch lain)
 */
export async function getAuthToken(tokenName: string) {
  const cookieStore = await cookies();
  return cookieStore.get(tokenName)?.value;
}

export async function setAuth(authData: ILoginResponse) {
  await setSecureCookie(COOKIE_KEYS.accessToken, authData.access_token);
  await setSecureCookie(COOKIE_KEYS.refreshToken, authData.refresh_token);
  return true;
}

export function removeAuth() {
  removeSecureCookie(COOKIE_KEYS.accessToken);
  removeSecureCookie(COOKIE_KEYS.refreshToken);
}
