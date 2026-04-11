// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Plus,
} from "lucide-react";
import { cn } from "@lib/utils";
import { PATHS } from "@config/routing";

const NAV_ITEMS = [
  { label: "Dashboard", href: PATHS.dashboard, icon: LayoutDashboard },
  { label: "Backoffice Members", href: PATHS.backofficeMembers, icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <h1 className="text-2xl font-black text-[#CC2B2B] tracking-tighter">
          Crimson Admin
        </h1>
      </div>

      <div className="px-6 mb-8">
        <button className="w-full bg-[#CC2B2B] hover:bg-red-800 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-100 font-bold">
          <Plus size={20} strokeWidth={3} />
          <span>New Report</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-red-50 text-[#CC2B2B]"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-8 pb-2 px-4 text-[11px] font-extrabold text-neutral-900 uppercase tracking-widest opacity-80">
          System
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
        >
          <HelpCircle size={20} />
          <span>Help Center</span>
        </Link>
      </nav>

      <div className="p-6 border-t border-neutral-100">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer group">
          <div className="w-11 h-11 rounded-xl bg-neutral-900 overflow-hidden ring-2 ring-neutral-100 group-hover:ring-red-100 transition-all">
            {/* <img src="https://ui-avatars.com/api/?name=Admin&bg=000&color=fff" alt="User" /> */}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-neutral-900 truncate">
              Premium Command Center
            </p>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">
              Executive Access
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
