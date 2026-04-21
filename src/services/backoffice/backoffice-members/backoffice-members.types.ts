import { IPaginationParams } from "@services/general";

export interface IBackofficeUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role_id: number;
  phone: string | null;
  is_verified: boolean;
  role_name: string;
}

export interface IBackofficeCreatePayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface IBackofficeUpdatePayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export type IBackofficeUserParams = IPaginationParams;
