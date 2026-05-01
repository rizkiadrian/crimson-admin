"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Wrench,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Plus,
  ChevronDown,
  X,
  TrendingUp,
  Users2,
  UserSquare2,
  Bell,
  LogOut,
  Wallet,
  CreditCard,
  Image,
  ScrollText,
  Database,
  FolderTree,
} from "lucide-react";
import { cn } from "@lib/utils";
import { PATHS } from "@config/routing";
import { useSidebarStore } from "@store/useSidebarStore";
import { useUserProfile } from "@store/useUserProfile";
import { BUSINESSFLOW } from "@config/env";
import { logout } from "@actions/auth/auth.actions";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const USER_MANAGEMENT_NAV: NavEntry = {
  label: "User Management",
  icon: Users,
  items: [
    {
      label: "Backoffice Members",
      href: PATHS.backofficeMembers,
      icon: Users,
    },
    {
      label: "Client Members",
      href: PATHS.clientMembers,
      icon: UserCheck,
    },
    {
      label: "Mitra Members",
      href: PATHS.mitraMembers,
      icon: Wrench,
    },
  ],
};

const SALES_MANAGEMENT_NAV: NavEntry = {
  label: "Sales Management",
  icon: TrendingUp,
  items: [
    {
      label: "Leads",
      href: PATHS.leads,
      icon: Users2,
    },
    {
      label: "Sales Members",
      href: PATHS.salesMembers,
      icon: UserSquare2,
    },
    {
      label: "Activity Logs",
      href: PATHS.activityLogs,
      icon: FileText,
    },
  ],
};

const FINANCE_NAV: NavEntry = {
  label: "Finance",
  icon: Wallet,
  items: [
    {
      label: "Deposit Requests",
      href: PATHS.depositRequests,
      icon: CreditCard,
    },
  ],
};

const ANALYTICS_NAV: NavEntry = {
  label: "Analytics",
  icon: BarChart3,
  items: [
    {
      label: "Funnel Overview",
      href: PATHS.analyticsFunnel,
      icon: TrendingUp,
    },
    {
      label: "User Segments",
      href: PATHS.analyticsSegments,
      icon: Users,
    },
    {
      label: "Event Log",
      href: PATHS.analyticsEvents,
      icon: ScrollText,
    },
  ],
};

const MASTER_DATA_NAV: NavEntry = {
  label: "Master Data",
  icon: Database,
  items: [
    {
      label: "Service Categories",
      href: PATHS.serviceCategories,
      icon: FolderTree,
    },
  ],
};

const OTHER_NAVS: NavEntry[] = [
  { label: "Banners", href: PATHS.banners, icon: Image },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Notifikasi", href: PATHS.notifications, icon: Bell },
];

const SALES_NAVS: NavEntry[] = [
  {
    label: "Sales Dashboard",
    href: PATHS.salesDashboard,
    icon: LayoutDashboard,
  },
  { label: "Sales Activity Report", href: PATHS.salesActivities, icon: Users2 },
];

const NAV_ENTRIES: NavEntry[] = [
  { label: "Dashboard", href: PATHS.dashboard, icon: LayoutDashboard },
];

/**
 * Collapsible sidebar group with accordion behavior.
 * Auto-expands when any child route is active.
 */
function SidebarGroup({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const hasActiveChild = group.items.some((item) =>
    pathname.startsWith(item.href)
  );
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  return (
    <div>
      {/* Group toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer",
          hasActiveChild
            ? "text-primary-600"
            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
        )}
      >
        <div className="flex items-center gap-3">
          <group.icon size={20} strokeWidth={hasActiveChild ? 2.5 : 2} />
          {group.label}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {/* Collapsible children with smooth height animation */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="ml-4 pl-4 border-l border-neutral-200 space-y-0.5 py-1">
          {group.items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  roleName: string | null;
}

export function Sidebar({ roleName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebarStore();
  const { profile, clearProfile } = useUserProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navs = useMemo(() => {
    if (roleName && BUSINESSFLOW.backofficeRoles.includes(roleName)) {
      return [
        ...NAV_ENTRIES,
        USER_MANAGEMENT_NAV,
        SALES_MANAGEMENT_NAV,
        FINANCE_NAV,
        ANALYTICS_NAV,
        MASTER_DATA_NAV,
        ...OTHER_NAVS,
      ];
    }
    if (roleName && BUSINESSFLOW.salesRoles.includes(roleName)) {
      return SALES_NAVS;
    }
    return NAV_ENTRIES;
  }, [roleName]);

  const navLoaded = roleName !== null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-40 md:hidden transition-opacity backdrop-blur-sm"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "w-full md:w-64 bg-white flex flex-col fixed left-0 inset-y-0 z-50 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 md:p-8 flex items-center justify-between">
          <h1 className="text-2xl font-black text-primary-600 tracking-tighter">
            Crimson Admin
          </h1>
          <button
            onClick={close}
            className="p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 rounded-lg md:hidden transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 mb-8">
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-100 font-bold">
            <Plus size={20} strokeWidth={3} />
            <span>New Report</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {!navLoaded ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[46px] w-full bg-neutral-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            navs.map((entry) => {
              if (isGroup(entry)) {
                return (
                  <SidebarGroup
                    key={entry.label}
                    group={entry}
                    pathname={pathname}
                  />
                );
              }

              const isActive = pathname.startsWith(entry.href);
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <entry.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {entry.label}
                </Link>
              );
            })
          )}

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
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-11 h-11 rounded-xl bg-neutral-900 overflow-hidden ring-2 ring-neutral-100 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-neutral-900 truncate">
                {profile?.name ?? "Loading..."}
              </p>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">
                {roleName ?? "—"}
              </p>
            </div>
            <button
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await logout();
                  clearProfile();
                  router.push(PATHS.login);
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
