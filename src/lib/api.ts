// src/lib/api.ts
import { ENV } from "@config/env";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

// 1. Definisikan struktur error yang biasanya dikembalikan oleh Backend Anda
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

// 2. Definisikan struktur error kustom yang akan kita lempar ke komponen
export interface CustomApiError {
  message: string;
  status?: number;
}

const apiClient = axios.create({
  baseURL: ENV.API_PROXY_PATH,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => config);

apiClient.interceptors.response.use(
  (response) => response.data,
  // Berikan tipe ApiErrorResponse pada AxiosError
  (error: AxiosError<ApiErrorResponse>) => {
    const customError: CustomApiError = {
      // Sekarang TypeScript tahu bahwa data memiliki properti 'message' (tidak perlu 'any' lagi)
      message:
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan server",
      status: error.response?.status,
    };
    return Promise.reject(customError);
  }
);

// 3. Gunakan Generic <T> untuk tipe kembalian (Response)
//    dan Generic <D> untuk tipe payload data (Request)
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T, T>(url, config),

  // Tambahkan <T, D = unknown> agar tipe data yang dikirim tidak 'any'
  post: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => apiClient.post<T, T>(url, data, config),

  put: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => apiClient.put<T, T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T, T>(url, config),
};
