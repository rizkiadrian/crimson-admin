import { IPaginationParams } from "@services/general";

export interface IClientUser {
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

export interface IClientCreatePayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface IClientUpdatePayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export type IClientUserParams = IPaginationParams;
