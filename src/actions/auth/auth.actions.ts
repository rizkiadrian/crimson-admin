"use server";

import { handleResponseError } from "@lib/utils";
import { ILoginPayload, ILoginResponse } from "@services/auth";
import { IApiError, IApiResponse } from "@services/general";

export async function setCredentials(
  credentials: ILoginPayload
): Promise<IApiResponse<ILoginResponse> | IApiError<Record<string, string[]>>> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();
    return result;
  } catch {
    return handleResponseError<Record<string, string[]>>({
      message: "Login failed",
    });
  }
}
