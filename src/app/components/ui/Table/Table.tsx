import React from "react";
import { cn } from "@lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** When true, shows an indeterminate progress bar and dims the table content. */
  isRefetching?: boolean;
}

/**
 * Root table wrapper.
 * Renders a standard `<table>` inside a horizontally scrollable container.
 * When `isRefetching` is true, an animated progress bar appears at the top
 * and the table content is dimmed with pointer events disabled.
 */
export function Table({
  children,
  className,
  isRefetching,
  ...props
}: TableProps) {
  return (
    <div className="relative w-full">
      {/* Indeterminate progress bar — visible only during refetch */}
      {isRefetching && (
        <div className="absolute top-0 left-0 right-0 h-0.75 bg-primary-100 overflow-hidden z-20">
          <style>{`
            @keyframes slide-infinite {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
          <div
            className="h-full bg-primary-500 w-1/2 rounded-full"
            style={{ animation: "slide-infinite 1.2s infinite ease-in-out" }}
          />
        </div>
      )}

      {/* Scrollable table container — dims and blocks interaction while refetching */}
      <div
        className={cn(
          "w-full overflow-x-auto transition-opacity duration-300",
          isRefetching
            ? "opacity-50 pointer-events-none select-none"
            : "opacity-100"
        )}
      >
        <table
          className={cn("w-full text-left border-collapse", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

/** Standard `<thead>` wrapper. */
export function TableHead({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

/**
 * Smart `<tbody>` that handles three render states:
 *
 * 1. **Loading** (`loading=true`): renders skeleton placeholder rows.
 *    The first column shows an avatar + text skeleton, the last column shows
 *    action button skeletons, and middle columns show text bar skeletons.
 * 2. **Error** (`error` is a non-empty string): renders a full-width error
 *    message with an icon, spanning all columns.
 * 3. **Data** (default): renders children as normal table rows.
 *
 * @param columnCount - Number of columns, used for skeleton layout and error colspan.
 * @param rowCount - Number of skeleton rows to display during loading.
 */
export function TableBody({
  children,
  className,
  loading,
  error,
  columnCount = 4,
  rowCount = 5,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  loading?: boolean;
  error?: string | null;
  columnCount?: number;
  rowCount?: number;
}) {
  if (loading) {
    return (
      <tbody
        className={cn("divide-y divide-border-subtle", className)}
        {...props}
      >
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className="hover:bg-transparent">
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                {colIndex === 0 ? (
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : colIndex === columnCount - 1 ? (
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                ) : (
                  <Skeleton
                    className={cn(
                      "h-4 w-full max-w-37.5",
                      colIndex === 2 && "h-6 w-20 rounded-full"
                    )}
                  />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </tbody>
    );
  }

  if (error) {
    return (
      <tbody
        className={cn("divide-y divide-border-subtle", className)}
        {...props}
      >
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columnCount} className="p-0!">
            <div className="flex flex-col items-center justify-center min-h-75 w-full text-center">
              <div className="w-10 h-10 rounded-full bg-error-50 flex items-center justify-center text-error-600 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-[15px] font-bold text-text-main">
                Oops! Terjadi kesalahan
              </p>
              <p className="text-sm text-text-muted max-w-xs">{error}</p>
            </div>
          </TableCell>
        </TableRow>
      </tbody>
    );
  }

  return (
    <tbody
      className={cn("divide-y divide-border-subtle", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

/** Table row with hover highlight and `group` class for child hover effects. */
export function TableRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("hover:bg-neutral-50 transition-colors group", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

/** Column header cell with uppercase label styling and consistent padding. */
export function TableHeaderCell({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-5 text-[11px] font-bold text-neutral-500 uppercase tracking-widest border-b border-border-subtle first:pl-8 last:pr-8",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

/** Standard table data cell with consistent padding. */
export function TableCell({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-5 first:pl-8 last:pr-8", className)} {...props}>
      {children}
    </td>
  );
}

// ─── Badge ──────────────────────────────────────────────────────────────────────

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "primary"
    | "tertiary"
    | "success"
    | "warning"
    | "error"
    | "neutral";
  showDot?: boolean;
}

/**
 * Inline status badge with a colored dot indicator.
 * Used inside table cells to display categorical status (e.g. role, state).
 *
 * @param variant - Color theme mapped to the design system palette.
 * @param showDot - Whether to show the small circular dot before the label. Defaults to true.
 */
export function Badge({
  children,
  variant = "neutral",
  showDot = true,
  className,
  ...props
}: BadgeProps) {
  const variants = {
    primary: "bg-primary-50 text-primary-600",
    tertiary: "bg-tertiary-50 text-tertiary-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    error: "bg-error-50 text-error-600",
    neutral: "bg-neutral-100 text-text-muted",
  };

  const dots = {
    primary: "bg-primary-500",
    tertiary: "bg-tertiary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
    neutral: "bg-neutral-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase",
        variants[variant],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dots[variant])} />
      )}
      {children}
    </span>
  );
}

/** Animated pulse placeholder used inside skeleton loading states. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-neutral-200/60", className)}
      {...props}
    />
  );
}

// ─── TablePagination ────────────────────────────────────────────────────────────

export interface TablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Pagination footer that displays "Showing X to Y of Z" text and page buttons.
 *
 * Page numbers are generated with ellipsis logic:
 * - 5 or fewer pages: show all.
 * - Current near start: [1, 2, 3, ..., last].
 * - Current near end: [1, ..., last-2, last-1, last].
 * - Otherwise: [1, ..., prev, current, next, ..., last].
 */
export function TablePagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  className,
  ...props
}: TablePaginationProps) {
  /**
   * Generates an array of page numbers and ellipsis markers ("...").
   * Keeps the pagination compact while always showing the first, last,
   * and pages adjacent to the current page.
   */
  const generatePagination = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, "...", total];
    }
    if (current >= total - 2) {
      return [1, "...", total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const pageNumbers = generatePagination(currentPage, totalPages);

  return (
    <div
      className={cn(
        "px-8 py-6 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className
      )}
      {...props}
    >
      <p className="text-sm font-medium text-text-muted">
        Showing{" "}
        <span className="text-text-main font-semibold">
          {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="text-text-main font-semibold">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        of <span className="text-text-main font-semibold">{totalItems}</span>{" "}
        clients
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-text-main hover:bg-neutral-100 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 text-sm font-bold tracking-widest"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange?.(page as number)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors cursor-pointer",
                currentPage === page
                  ? "bg-primary-600 text-white shadow-md shadow-primary-200/60"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-text-main hover:bg-neutral-100 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
