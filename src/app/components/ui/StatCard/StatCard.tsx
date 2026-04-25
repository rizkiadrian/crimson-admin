import React from "react";
import { cn } from "@lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  /** Card title label. */
  title: string;
  /** Main numeric value. */
  value: number | string;
  /** Optional description below the value. */
  description?: string;
  /** Icon component from lucide-react. */
  icon?: LucideIcon;
  /** Icon background color variant. */
  iconVariant?:
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "tertiary"
    | "neutral";
  /** Additional className. */
  className?: string;
}

const iconColors = {
  primary: "bg-primary-50 text-primary-500",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  error: "bg-error-50 text-error-600",
  tertiary: "bg-tertiary-50 text-tertiary-600",
  neutral: "bg-neutral-100 text-neutral-600",
};

/**
 * Summary stat card for dashboards.
 * Displays a title, large value, optional description, and an icon.
 */
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconVariant = "primary",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card rounded-2xl border border-border-subtle p-6 flex items-start justify-between gap-4",
        className
      )}
    >
      <div>
        <p className="text-[12px] text-neutral-500 font-medium uppercase tracking-wide mb-2">
          {title}
        </p>
        <p className="text-3xl font-bold text-text-main tracking-tight">
          {value}
        </p>
        {description && (
          <p className="text-[13px] text-text-muted mt-1">{description}</p>
        )}
      </div>
      {Icon && (
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            iconColors[iconVariant]
          )}
        >
          <Icon size={24} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
