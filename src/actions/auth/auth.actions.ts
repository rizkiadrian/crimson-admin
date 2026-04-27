"use server";

import { handleResponseError } from "@lib/utils";
import { setAuth, setRoleCookie } from "@lib/secure-cookie";
import { ILoginPayload, ILoginResponse } from "@services/auth";
import { IApiError, IApiResponse } from "@services/general";

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
