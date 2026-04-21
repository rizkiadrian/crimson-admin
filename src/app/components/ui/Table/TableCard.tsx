"use client";
import React from "react";
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

// ─── TableCard: Wrapper card untuk semua table page ───
export interface TableCardProps {
  children: React.ReactNode;
  className?: string;
}

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

// ─── TableCardHeader: Shortcut untuk TableHeader di dalam TableCard ───
export interface TableCardHeaderProps {
  title: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function TableCardHeader({
  title,
  badge,
  actions,
}: TableCardHeaderProps) {
  return <TableHeader title={title} badge={badge} actions={actions} />;
}

// ─── TableCardContent: Wrapper untuk Table + columns + data rendering ───
export interface TableColumn<T> {
  key: string;
  header: string;
  headerClassName?: string;
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
}

export function TableCardContent<T>({
  columns,
  data,
  keyExtractor,
  isRefetching,
  isLoading,
  error,
  skeletonRowCount = 5,
}: TableCardContentProps<T>) {
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
        {data.map((item, index) => (
          <TableRow key={keyExtractor(item)}>
            {columns.map((col) => (
              <React.Fragment key={col.key}>
                {col.render(item, index)}
              </React.Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── TableCardPagination: Conditional pagination rendering ───
export interface TableCardPaginationProps {
  pagination: IPagination;
  isInitialLoad: boolean;
  error?: string | null;
  onPageChange: (page: number) => void;
}

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
