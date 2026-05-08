import type { IPaginationParams } from "@services/general";

export interface IArticleCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type IArticleCategoryParams = IPaginationParams;
