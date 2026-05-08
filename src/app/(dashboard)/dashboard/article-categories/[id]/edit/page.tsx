"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check } from "lucide-react";
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
import { articleCategoriesService } from "@services/backoffice/article-categories";
import type { IArticleCategory } from "@services/backoffice/article-categories";

export default function ArticleCategoryEditPage() {
  const params = useParams();
  const id = params.id as string;
  const fetcher = useCallback(
    () => articleCategoriesService.detail(Number(id)),
    [id]
  );
  const { data, isLoading, error } = useDetailData<IArticleCategory>({
    fetcher,
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="w-full">
        <FormCard>
          <FormCardLoading />
        </FormCard>
      </div>
    );
  if (error || !data)
    return (
      <div className="w-full">
        <FormCard>
          <FormCardError
            message={error || "Not found"}
            title="Failed to load"
            backHref={PATHS.articleCategories}
            backLabel="Back"
          />
        </FormCard>
      </div>
    );

  return <CategoryEditForm initialData={data} />;
}

function CategoryEditForm({ initialData }: { initialData: IArticleCategory }) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [name, setName] = useState(initialData.name);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);
    try {
      const resp = await articleCategoriesService.update(initialData.id, {
        name,
      });
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
          title="Edit Category"
          description={`Editing "${initialData.name}"`}
          badge="Article Categories"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <FormInput
              id="name"
              label="Category Name"
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
              Update Category
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
