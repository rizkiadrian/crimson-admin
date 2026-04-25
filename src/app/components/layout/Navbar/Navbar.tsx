"use client";

// src/components/layout/Navbar.tsx
import { Search, Bell, Mail, MessageSquare, Menu } from "lucide-react";
import { useSidebarStore } from "@store/useSidebarStore";

export function Navbar() {
  const toggleSidebar = useSidebarStore((state) => state.toggle);

  return (
    <header className="h-20 bg-white px-4 md:px-12 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-neutral-800 hover:bg-neutral-100 rounded-lg md:hidden transition-all"
        >
          <Menu size={24} />
        </button>
        <div className="relative w-full max-w-xs lg:w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-900">
            <Search size={18} strokeWidth={2.5} />
          </span>
          <input
            type="text"
            placeholder="Search executive database..."
            className="w-full bg-neutral-100 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium text-neutral-900 placeholder:text-neutral-600 outline-none focus:ring-2 ring-red-200 transition-all"
          />
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-10 text-[15px] font-bold">
        <a
          href="#"
          className="text-neutral-900 border-b-2 border-[#CC2B2B] pb-1 transition-all"
        >
          Overview
        </a>
        <a
          href="#"
          className="text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          History
        </a>
        <a
          href="#"
          className="text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          Export
        </a>
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-2 mr-1 md:mr-2">
          <button className="p-2 text-neutral-800 hover:bg-neutral-100 rounded-full relative transition-all">
            <Bell
              size={20}
              strokeWidth={2}
              className="md:w-[22px] md:h-[22px]"
            />
            <span className="absolute top-2 right-2 w-2 h-2 md:top-2.5 md:right-2.5 md:w-2.5 md:h-2.5 bg-[#CC2B2B] border-2 border-white rounded-full"></span>
          </button>
          <button className="p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all hidden sm:block">
            <Mail
              size={20}
              strokeWidth={2}
              className="md:w-[22px] md:h-[22px]"
            />
          </button>
          <button className="p-2 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all hidden sm:block">
            <MessageSquare
              size={20}
              strokeWidth={2}
              className="md:w-[22px] md:h-[22px]"
            />
          </button>
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-900 overflow-hidden ring-2 ring-neutral-100 shadow-sm hover:ring-red-200 cursor-pointer transition-all shrink-0">
          {/* <img src="https://ui-avatars.com/api/?name=Admin&bg=222&color=fff" alt="Profile" /> */}
        </div>
      </div>
    </header>
  );
}
