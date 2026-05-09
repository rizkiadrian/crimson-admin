"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { PATHS } from "@config/routing";
import { authorsService } from "@services/marketing/authors";

export default function AuthorCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (email) formData.append("email", email);
      if (avatarFile) formData.append("avatar", avatarFile);

      const resp = await authorsService.create(formData);
      showNotification(resp.message, "success");
      router.push(PATHS.authors);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Create Author"
          description="Add a new article author."
          badge="Authors"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="name"
                label="Name"
                placeholder="Author name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formErrors.name}
              />
              <FormInput
                id="email"
                label="Email"
                placeholder="author@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
              />
            </div>
            <div className="mt-6">
              <p className="text-sm font-semibold text-neutral-700 mb-1.5">
                Avatar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                {avatarFile ? avatarFile.name : "Upload Avatar"}
              </Button>
              {formErrors.avatar && (
                <p className="mt-1 text-xs text-red-500">{formErrors.avatar}</p>
              )}
            </div>
          </FormCardBody>
          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.authors}
              className="px-6 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-8 shadow-md shadow-primary-200/60"
              isLoading={submitting}
            >
              <Check size={16} strokeWidth={2.5} className="mr-2" />
              Create Author
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
