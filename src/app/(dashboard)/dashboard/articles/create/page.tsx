/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "@app/components/ui/FormCard";
import { TiptapEditor } from "@app/components/ui/TiptapEditor";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { PATHS } from "@config/routing";
import { articlesService } from "@services/backoffice/articles";
import { authorsService } from "@services/backoffice/authors";
import { articleCategoriesService } from "@services/backoffice/article-categories";
import { articleTagsService } from "@services/backoffice/article-tags";
import type { IAuthor } from "@services/backoffice/authors";
import type { IArticleCategory } from "@services/backoffice/article-categories";
import type { IArticleTag } from "@services/backoffice/article-tags";

export default function ArticleCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Options
  const [authors, setAuthors] = useState<IAuthor[]>([]);
  const [categories, setCategories] = useState<IArticleCategory[]>([]);
  const [tags, setTags] = useState<IArticleTag[]>([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [authorLoading, setAuthorLoading] = useState(false);

  // Load categories and tags on mount
  useEffect(() => {
    articleCategoriesService
      .list({ per_page: 100 })
      .then((r) => setCategories(r.data));
    articleTagsService.list({ per_page: 100 }).then((r) => setTags(r.data));
  }, []);

  // Author search with debounce
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

      const resp = await articlesService.create(formData);
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
      if (excerpt) formData.append("excerpt", excerpt);
      if (authorId) formData.append("author_id", authorId);
      if (categoryId) formData.append("category_id", categoryId);
      selectedTagIds.forEach((id) => formData.append("tag_ids[]", String(id)));
      formData.append("is_featured", isFeatured ? "1" : "0");
      if (metaTitle) formData.append("meta_title", metaTitle);
      if (metaDescription) formData.append("meta_description", metaDescription);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      const resp = await articlesService.create(formData);
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
          title="Create Article"
          description="Write and publish a new article."
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

            {/* Tags */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    }`}
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

            {/* Body (Tiptap) */}
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

            {/* Thumbnail */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-neutral-700 mb-1.5">
                Thumbnail
              </p>
              {thumbnailFile && (
                <div className="mb-3">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Preview"
                    className="rounded-lg object-cover w-40 h-40"
                  />
                </div>
              )}
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
                {thumbnailFile ? thumbnailFile.name : "Upload Thumbnail"}
              </Button>
              {formErrors.thumbnail && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.thumbnail}
                </p>
              )}
            </div>

            {/* SEO & Options */}
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
                Create Article
              </Button>
            </div>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}
