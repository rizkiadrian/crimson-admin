export interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ILoginPayload {
  login: string;
  password: string;
}

export interface IUserAuth {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role_id: number;
  phone: string | null;
  is_verified: boolean;
  deleted_at: string | null;
  sales_id: number | null;
  role_name: string;
}
