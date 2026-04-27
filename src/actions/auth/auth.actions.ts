"use server";

import { handleResponseError } from "@lib/utils";
import { setAuth, setRoleCookie, removeAuth } from "@lib/secure-cookie";
import { ILoginPayload, ILoginResponse } from "@services/auth";
import { IApiError, IApiResponse } from "@services/general";
import { COOKIE_KEYS } from "@config/env";

type TLoginResult =
  | IApiResponse<ILoginResponse>
  | IApiError<Record<string, string[]>>;

export async function setCredentials(
  credentials: ILoginPayload
): Promise<TLoginResult> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const result: TLoginResult = await response.json();
    if (result.success) {
      const authData = result.data;

      // Fetch /auth/me to get role_name
      let roleName: string | undefined;
      try {
        const meResponse = await fetch(`${process.env.API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authData.access_token}`,
          },
        });
        if (meResponse.ok) {
          const meResult = await meResponse.json();
          if (meResult.success && meResult.data?.role_name) {
            roleName = meResult.data.role_name;
          }
        }
      } catch {
        // Graceful degradation: login succeeds without role cookie
      }

      await setAuth(authData, roleName);
    }
    return result;
  } catch {
    return handleResponseError<Record<string, string[]>>({
      message: "Login failed",
    });
  }
}

/**
 * Sync role cookie — dipanggil dari useUserProfile store setelah fetchProfile berhasil
 */
export async function syncRoleCookie(roleName: string): Promise<void> {
  await setRoleCookie(roleName);
}

/**
 * Logout — hapus semua cookies dan revoke token di backend
 */
export async function logout(): Promise<{ success: boolean }> {
  try {
    const { getAuthToken } = await import("@lib/secure-cookie");
    const token = await getAuthToken(COOKIE_KEYS.accessToken);

    // Call backend logout to revoke tokens (best-effort)
    if (token) {
      try {
        await fetch(`${process.env.API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Backend logout failed — still clear cookies locally
      }
    }

    // Clear all cookies
    await removeAuth();
    return { success: true };
  } catch {
    // Even if something fails, try to clear cookies
    await removeAuth();
    return { success: true };
  }
}
