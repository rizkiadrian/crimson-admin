"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type {
  IApiError,
  IApiListResponse,
  IPagination,
  IPaginationParams,
  IPaginationMeta,
} from "@services/general";

/** Fallback pagination state used before the first API response arrives. */
const DEFAULT_PAGINATION: IPagination = {
  total: 0,
  per_page: 10,
  current_page: 1,
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
};

export interface UseTableDataOptions<TData, TParams extends IPaginationParams> {
  /** API service function that returns a paginated list response. */
  fetcher: (
    params: TParams
  ) => Promise<
    IApiListResponse<TData, IPaginationMeta> | IApiListResponse<TData>
  >;
  /** Extra params beyond page & per_page (e.g. search, filters). */
  initialParams?: Omit<TParams, "page" | "per_page">;
  /** Number of items per page. Defaults to 10. */
  perPage?: number;
  /**
   * Sync the current page to the URL query parameter `?page=N`.
   * When true, the initial page is read from the URL and page changes
   * are pushed back to the URL. Defaults to true.
   */
  syncUrl?: boolean;
}

export interface UseTableDataReturn<TData, TParams extends IPaginationParams> {
  /** Array of fetched items for the current page. */
  data: TData[];
  /** True during the first load when no data exists yet (shows skeleton). */
  isInitialLoad: boolean;
  /** True when loading but data already exists (shows progress bar overlay). */
  isRefetching: boolean;
  /** Error message string if the fetch failed, otherwise null. */
  error: string | null;
  /** Pagination metadata returned by the API. */
  pagination: IPagination;
  /** Navigate to a specific page number. */
  handlePageChange: (page: number) => void;
  /** Merge new filter/search params and reset to page 1. */
  setParams: (params: Partial<TParams>) => void;
  /** Set search query. Resets to page 1 and syncs to URL. */
  handleSearch: (query: string) => void;
  /** Current search query value. */
  searchQuery: string;
  /** Re-trigger a fetch with the current params. */
  refetch: () => void;
  /** Whether the component has mounted (safe to render client-only content). */
  isMounted: boolean;
}

/**
 * Generic hook that encapsulates the full data-fetching lifecycle for table pages.
 *
 * Handles:
 * - URL sync: reads initial page from `?page=N` and pushes page changes back.
 * - Hydration safety (delays fetch until after mount to avoid SSR mismatch).
 * - Loading states split into initial load vs. refetch so the UI can show
 *   skeletons on first load and a progress bar on subsequent fetches.
 * - Pagination state management with automatic page reset on filter changes.
 * - Error capture from the API error shape.
 *
 * @example
 * ```tsx
 * const { data, isInitialLoad, isRefetching, error, pagination, handlePageChange } =
 *   useTableData<IProduct, IProductParams>({
 *     fetcher: (params) => productService.list(params),
 *     perPage: 10,
 *   });
 * ```
 */
export function useTableData<
  TData,
  TParams extends IPaginationParams = IPaginationParams,
>({
  fetcher,
  initialParams,
  perPage = 10,
  syncUrl = true,
}: UseTableDataOptions<TData, TParams>): UseTableDataReturn<TData, TParams> {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial page and search from URL query params
  const urlPage = syncUrl
    ? Math.max(1, Number(searchParams.get("page")) || 1)
    : 1;
  const urlSearch = syncUrl ? searchParams.get("search") || "" : "";

  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<TData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParamsState] = useState<TParams>({
    page: urlPage,
    per_page: perPage,
    search: urlSearch || undefined,
    ...initialParams,
  } as TParams);
  const [pagination, setPagination] = useState<IPagination>({
    ...DEFAULT_PAGINATION,
    per_page: perPage,
    current_page: urlPage,
  });

  // Mark component as mounted so we only fetch on the client (avoids hydration mismatch).
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync URL → state when the browser back/forward buttons change the query param.
  useEffect(() => {
    if (!syncUrl || !isMounted) return;
    const pageFromUrl = Math.max(1, Number(searchParams.get("page")) || 1);
    setParamsState((prev) => {
      if (prev.page === pageFromUrl) return prev;
      return { ...prev, page: pageFromUrl };
    });
  }, [searchParams, syncUrl, isMounted]);

  // Fetch data whenever params change. Skipped until mounted.
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
        setError(apiError.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, isMounted, fetcher]);

  /**
   * Navigate to a specific page.
   * Updates internal state and syncs the page number to the URL query param.
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setParamsState((prev) => ({ ...prev, page }));

      if (syncUrl) {
        const newParams = new URLSearchParams(searchParams.toString());
        if (page <= 1) {
          newParams.delete("page");
        } else {
          newParams.set("page", String(page));
        }
        const query = newParams.toString();
        router.push(`${pathname}${query ? `?${query}` : ""}`, {
          scroll: false,
        });
      }
    },
    [syncUrl, searchParams, router, pathname]
  );

  /** Merge new params (e.g. search query, filters) and reset to page 1. */
  const setParams = useCallback(
    (newParams: Partial<TParams>) => {
      setParamsState((prev) => ({ ...prev, ...newParams, page: 1 }));

      if (syncUrl) {
        const urlParams = new URLSearchParams(searchParams.toString());
        urlParams.delete("page");
        const query = urlParams.toString();
        router.push(`${pathname}${query ? `?${query}` : ""}`, {
          scroll: false,
        });
      }
    },
    [syncUrl, searchParams, router, pathname]
  );

  /**
   * Set search query. Resets to page 1 and syncs search to URL.
   */
  const handleSearch = useCallback(
    (query: string) => {
      const search = query.trim() || undefined;
      setParamsState((prev) => ({ ...prev, search, page: 1 }));

      if (syncUrl) {
        const urlParams = new URLSearchParams(searchParams.toString());
        urlParams.delete("page");
        if (search) {
          urlParams.set("search", search);
        } else {
          urlParams.delete("search");
        }
        const qs = urlParams.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      }
    },
    [syncUrl, searchParams, router, pathname]
  );

  /** Force a re-fetch with the current params by creating a new state reference. */
  const refetch = useCallback(() => {
    setParamsState((prev) => ({ ...prev }));
  }, []);

  // Derive loading sub-states so consumers can differentiate skeleton vs. overlay.
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
    handleSearch,
    searchQuery: (params.search as string) || "",
    refetch,
    isMounted,
  };
}
