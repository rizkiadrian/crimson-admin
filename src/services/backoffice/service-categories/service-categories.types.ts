import type { IPaginationParams } from "@services/general";

/** Classification type for a service category */
export type CategoryType = "general" | "daily" | "monthly" | "popular";

/** Service category entity returned by the API */
export interface IServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null; // Full URL from backend accessor
  types: CategoryType[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Query params for service categories list endpoint */
export type IServiceCategoryParams = IPaginationParams;
