/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, Save, Upload } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { FormCheckbox } from "@app/components/ui/FormCheckbox";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { TiptapEditor } from "@app/components/ui/TiptapEditor";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { PATHS } from "@config/routing";
import { articlesService } from "@services/marketing/articles";
import { authorsService } from "@services/marketing/authors";
import { articleCategoriesService } from "@services/marketing/article-categories";
import { articleTagsService } from "@services/marketing/article-tags";
import type { IArticle } from "@services/marketing/articles";
import type { IAuthor } from "@services/marketing/authors";
import type { IArticleCategory } from "@services/marketing/article-categories";
import type { IArticleTag } from "@services/marketing/article-tags";

export default function ArticleEditPage() {
  const params = useParams();
  const id = params.id as string;
  const fetcher = useCallback(() => articlesService.detail(Number(id)), [id]);
  const { data, isLoading, error } = useDetailData<IArticle>({
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
            backHref={PATHS.articles}
            backLabel="Back"
          />
        </FormCard>
      </div>
    );

  return <ArticleEditForm initialData={data} />;
}

function ArticleEditForm({ initialData }: { initialData: IArticle }) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData.title);
  const [body, setBody] = useState(initialData.body || "");
  const [excerpt, setExcerpt] = useState(initialData.excerpt || "");
  const [authorId, setAuthorId] = useState(String(initialData.author_id || ""));
  const [categoryId, setCategoryId] = useState(
    String(initialData.category_id || "")
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initialData.tags?.map((t) => t.id) || []
  );
  const [isFeatured, setIsFeatured] = useState(initialData.is_featured);
  const [metaTitle, setMetaTitle] = useState(initialData.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(
    initialData.meta_description || ""
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [authors, setAuthors] = useState<IAuthor[]>([]);
  const [categories, setCategories] = useState<IArticleCategory[]>([]);
  const [tags, setTags] = useState<IArticleTag[]>([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [authorLoading, setAuthorLoading] = useState(false);

  useEffect(() => {
    articleCategoriesService
      .list({ per_page: 100 })
      .then((r) => setCategories(r.data));
    articleTagsService.list({ per_page: 100 }).then((r) => setTags(r.data));
  }, []);

  useEffect(() => {
    setAuthorLoading(true);
    const t = setTimeout(() => {
      authorsService.list({ search: authorSearch, per_page: 20 }).then((r) => {
        setAuthors(r.data);
        setAuthorLoading(false);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [authorSearch]);

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const resp = await articlesService.uploadImage(file);
    return resp.data.url;
  }, []);

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSaveDraft = async () => {
    setFormErrors({});
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("status", "draft");
      if (title) formData.append("title", title);
      if (body) formData.append("body", body);
      if (excerpt) formData.append("excerpt", excerpt);
      if (authorId) formData.append("author_id", authorId);
      if (categoryId) formData.append("category_id", categoryId);
      selectedTagIds.forEach((id) => formData.append("tag_ids[]", String(id)));
      formData.append("is_featured", isFeatured ? "1" : "0");
      if (metaTitle) formData.append("meta_title", metaTitle);
      if (metaDescription) formData.append("meta_description", metaDescription);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      formData.append("_method", "PUT");

      const resp = await articlesService.update(initialData.id, formData);
      showNotification(resp.message, "success");
      router.push(PATHS.articles);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("excerpt", excerpt || "");
      if (authorId) formData.append("author_id", authorId);
      if (categoryId) formData.append("category_id", categoryId);
      selectedTagIds.forEach((id) => formData.append("tag_ids[]", String(id)));
      formData.append("is_featured", isFeatured ? "1" : "0");
      if (metaTitle) formData.append("meta_title", metaTitle);
      if (metaDescription) formData.append("meta_description", metaDescription);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      formData.append("_method", "PUT");

      const resp = await articlesService.update(initialData.id, formData);
      showNotification(resp.message, "success");
      router.push(PATHS.articles);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const authorOptions = authors.map((a) => ({
    label: a.name,
    value: String(a.id),
  }));
  const categoryOptions = [
    { label: "— No Category —", value: "" },
    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
  ];

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Edit Article"
          description={`Editing "${initialData.title}"`}
          badge="Articles"
        />
        <form onSubmit={handleSubmit}>
          <FormCardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="title"
                label="Title"
                placeholder="Article title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={formErrors.title}
              />
              <FormSelect
                id="author_id"
                label="Author"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                options={authorOptions}
                placeholder="Select author"
                error={formErrors.author_id}
                onSearch={setAuthorSearch}
                isLoading={authorLoading}
                searchPlaceholder="Search authors..."
              />
              <FormSelect
                id="category_id"
                label="Category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categoryOptions}
                placeholder="Select category"
                error={formErrors.category_id}
              />
              <FormInput
                id="excerpt"
                label="Excerpt"
                placeholder="Short summary"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                as="textarea"
                error={formErrors.excerpt}
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-neutral-700 mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${selectedTagIds.includes(tag.id) ? "bg-primary-50 border-primary-300 text-primary-700" : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {formErrors.tag_ids && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.tag_ids}
                </p>
              )}
            </div>

            <div className="mt-6">
              <TiptapEditor
                label="Body"
                required
                value={body}
                onChange={setBody}
                onImageUpload={handleImageUpload}
                placeholder="Write your article content..."
                error={formErrors.body}
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-neutral-700 mb-1.5">
                Thumbnail
              </p>
              {thumbnailFile ? (
                <div className="mb-3">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Preview"
                    className="rounded-lg object-cover w-40 h-40"
                  />
                </div>
              ) : initialData.thumbnail_url ? (
                <div className="mb-3">
                  <img
                    src={initialData.thumbnail_url}
                    alt="Current thumbnail"
                    className="rounded-lg object-cover w-40 h-40"
                  />
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                {thumbnailFile ? thumbnailFile.name : "Change Thumbnail"}
              </Button>
              {formErrors.thumbnail && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.thumbnail}
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput
                id="meta_title"
                label="Meta Title"
                placeholder="SEO title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                error={formErrors.meta_title}
              />
              <FormInput
                id="meta_description"
                label="Meta Description"
                placeholder="SEO description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                error={formErrors.meta_description}
              />
            </div>

            <div className="mt-6">
              <FormCheckbox
                id="is_featured"
                label="Featured Article"
                checked={isFeatured}
                onChange={setIsFeatured}
              />
            </div>
          </FormCardBody>

          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.articles}
              className="px-6 font-medium"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outlined"
                className="px-6"
                onClick={handleSaveDraft}
                isLoading={submitting}
              >
                <Save size={16} strokeWidth={2.5} className="mr-2" />
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="px-8 shadow-md shadow-primary-200/60"
                isLoading={submitting}
              >
                <Check size={16} strokeWidth={2.5} className="mr-2" />
                Update Article
              </Button>
            </div>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
