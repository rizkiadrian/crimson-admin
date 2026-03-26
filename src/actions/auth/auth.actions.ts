"use server";

import { handleResponseError } from "@lib/utils";
import { setAuth } from "@lib/secure-cookie";
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
      await setAuth(authData);
    }
    return result;
  } catch {
    return handleResponseError<Record<string, string[]>>({
      message: "Login failed",
    });
  }
}
