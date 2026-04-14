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
