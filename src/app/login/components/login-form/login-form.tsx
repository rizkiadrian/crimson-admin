"use client";

import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";
import { AtSign } from "lucide-react";
import { setCredentials } from "@actions/auth";
import { ILoginPayload } from "@services/auth";
import { useNotificationStore } from "@store/useNotificationStore";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const credentials: ILoginPayload = {
        login: formData.get("login") as string,
        password: formData.get("password") as string,
      };

      const result = await setCredentials(credentials);

      if (!result.success) {
        const specificLoginError =
          result.errors?.login?.[0] ?? result.message ?? "Login Error";
        showNotification(specificLoginError, "error");
      } else {
        router.push("/dashboard");
      }
    } catch (e) {
      console.error("Something went wrong", e);
      showNotification("Terjadi kesalahan pada sistem.", "error");
    } finally {
      // 3. Matikan loading spinner setelah semua selesai
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      method="POST"
      className="space-y-6 relative z-10"
    >
      <FormInput
        id="corporate-email-form"
        label="CORPORATE EMAIL"
        placeholder="name@lingkarid.com"
        type="email"
        name="login"
        leftIcon={
          <AtSign className="w-5 h-5 text-secondary-600" strokeWidth={2.5} />
        }
        containerClassName="rounded-full bg-neutral-100 border-transparent focus-within:bg-white focus-within:border-neutral-300"
      />

      <FormInput
        id="password"
        label="PASSWORD"
        placeholder="••••••••"
        type="password"
        name="password"
        containerClassName="rounded-full bg-neutral-100 border-transparent focus-within:bg-white focus-within:border-neutral-300"
      />

      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          className="w-full h-12 text-base"
          isLoading={submitting}
        >
          Login
        </Button>
      </div>
    </form>
  );
}
