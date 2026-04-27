import { cookies } from "next/headers";
import { ILoginResponse } from "@services/auth";
import { NextResponse } from "next/server";
import { COOKIE_KEYS } from "@config/env";
/**
 * Helper untuk menyimpan token ke HTTP-Only Cookie
 */
export async function setSecureCookie(
  tokenName: string,
  item: string,
  response?: NextResponse // Tambahkan parameter opsional ini
) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 hari
  };

  if (response) {
    // Jika dipanggil dari Route Handler
    response.cookies.set(tokenName, item, cookieOptions);
  } else {
    // Jika dipanggil dari Server Action atau Server Component
    const cookieStore = await cookies();
    cookieStore.set(tokenName, item, cookieOptions);
  }
}

/**
 * Helper untuk menghapus token (Logout)
 */
export async function removeSecureCookie(
  tokenName: string,
  response?: NextResponse // Tambahkan parameter opsional seperti di setSecureCookie
) {
  if (response) {
    // Jika dipanggil dari Route Handler
    response.cookies.delete(tokenName);
  } else {
    // Jika dipanggil dari Server Action
    const cookieStore = await cookies();
    cookieStore.delete(tokenName);
  }
}

/**
 * Helper untuk mengambil token (jika butuh di server-side fetch lain)
 */
export async function getAuthToken(tokenName: string) {
  const cookieStore = await cookies();
  return cookieStore.get(tokenName)?.value;
}

/**
 * Set role_name cookie (dipanggil dari server action)
 */
export async function setRoleCookie(
  roleName: string,
  response?: NextResponse
): Promise<void> {
  await setSecureCookie(COOKIE_KEYS.roleName, roleName, response);
}

/**
 * Baca role_name dari cookie (dipanggil dari server component)
 */
export async function getRoleCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_KEYS.roleName)?.value ?? null;
}

export async function setAuth(authData: ILoginResponse, roleName?: string) {
  await setSecureCookie(COOKIE_KEYS.accessToken, authData.access_token);
  await setSecureCookie(COOKIE_KEYS.refreshToken, authData.refresh_token);
  if (roleName) {
    await setRoleCookie(roleName);
  }
  return true;
}

export async function removeAuth(response?: NextResponse) {
  await removeSecureCookie(COOKIE_KEYS.accessToken, response);
  await removeSecureCookie(COOKIE_KEYS.refreshToken, response);
  await removeSecureCookie(COOKIE_KEYS.roleName, response);
}
