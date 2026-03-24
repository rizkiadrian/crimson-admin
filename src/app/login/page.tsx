import Image from "next/image";
import { ENV } from "@config/env";
import { LoginForm } from "./components/login-form";

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
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
