export interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ILoginPayload {
  login: string;
  password: string;
}
