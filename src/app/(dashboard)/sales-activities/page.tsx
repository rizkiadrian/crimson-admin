"use client";

import { Loader2, Plus, AlertCircle, SearchX, FileText } from "lucide-react";
import { useInfiniteScroll } from "@lib/hooks/use-infinite-scroll";
import { activityLogsService } from "@services/sales/activity-logs";
import type {
  IActivityLog,
  IActivityLogParams,
} from "@services/sales/activity-logs";
import { ActivityTimeline } from "./_partials/activity-timeline";
import { ActivityCardSkeleton } from "@app/components/ui/ActivityCard";
import { SearchInput } from "@app/components/ui/SearchInput";
import { Button } from "@app/components/ui/Button";

// ─── SalesActivitiesPage ────────────────────────────────────────────────────────

export default function SalesActivitiesPage() {
  const {
    data,
    isInitialLoad,
    isFetchingMore,
    error,
    loadMoreError,
    hasMore,
    handleSearch,
    searchQuery,
    sentinelRef,
    retryLoadMore,
    isMounted,
  } = useInfiniteScroll<IActivityLog, IActivityLogParams>({
    fetcher: activityLogsService.getActivityLogs,
    perPage: 10,
  });

  // Determine empty state type
  const isEmpty = !isInitialLoad && !error && data.length === 0;
  const isSearchEmpty = isEmpty && searchQuery.length > 0;
  const isNoData = isEmpty && searchQuery.length === 0;

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">
            Sales Activities
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Riwayat aktivitas dan laporan Anda
          </p>
        </div>
        <Button href="/sales-activities/create" variant="primary">
          <Plus size={16} className="mr-1.5" />
          New Report
        </Button>
      </div>

      {/* ── White Card Container (consistent with TableCard pages) ──────── */}
      <div className="bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-hidden relative">
        {/* ── Search Bar ─────────────────────────────────────────────────── */}
        <div className="p-6 pb-0">
          {isMounted && (
            <SearchInput
              value={searchQuery}
              onSearch={handleSearch}
              placeholder="Cari aktivitas..."
            />
          )}
        </div>

        {/* ── Card Body ──────────────────────────────────────────────────── */}
        <div className="p-6">
          {/* ── Initial Loading State (Skeletons) ──────────────────────── */}
          {isInitialLoad && (
            <div className="space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <ActivityCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ── Error State (Initial) ──────────────────────────────────── */}
          {error && data.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-60 text-center py-12">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-3">
                <AlertCircle size={24} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-bold text-text-main mb-1">
                Gagal memuat data
              </p>
              <p className="text-sm text-text-muted max-w-xs mb-4">{error}</p>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => handleSearch(searchQuery)}
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {/* ── Empty State: No Data ───────────────────────────────────── */}
          {isNoData && (
            <div className="flex flex-col items-center justify-center min-h-60 text-center py-12">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                <FileText size={24} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-bold text-text-main mb-1">
                Belum ada aktivitas
              </p>
              <p className="text-sm text-text-muted max-w-xs mb-4">
                Mulai catat aktivitas sales Anda dengan membuat laporan baru.
              </p>
              <Button
                href="/sales-activities/create"
                variant="primary"
                size="sm"
              >
                <Plus size={16} className="mr-1.5" />
                New Report
              </Button>
            </div>
          )}

          {/* ── Empty State: No Search Results ─────────────────────────── */}
          {isSearchEmpty && (
            <div className="flex flex-col items-center justify-center min-h-60 text-center py-12">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                <SearchX size={24} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-bold text-text-main mb-1">
                Tidak ada hasil ditemukan
              </p>
              <p className="text-sm text-text-muted max-w-xs">
                Coba ubah kata kunci pencarian Anda.
              </p>
            </div>
          )}

          {/* ── Timeline Data ──────────────────────────────────────────── */}
          {data.length > 0 && <ActivityTimeline items={data} linkToDetail />}

          {/* ── Loading More Indicator ──────────────────────────────────── */}
          {isFetchingMore && (
            <div className="flex items-center justify-center py-6">
              <Loader2
                size={20}
                className="animate-spin text-primary-500 mr-2"
              />
              <span className="text-sm text-text-muted">
                Memuat lebih banyak...
              </span>
            </div>
          )}

          {/* ── Load More Error ────────────────────────────────────────── */}
          {loadMoreError && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-red-600 mb-2">{loadMoreError}</p>
              <Button variant="outlined" size="sm" onClick={retryLoadMore}>
                Coba Lagi
              </Button>
            </div>
          )}

          {/* ── Scroll Sentinel ────────────────────────────────────────── */}
          {hasMore && !isFetchingMore && <div ref={sentinelRef} />}
        </div>
      </div>
    </div>
  );
}
