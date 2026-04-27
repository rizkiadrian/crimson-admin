// src/app/(dashboard)/layout.tsx
import { cookies } from "next/headers";
import { COOKIE_KEYS } from "@config/env";
import { Sidebar } from "@app/components/layout/Sidebar";
import { Navbar } from "@app/components/layout/Navbar";
import { BackofficeStatus } from "@app/components/core/BackofficeStatus";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const roleName = cookieStore.get(COOKIE_KEYS.roleName)?.value ?? null;

  return (
    <div className="min-h-screen bg-white flex">
      <BackofficeStatus roleName={roleName} />
      <Sidebar roleName={roleName} />

      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <Navbar roleName={roleName} />

        {/* AREA KONTEN: Warna dasar tetap putih agar transisi ke lengkungan mulus */}
        <div className="flex-1 bg-white relative">
          {/* Main content: Warna abu-abu (bg-neutral-50) dengan rounded-tl besar */}
          <main className="w-full h-full bg-neutral-50 md:rounded-tl-[50px] border-t border-l border-neutral-200/60 p-4 md:p-12 overflow-y-auto shadow-[inset_10px_10px_30px_-15px_rgba(0,0,0,0.03)]">
            <div className="max-w-350 mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
