// src/components/ui/Table.tsx
import React from "react";
import { cn } from "@lib/utils";

export function Table({
  children,
  className,
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-left border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  children,
  className,
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({
  children,
  className,
  loading,
  error,
  columnCount = 4,
  rowCount = 5,
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  loading?: boolean;
  error?: string | null;
  columnCount?: number;
  rowCount?: number;
}) {
  if (loading) {
    return (
      <tbody className={cn("divide-y divide-border-subtle", className)}>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className="hover:bg-transparent">
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                {colIndex === 0 ? (
                  // Kolom pertama biasanya Nama/Avatar
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : colIndex === columnCount - 1 ? (
                  // Kolom terakhir biasanya Actions
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                ) : (
                  // Kolom tengah (Email, Status, dll)
                  <Skeleton
                    className={cn(
                      "h-4 w-full max-w-37.5",
                      colIndex === 2 && "h-6 w-20 rounded-full" // Shimmer gaya Badge
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
      <tbody className={cn("divide-y divide-border-subtle", className)}>
        <TableRow className="hover:bg-transparent">
          {/* Perubahan kunci:
            1. Tambahkan `!p-0` untuk mereset padding bawaan dari TableCell (yang termasuk first:pl-8 last:pr-8).
            2. Gunakan div di dalam dengan flex center absolute untuk benar-benar memusatkan konten.
          */}
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
    <tbody className={cn("divide-y divide-border-subtle", className)}>
      {children}
    </tbody>
  );
}

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

export function TableHeaderCell({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-border-subtle first:pl-8 last:pr-8",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

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
