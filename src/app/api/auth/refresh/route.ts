// src/app/api/auth/refresh/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_KEYS, ENV } from "@config/env";
import { removeAuth, setSecureCookie } from "@lib/secure-cookie";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_KEYS.refreshToken)?.value;
  const accessToken = cookieStore.get(COOKIE_KEYS.accessToken)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    const res = await fetch(`${ENV.API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error("Refresh failed");

    // SET KEMBALI COOKIE HTTPONLY (Hanya Server yang bisa!)
    const response = NextResponse.json({ success: true });
    await setSecureCookie(
      COOKIE_KEYS.accessToken,
      data.data.access_token,
      response
    );

    return response;
  } catch {
    // === INI KUNCINYA ===
    const response = NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
    await removeAuth(response);
    return response;
  }
}
