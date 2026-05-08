"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
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
import { articleTagsService } from "@services/backoffice/article-tags";

export default function ArticleTagCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);
    try {
      const resp = await articleTagsService.create({ name });
      showNotification(resp.message, "success");
      router.push(PATHS.articleTags);
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
          title="Create Tag"
          description="Add a new article tag."
          badge="Article Tags"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <FormInput
              id="name"
              label="Tag Name"
              placeholder="e.g. JavaScript"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formErrors.name}
            />
          </FormCardBody>
          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.articleTags}
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
              Create Tag
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
