export interface IBaseMeta {
  http_status: number;
}

// 2. Interface Utama menggunakan Generics
export interface IApiResponse<TData = unknown, TMeta = unknown> {
  success: true;
  message: string;
  data: TData;
  meta: IBaseMeta & TMeta;
}

export interface IApiError<TData = unknown> {
  success: false;
  message: string;
  errors?: TData;
}

export interface IPingResult {
  from: string;
}

export interface IBackOfficeStatus {
  backoffice_status: string;
}
