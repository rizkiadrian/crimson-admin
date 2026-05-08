import type { IPaginationParams } from "@services/general";
import type { IAuthor } from "@services/backoffice/authors";
import type { IArticleCategory } from "@services/backoffice/article-categories";
import type { IArticleTag } from "@services/backoffice/article-tags";

export type ArticleStatus = "draft" | "scheduled" | "published" | "archived";

export interface IArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  thumbnail_path: string | null;
  thumbnail_url: string | null;
  author_id: number;
  category_id: number | null;
  status: ArticleStatus;
  published_at: string | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author?: IAuthor;
  category?: IArticleCategory;
  tags?: IArticleTag[];
}

export interface IArticleParams extends IPaginationParams {
  status?: ArticleStatus;
  category_id?: number;
  tag_id?: number;
  search?: string;
}

export interface IArticleCreatePayload {
  title: string;
  body: string;
  author_id: number;
  excerpt?: string;
  category_id?: number;
  tag_ids?: number[];
  meta_title?: string;
  meta_description?: string;
  is_featured?: boolean;
}
