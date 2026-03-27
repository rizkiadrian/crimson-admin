// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@app/components/layout/Sidebar";
import { Navbar } from "@app/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <Navbar />

        {/* AREA KONTEN: Warna dasar tetap putih agar transisi ke lengkungan mulus */}
        <div className="flex-1 bg-white relative">
          {/* Main content: Warna abu-abu (bg-[#F8F9FA]) dengan rounded-tl besar */}
          <main className="w-full h-full bg-[#F8F9FA] rounded-tl-[50px] border-t border-l border-neutral-200/60 p-12 overflow-y-auto shadow-[inset_10px_10px_30px_-15px_rgba(0,0,0,0.03)]">
            <div className="max-w-350 mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
