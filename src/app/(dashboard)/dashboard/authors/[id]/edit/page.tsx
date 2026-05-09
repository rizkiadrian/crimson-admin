"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, Upload } from "lucide-react";
import Image from "next/image";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { PATHS } from "@config/routing";
import { authorsService } from "@services/marketing/authors";
import type { IAuthor } from "@services/marketing/authors";

export default function AuthorEditPage() {
  const params = useParams();
  const authorId = params.id as string;

  const fetcher = useCallback(
    () => authorsService.detail(Number(authorId)),
    [authorId]
  );
  const {
    data: author,
    isLoading,
    error,
  } = useDetailData<IAuthor>({ fetcher, enabled: !!authorId });

  if (isLoading) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardLoading />
        </FormCard>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Author not found"}
            title="Failed to load author"
            backHref={PATHS.authors}
            backLabel="Back to Authors"
          />
        </FormCard>
      </div>
    );
  }

  return <AuthorEditForm initialData={author} />;
}

function AuthorEditForm({ initialData }: { initialData: IAuthor }) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email || "");
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
      formData.append("email", email || "");
      if (avatarFile) formData.append("avatar", avatarFile);
      formData.append("_method", "PUT");

      const resp = await authorsService.update(initialData.id, formData);
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
          title="Edit Author"
          description={`Editing "${initialData.name}"`}
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
              {initialData.avatar_url && !avatarFile && (
                <div className="mb-3">
                  <Image
                    src={initialData.avatar_url}
                    alt={initialData.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-20 h-20"
                  />
                </div>
              )}
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
                {avatarFile ? avatarFile.name : "Change Avatar"}
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
              Update Author
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
