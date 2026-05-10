import type { IPaginationParams } from "@services/general";

export type EventCategory =
  | "lifecycle"
  | "engagement"
  | "marketing"
  | "transaction";

export interface IEventRegistry {
  id: number;
  key: string;
  label: string;
  category: EventCategory;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IEventRegistryParams extends IPaginationParams {
  category?: EventCategory;
  is_system?: boolean;
}

export interface IEventRegistryCreatePayload {
  key: string;
  label: string;
  category: Exclude<EventCategory, "lifecycle">;
  description?: string;
  is_active?: boolean;
}

export interface IEventRegistryUpdatePayload {
  key?: string;
  label?: string;
  category?: Exclude<EventCategory, "lifecycle">;
  description?: string;
  is_active?: boolean;
}
