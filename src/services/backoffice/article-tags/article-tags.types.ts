import type { IPaginationParams } from "@services/general";

export interface IArticleTag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IArticleTagParams extends IPaginationParams {
  search?: string;
}
