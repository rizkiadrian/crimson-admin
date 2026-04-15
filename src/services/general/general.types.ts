export interface IBaseMeta {
  http_status: number;
}

export interface IPaginationParams {
  page?: number;
  per_page?: number;
}

export interface IPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface IPaginationMeta {
  http_status: number;
  pagination: IPagination;
}

// 2. Interface Utama menggunakan Generics
export interface IApiResponse<TData = unknown, TMeta = unknown> {
  success: true;
  message: string;
  data: TData;
  meta: IBaseMeta & TMeta;
}

export interface IApiListResponse<TData = unknown, TMeta = unknown> {
  success: true;
  message: string;
  data: TData[];
  meta: IPaginationMeta & TMeta;
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
