"use client";
import { useEffect, useState, useCallback, useReducer } from "react";
import type { IApiError, IApiResponse } from "@services/general";

export interface UseDetailDataOptions<TData> {
  /** API service function that returns a single item response. */
  fetcher: () => Promise<IApiResponse<TData>>;
  /** Whether to fetch immediately on mount. Defaults to true. */
  enabled?: boolean;
}

export interface UseDetailDataReturn<TData> {
  /** The fetched data, or null if not yet loaded. */
  data: TData | null;
  /** True while the fetch is in progress. */
  isLoading: boolean;
  /** Error message string if the fetch failed, otherwise null. */
  error: string | null;
  /** Re-trigger the fetch. */
  refetch: () => void;
}

/** Internal state machine to avoid synchronous setState in effects. */
type FetchState<TData> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: TData }
  | { status: "error"; error: string };

type FetchAction<TData> =
  | { type: "FETCH" }
  | { type: "SUCCESS"; data: TData }
  | { type: "ERROR"; error: string }
  | { type: "IDLE" };

function fetchReducer<TData>(
  _state: FetchState<TData>,
  action: FetchAction<TData>
): FetchState<TData> {
  switch (action.type) {
    case "FETCH":
      return { status: "loading" };
    case "SUCCESS":
      return { status: "success", data: action.data };
    case "ERROR":
      return { status: "error", error: action.error };
    case "IDLE":
      return { status: "idle" };
  }
}

/**
 * Generic hook for fetching a single resource (detail/show endpoint).
 *
 * Uses useReducer to manage a state machine, dispatching from async callbacks
 * only — never synchronously inside the effect body. This complies with
 * React 19's restriction on synchronous setState inside effects.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDetailData<IBackofficeUser>({
 *   fetcher: () => backofficeMembersService.backofficeMembersDetail(id),
 * });
 * ```
 */
export function useDetailData<TData>({
  fetcher,
  enabled = true,
}: UseDetailDataOptions<TData>): UseDetailDataReturn<TData> {
  const [state, dispatch] = useReducer(
    fetchReducer<TData>,
    enabled ? { status: "loading" } : { status: "idle" }
  );
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    // Use a microtask to dispatch FETCH so it's not synchronous in the effect body
    queueMicrotask(() => {
      if (!cancelled) dispatch({ type: "FETCH" });
    });

    const fetchData = async () => {
      try {
        const response = await fetcher();
        if (!cancelled) {
          dispatch({ type: "SUCCESS", data: response.data });
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
  }, [fetcher, enabled, fetchKey]);

  /** Force a re-fetch by incrementing the fetch key. */
  const refetch = useCallback(() => {
    setFetchKey((prev) => prev + 1);
  }, []);

  return {
    data: state.status === "success" ? state.data : null,
    isLoading: state.status === "loading",
    error: state.status === "error" ? state.error : null,
    refetch,
  };
}
