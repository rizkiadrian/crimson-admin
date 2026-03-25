export interface IBaseMeta {
  http_status: number;
}

// 2. Interface Utama menggunakan Generics
export interface IApiResponse<TData = unknown, TMeta = unknown> {
  success: boolean;
  message: string;
  data: TData;
  meta: IBaseMeta & TMeta;
}

export interface IPingResult {
  from: string;
}
