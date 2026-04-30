// src/lib/api.ts
import { ENV } from "@config/env";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

export interface IFieldErrors {
  [key: string]: string[];
}
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: IFieldErrors;
}

export interface CustomApiError {
  message: string;
  status?: number;
  errors?: IFieldErrors;
}

// Interface untuk item dalam antrean failed requests
interface FailedQueueItem {
  resolve: (token?: string) => void;
  reject: (error: unknown) => void;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_PROXY_PATH,
  headers: { "Content-Type": "application/json" },
});

// --- LOGIKA SILENT REFRESH (TYPE-SAFE) ---
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token ?? undefined);
  });
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => config);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    // Menambahkan properti _retry secara aman pada config
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | undefined>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err: unknown) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Panggil API Route internal Next.js
        await axios.post("/api/auth/refresh");

        processQueue(null);

        // Panggil ulang request asli
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Error Handling Standar
    const customError: CustomApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan server",
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };
    return Promise.reject(customError);
  }
);

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T, T>(url, config),

  post: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => {
    // When sending FormData, remove Content-Type so axios sets multipart/form-data with boundary
    const mergedConfig =
      data instanceof FormData
        ? {
            ...config,
            headers: { ...config?.headers, "Content-Type": undefined },
          }
        : config;
    return apiClient.post<T, T>(
      url,
      data,
      mergedConfig as AxiosRequestConfig<D>
    );
  },

  put: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => apiClient.put<T, T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T, T>(url, config),

  patch: <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ) => apiClient.patch<T, T>(url, data, config),
};
