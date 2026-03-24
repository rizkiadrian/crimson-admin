"use client";

import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { AtSign, Eye } from "lucide-react";

export function LoginForm() {
  return (
    <form className="space-y-6 relative z-10">
      <FormInput
        id="corporate-email"
        label="CORPORATE EMAIL"
        placeholder="name@crimson-executive.com"
        type="email"
        // Tambahkan ikon di sebelah kiri
        leftIcon={
          <AtSign className="w-5 h-5 text-secondary-600" strokeWidth={2.5} />
        }
        // Timpa wrapper agar berbentuk bulat penuh dan background abu-abu
        containerClassName="rounded-full bg-neutral-100 border-transparent focus-within:bg-white focus-within:border-neutral-300"
      />
      <FormInput
        id="password"
        label="PASSWORD"
        placeholder="••••••••"
        type="password"
        containerClassName="rounded-full bg-neutral-100 border-transparent focus-within:bg-white focus-within:border-neutral-300"
      />
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          className="w-full h-12 text-base"
        >
          Login
        </Button>
      </div>
    </form>
  );
}
