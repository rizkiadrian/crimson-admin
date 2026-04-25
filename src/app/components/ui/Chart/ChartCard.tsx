import React from "react";
import { cn } from "@lib/utils";

export interface ChartCardProps {
  /** Chart title. */
  title: string;
  /** Optional description below the title. */
  description?: string;
  /** Chart content (Recharts components). */
  children: React.ReactNode;
  /** Additional className. */
  className?: string;
}

/**
 * Card wrapper for charts with consistent title, description, and padding.
 * Use as a container for Recharts ResponsiveContainer.
 */
export function ChartCard({
  title,
  description,
  children,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card rounded-2xl border border-border-subtle p-6",
        className
      )}
    >
      <h3 className="text-sm font-bold text-text-main mb-1">{title}</h3>
      {description && (
        <p className="text-[12px] text-text-muted mb-6">{description}</p>
      )}
      {children}
    </div>
  );
}
