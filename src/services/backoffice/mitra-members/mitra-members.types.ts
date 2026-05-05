import { IPaginationParams } from "@services/general";

export type MitraVerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export interface IMitraProfile {
  id: number;
  user_id: number;
  service_category_id: number;
  nik: string;
  full_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  photo: string | null;
  ktp_photo: string | null;
  selfie_ktp_photo: string | null;
  skck_photo: string | null;
  verification_status: MitraVerificationStatus;
  is_online: boolean;
  created_at: string;
  updated_at: string;
  service_category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface IMitraUser {
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
  mitra: IMitraProfile | null;
}

export interface IMitraUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export type IMitraUserParams = IPaginationParams;
