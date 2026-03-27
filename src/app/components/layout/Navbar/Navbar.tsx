// src/components/layout/Navbar.tsx
import { Search, Bell, Mail, MessageSquare } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-20 bg-white px-12 flex items-center justify-between">
      <div className="relative w-80">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-900">
          <Search size={18} strokeWidth={2.5} />
        </span>
        <input
          type="text"
          placeholder="Search executive database..."
          className="w-full bg-neutral-100 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium text-neutral-900 placeholder:text-neutral-600 outline-none focus:ring-2 ring-red-200 transition-all"
        />
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <button className="p-2.5 text-neutral-800 hover:bg-neutral-100 rounded-full relative transition-all">
            <Bell size={22} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#CC2B2B] border-2 border-white rounded-full"></span>
          </button>
          <button className="p-2.5 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all">
            <Mail size={22} strokeWidth={2} />
          </button>
          <button className="p-2.5 text-neutral-800 hover:bg-neutral-100 rounded-full transition-all">
            <MessageSquare size={22} strokeWidth={2} />
          </button>
        </div>
        <div className="w-10 h-10 rounded-full bg-neutral-900 overflow-hidden ring-2 ring-neutral-100 shadow-sm hover:ring-red-200 cursor-pointer transition-all">
          {/* <img src="https://ui-avatars.com/api/?name=Admin&bg=222&color=fff" alt="Profile" /> */}
        </div>
      </div>
    </header>
  );
}
