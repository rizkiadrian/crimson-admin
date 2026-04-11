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
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-border-subtle", className)}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className,
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("hover:bg-neutral-50 transition-colors group", className)}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className,
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-5 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-border-subtle first:pl-8 last:pr-8",
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-5 first:pl-8 last:pr-8", className)}>
      {children}
    </td>
  );
}
