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
import { articleCategoriesService } from "@services/marketing/article-categories";

export default function ArticleCategoryCreatePage() {
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
      const resp = await articleCategoriesService.create({ name });
      showNotification(resp.message, "success");
      router.push(PATHS.articleCategories);
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
          title="Create Category"
          description="Add a new article category."
          badge="Article Categories"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <FormInput
              id="name"
              label="Category Name"
              placeholder="e.g. Technology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formErrors.name}
            />
          </FormCardBody>
          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.articleCategories}
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
              Create Category
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
