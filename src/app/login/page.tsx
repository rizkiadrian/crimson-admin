import Image from "next/image";
import { ENV } from "@config/env";

export default function LoginPage() {
  return (
    <main className="grow flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4">
            <Image
              src="/assets/icons/login-shield.svg"
              width={32}
              height={40}
              alt="shield"
              className="w-8 h-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-primary font-headline text-text-accent">
            {ENV.APP_NAME}
          </h1>
          <p className="text-secondary font-medium tracking-tight mt-1">
            Admin Access Control
          </p>
        </div>
        <div className="rounded-3xl shadow-[0_20px_50px_rgba(25,28,29,0.05)] relative bg-white p-8">
          <form className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary ml-1">
                Corporate Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors text-xl">
                    alternate_email
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:bg-white transition-all text-on-surface text-sm placeholder:text-slate-400 focus:ring-slate-200 text-slate-900"
                  id="email"
                  name="email"
                  placeholder="name@crimson-executive.com"
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-secondary">
                  Password
                </label>
                <a
                  className="text-[10px] uppercase tracking-[0.05em] font-bold text-primary hover:text-primary-container transition-colors"
                  href="#"
                >
                  Forgot Key?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors text-xl">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:bg-white transition-all text-on-surface text-sm placeholder:text-slate-400 focus:ring-slate-200 text-slate-900"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                  <span className="material-symbols-outlined text-outline hover:text-secondary text-xl">
                    visibility
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                type="submit"
              >
                <span>Login</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
