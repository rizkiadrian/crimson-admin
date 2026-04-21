"use client";
import { useEffect, useState, useCallback } from "react";
import type {
  IApiError,
  IApiListResponse,
  IPagination,
  IPaginationParams,
  IPaginationMeta,
} from "@services/general";

const DEFAULT_PAGINATION: IPagination = {
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
};

export interface UseTableDataOptions<TData, TParams extends IPaginationParams> {
  /** Service function yang mengembalikan IApiListResponse */
  fetcher: (
    params: TParams
  ) => Promise<
    IApiListResponse<TData, IPaginationMeta> | IApiListResponse<TData>
  >;
  /** Parameter awal selain page & per_page */
  initialParams?: Omit<TParams, "page" | "per_page">;
  /** Jumlah item per halaman (default: 10) */
  perPage?: number;
}

export interface UseTableDataReturn<TData, TParams extends IPaginationParams> {
  /** Data hasil fetch */
  data: TData[];
  /** Sedang loading (pertama kali, belum ada data) */
  isInitialLoad: boolean;
  /** Sedang loading tapi sudah ada data (pagination/refetch) */
  isRefetching: boolean;
  /** Pesan error jika fetch gagal */
  error: string | null;
  /** Metadata pagination dari API */
  pagination: IPagination;
  /** Ganti halaman */
  handlePageChange: (page: number) => void;
  /** Update params (akan reset ke page 1) */
  setParams: (params: Partial<TParams>) => void;
  /** Refetch data dengan params yang sama */
  refetch: () => void;
  /** Apakah component sudah mounted (hydration safe) */
  isMounted: boolean;
}

export function useTableData<
  TData,
  TParams extends IPaginationParams = IPaginationParams,
>({
  fetcher,
  initialParams,
  perPage = 10,
}: UseTableDataOptions<TData, TParams>): UseTableDataReturn<TData, TParams> {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<TData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParamsState] = useState<TParams>({
    page: 1,
    per_page: perPage,
    ...initialParams,
  } as TParams);
  const [pagination, setPagination] = useState<IPagination>({
    ...DEFAULT_PAGINATION,
    per_page: perPage,
  });

  // Hydration fix
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch data
  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetcher(params);
        setData(response.data || []);
        if (response.meta?.pagination) {
          setPagination(response.meta.pagination);
        }
      } catch (err: unknown) {
        const apiError = err as IApiError;
        setError(apiError.message || "Gagal mengambil data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, isMounted, fetcher]);

  const handlePageChange = useCallback((page: number) => {
    setParamsState((prev) => ({ ...prev, page }));
  }, []);

  const setParams = useCallback((newParams: Partial<TParams>) => {
    setParamsState((prev) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  const refetch = useCallback(() => {
    // Trigger re-fetch dengan membuat referensi baru
    setParamsState((prev) => ({ ...prev }));
  }, []);

  const isInitialLoad = isLoading && data.length === 0;
  const isRefetching = isLoading && data.length > 0;

  return {
    data,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    setParams,
    refetch,
    isMounted,
  };
}
