"use client";
import { useEffect, useState, useCallback, useReducer, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type {
  IApiError,
  IApiListResponse,
  IPaginationMeta,
  IPaginationParams,
} from "@services/general";

// ---------------------------------------------------------------------------
// Public option / return types
// ---------------------------------------------------------------------------

export interface UseInfiniteScrollOptions<
  TData,
  TParams extends IPaginationParams,
> {
  /** API service function that returns a paginated list response. */
  fetcher: (
    params: TParams
  ) => Promise<IApiListResponse<TData, IPaginationMeta>>;
  /** Extra params beyond page & per_page. */
  initialParams?: Omit<TParams, "page" | "per_page">;
  /** Items per page. Defaults to 10. */
  perPage?: number;
  /** Sync search param to URL ?search=. Defaults to true. */
  syncUrl?: boolean;
}

export interface UseInfiniteScrollReturn<TData> {
  /** Accumulated data from all loaded pages. */
  data: TData[];
  /** True during first page load (no data yet). Shows skeleton. */
  isInitialLoad: boolean;
  /** True while loading the next page. Shows bottom spinner. */
  isFetchingMore: boolean;
  /** Error message if initial fetch failed, otherwise null. */
  error: string | null;
  /** Error specifically from load-more (next page fetch). */
  loadMoreError: string | null;
  /** Whether more pages are available. */
  hasMore: boolean;
  /** Trigger loading the next page. Called by IntersectionObserver. */
  loadMore: () => void;
  /** Retry loading the next page after a load-more error. */
  retryLoadMore: () => void;
  /** Set search query. Resets data and page to 1. Syncs to URL. */
  handleSearch: (query: string) => void;
  /** Current search query value. */
  searchQuery: string;
  /** Ref to attach to the scroll sentinel element. */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  /** Whether component has mounted (safe to render client-only content). */
  isMounted: boolean;
}

// ---------------------------------------------------------------------------
// Internal state machine (useReducer — React 19 compliant)
// ---------------------------------------------------------------------------

interface InfiniteScrollState<TData> {
  status:
    | "idle"
    | "loading"
    | "success"
    | "error"
    | "loading_more"
    | "load_more_error";
  data: TData[];
  page: number;
  hasMore: boolean;
  error: string | null;
  loadMoreError: string | null;
}

type InfiniteScrollAction<TData> =
  | { type: "FETCH" }
  | { type: "SUCCESS"; data: TData[]; hasMore: boolean; page: number }
  | { type: "ERROR"; error: string }
  | { type: "FETCH_MORE" }
  | {
      type: "SUCCESS_MORE";
      data: TData[];
      hasMore: boolean;
      page: number;
    }
  | { type: "ERROR_MORE"; error: string }
  | { type: "RESET" };

function infiniteScrollReducer<TData>(
  state: InfiniteScrollState<TData>,
  action: InfiniteScrollAction<TData>
): InfiniteScrollState<TData> {
  switch (action.type) {
    case "FETCH":
      return {
        ...state,
        status: "loading",
        data: [],
        page: 1,
        hasMore: false,
        error: null,
        loadMoreError: null,
      };
    case "SUCCESS":
      return {
        ...state,
        status: "success",
        data: action.data,
        page: action.page,
        hasMore: action.hasMore,
        error: null,
        loadMoreError: null,
      };
    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.error,
      };
    case "FETCH_MORE":
      return {
        ...state,
        status: "loading_more",
        loadMoreError: null,
      };
    case "SUCCESS_MORE":
      return {
        ...state,
        status: "success",
        data: [...state.data, ...action.data],
        page: action.page,
        hasMore: action.hasMore,
        loadMoreError: null,
      };
    case "ERROR_MORE":
      return {
        ...state,
        status: "load_more_error",
        loadMoreError: action.error,
      };
    case "RESET":
      return {
        status: "idle",
        data: [],
        page: 1,
        hasMore: false,
        error: null,
        loadMoreError: null,
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Generic hook for infinite-scroll data fetching with append-based pagination.
 *
 * Uses `useReducer` to manage a state machine, dispatching from async
 * callbacks only — never synchronously inside the effect body. This complies
 * with React 19's restriction on synchronous setState inside effects.
 *
 * URL sync follows the same pattern as `useTableData` (useSearchParams +
 * useRouter + usePathname).
 *
 * @example
 * ```tsx
 * const { data, isInitialLoad, isFetchingMore, hasMore, sentinelRef, handleSearch, searchQuery } =
 *   useInfiniteScroll<IActivityLog, IActivityLogParams>({
 *     fetcher: activityLogsService.getActivityLogs,
 *     perPage: 10,
 *   });
 * ```
 */
export function useInfiniteScroll<
  TData,
  TParams extends IPaginationParams = IPaginationParams,
>({
  fetcher,
  initialParams,
  perPage = 10,
  syncUrl = true,
}: UseInfiniteScrollOptions<TData, TParams>): UseInfiniteScrollReturn<TData> {
  // ---- Next.js router hooks for URL sync ----
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial search from URL
  const urlSearch = syncUrl ? searchParams.get("search") || "" : "";

  // ---- Mounted flag (hydration safety) ----
  const [isMounted, setIsMounted] = useState(false);

  // ---- Search state ----
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  // ---- Reducer state ----
  const [state, dispatch] = useReducer(infiniteScrollReducer<TData>, {
    status: "idle",
    data: [],
    page: 1,
    hasMore: false,
    error: null,
    loadMoreError: null,
  });

  // ---- Fetch key to force re-fetch on search change ----
  const [fetchKey, setFetchKey] = useState(0);

  // ---- Sentinel ref for IntersectionObserver ----
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Mark component as mounted (avoids hydration mismatch).
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ---- Initial fetch & search-triggered re-fetch ----
  useEffect(() => {
    if (!isMounted) return;

    let cancelled = false;

    // Use queueMicrotask so dispatch is not synchronous in the effect body
    // (React 19 compliance — same pattern as useDetailData).
    queueMicrotask(() => {
      if (!cancelled) dispatch({ type: "FETCH" });
    });

    const fetchData = async () => {
      try {
        const params = {
          page: 1,
          per_page: perPage,
          ...initialParams,
          ...(searchQuery ? { search: searchQuery } : {}),
        } as TParams;

        const response = await fetcher(params);

        if (!cancelled) {
          const pagination = response.meta?.pagination;
          const currentPage = pagination?.current_page ?? 1;
          const lastPage = pagination?.last_page ?? 1;

          dispatch({
            type: "SUCCESS",
            data: response.data || [],
            hasMore: currentPage < lastPage,
            page: currentPage,
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const apiError = err as IApiError;
          dispatch({
            type: "ERROR",
            error: apiError.message || "Failed to fetch data",
          });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, fetchKey]);

  // ---- Load more (next page) ----
  const loadMore = useCallback(() => {
    // Guard: only load more when in success state with more pages
    if (state.status !== "success" || !state.hasMore) {
      return;
    }

    const nextPage = state.page + 1;

    dispatch({ type: "FETCH_MORE" });

    const fetchMore = async () => {
      try {
        const params = {
          page: nextPage,
          per_page: perPage,
          ...initialParams,
          ...(searchQuery ? { search: searchQuery } : {}),
        } as TParams;

        const response = await fetcher(params);
        const pagination = response.meta?.pagination;
        const currentPage = pagination?.current_page ?? nextPage;
        const lastPage = pagination?.last_page ?? 1;

        dispatch({
          type: "SUCCESS_MORE",
          data: response.data || [],
          hasMore: currentPage < lastPage,
          page: currentPage,
        });
      } catch (err: unknown) {
        const apiError = err as IApiError;
        dispatch({
          type: "ERROR_MORE",
          error: apiError.message || "Failed to load more data",
        });
      }
    };

    fetchMore();
  }, [
    state.status,
    state.hasMore,
    state.page,
    perPage,
    initialParams,
    searchQuery,
    fetcher,
  ]);

  // ---- Retry load more after error ----
  const retryLoadMore = useCallback(() => {
    if (state.status !== "load_more_error") return;

    const nextPage = state.page + 1;

    dispatch({ type: "FETCH_MORE" });

    const fetchMore = async () => {
      try {
        const params = {
          page: nextPage,
          per_page: perPage,
          ...initialParams,
          ...(searchQuery ? { search: searchQuery } : {}),
        } as TParams;

        const response = await fetcher(params);
        const pagination = response.meta?.pagination;
        const currentPage = pagination?.current_page ?? nextPage;
        const lastPage = pagination?.last_page ?? 1;

        dispatch({
          type: "SUCCESS_MORE",
          data: response.data || [],
          hasMore: currentPage < lastPage,
          page: currentPage,
        });
      } catch (err: unknown) {
        const apiError = err as IApiError;
        dispatch({
          type: "ERROR_MORE",
          error: apiError.message || "Failed to load more data",
        });
      }
    };

    fetchMore();
  }, [state.status, state.page, perPage, initialParams, searchQuery, fetcher]);

  // ---- Handle search ----
  const handleSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      setSearchQuery(trimmed);

      // Sync search to URL
      if (syncUrl) {
        const urlParams = new URLSearchParams(searchParams.toString());
        if (trimmed) {
          urlParams.set("search", trimmed);
        } else {
          urlParams.delete("search");
        }
        const qs = urlParams.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      }

      // Trigger re-fetch by bumping fetchKey
      setFetchKey((prev) => prev + 1);
    },
    [syncUrl, searchParams, router, pathname]
  );

  // ---- IntersectionObserver on sentinelRef ----
  useEffect(() => {
    if (!isMounted) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Only observe when there's more data and we're not already fetching
    if (!state.hasMore || state.status === "loading_more") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isMounted, state.hasMore, state.status, loadMore]);

  // ---- Derived values ----
  const isInitialLoad = state.status === "loading" || state.status === "idle";
  const isFetchingMore = state.status === "loading_more";

  return {
    data: state.data,
    isInitialLoad: isInitialLoad && state.data.length === 0,
    isFetchingMore,
    error: state.status === "error" ? state.error : null,
    loadMoreError:
      state.status === "load_more_error" ? state.loadMoreError : null,
    hasMore: state.hasMore,
    loadMore,
    retryLoadMore,
    handleSearch,
    searchQuery,
    sentinelRef,
    isMounted,
  };
}
