import type { IPaginationParams } from "@services/general";

export interface IAuthor {
  id: number;
  name: string;
  email: string | null;
  avatar_path: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IAuthorParams extends IPaginationParams {
  search?: string;
}
