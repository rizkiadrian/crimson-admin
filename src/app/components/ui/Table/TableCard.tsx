"use client";
import React from "react";
import { SearchX } from "lucide-react";
import { cn } from "@lib/utils";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TablePagination,
} from "./Table";
import { TableHeader } from "@app/components/ui/TableHeader";
import type { IPagination } from "@services/general";

// ─── TableCard ──────────────────────────────────────────────────────────────────

export interface TableCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card container for table pages.
 * Provides consistent rounded corners, shadow, and border styling
 * so every table page shares the same visual wrapper.
 */
export function TableCard({ children, className }: TableCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-hidden relative",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── TableCardHeader ────────────────────────────────────────────────────────────

export interface TableCardHeaderProps {
  title: string;
  badge?: string;
  actions?: React.ReactNode;
}

/**
 * Header section inside a TableCard.
 * Renders a title with an optional badge and an action slot (e.g. Add, Filter, Export buttons).
 * Delegates rendering to the standalone TableHeader component.
 */
export function TableCardHeader({
  title,
  badge,
  actions,
}: TableCardHeaderProps) {
  return <TableHeader title={title} badge={badge} actions={actions} />;
}

// ─── TableCardContent ───────────────────────────────────────────────────────────

/** Describes a single column in a TableCardContent. */
export interface TableColumn<T> {
  /** Unique key used as the React key for this column. */
  key: string;
  /** Text displayed in the column header. */
  header: string;
  /** Optional className applied to the header cell. */
  headerClassName?: string;
  /** Render function that returns a TableCell for each row. */
  render: (item: T, index: number) => React.ReactNode;
}

export interface TableCardContentProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isRefetching?: boolean;
  isLoading?: boolean;
  error?: string | null;
  skeletonRowCount?: number;
  /** Title shown when data is empty. Defaults to "No data found". */
  emptyTitle?: string;
  /** Message shown when data is empty. Defaults to a generic message. */
  emptyMessage?: string;
}

/**
 * Declarative table body that renders columns and rows from data.
 *
 * Handles three states automatically:
 * - **Loading**: shows skeleton rows via TableBody's built-in loading state.
 * - **Error**: shows a centered error message via TableBody's error state.
 * - **Data**: iterates over `data` and renders each column's `render` function.
 *
 * When `isRefetching` is true, the table dims and shows a progress bar
 * while keeping existing rows visible.
 */
export function TableCardContent<T>({
  columns,
  data,
  keyExtractor,
  isRefetching,
  isLoading,
  error,
  skeletonRowCount = 5,
  emptyTitle = "No data found",
  emptyMessage = "Try adjusting your search or filter to find what you're looking for.",
}: TableCardContentProps<T>) {
  // Show empty state when data is loaded but empty
  const isEmpty = !isLoading && !error && data.length === 0;

  return (
    <Table isRefetching={isRefetching}>
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableHeaderCell key={col.key} className={col.headerClassName}>
              {col.header}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody
        loading={isLoading}
        error={error}
        columnCount={columns.length}
        rowCount={skeletonRowCount}
      >
        {isEmpty ? (
          <TableRow className="hover:bg-transparent">
            <td colSpan={columns.length} className="p-0">
              <div className="flex flex-col items-center justify-center min-h-75 w-full text-center py-12">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                  <SearchX size={24} strokeWidth={1.5} />
                </div>
                <p className="text-[15px] font-bold text-text-main mb-1">
                  {emptyTitle}
                </p>
                <p className="text-sm text-text-muted max-w-xs">
                  {emptyMessage}
                </p>
              </div>
            </td>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((col) => (
                <React.Fragment key={col.key}>
                  {col.render(item, index)}
                </React.Fragment>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// ─── TableCardPagination ────────────────────────────────────────────────────────

export interface TableCardPaginationProps {
  pagination: IPagination;
  isInitialLoad: boolean;
  error?: string | null;
  onPageChange: (page: number) => void;
}

/**
 * Conditional pagination footer for TableCard.
 * Automatically hides itself when there is no data, during initial load,
 * or when an error is present — so consumers don't need to handle visibility logic.
 */
export function TableCardPagination({
  pagination,
  isInitialLoad,
  error,
  onPageChange,
}: TableCardPaginationProps) {
  if (pagination.total <= 0 || isInitialLoad || error) {
    return null;
  }

  return (
    <TablePagination
      currentPage={pagination.current_page}
      totalPages={pagination.last_page}
      totalItems={pagination.total}
      itemsPerPage={pagination.per_page}
      onPageChange={onPageChange}
    />
  );
}
