import React from "react";
import { cn } from "@lib/utils";

// ─── FormCard ───────────────────────────────────────────────────────────────────

export interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card container for form pages.
 * Shares the same visual treatment as TableCard (rounded corners, shadow, border)
 * to keep all dashboard pages visually consistent.
 */
export function FormCard({ children, className }: FormCardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── FormCardHeader ─────────────────────────────────────────────────────────────

export interface FormCardHeaderProps {
  /** Main title displayed in the header. */
  title: string;
  /** Optional description text below the title. */
  description?: string;
  /** Optional badge rendered on the right side of the header (e.g. "Authorized only"). */
  badge?: string;
  /** Slot for custom content on the right side. Takes precedence over `badge`. */
  actions?: React.ReactNode;
}

/**
 * Header section for FormCard.
 * Displays a title with an optional description on the left,
 * and a badge or custom actions on the right.
 */
export function FormCardHeader({
  title,
  description,
  badge,
  actions,
}: FormCardHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-6 border-b border-border-subtle flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-main mb-1">{title}</h2>
        {description && (
          <p className="text-[13px] font-medium text-text-muted">
            {description}
          </p>
        )}
      </div>

      {actions ??
        (badge && (
          <span className="inline-flex items-center shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-neutral-100 text-text-muted">
            {badge}
          </span>
        ))}
    </div>
  );
}

// ─── FormCardBody ───────────────────────────────────────────────────────────────

export interface FormCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Body section for FormCard.
 * Provides consistent padding and vertical spacing for form fields.
 */
export function FormCardBody({ children, className }: FormCardBodyProps) {
  return <div className={cn("p-8 space-y-8", className)}>{children}</div>;
}

// ─── FormCardFooter ─────────────────────────────────────────────────────────────

export interface FormCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Footer section for FormCard.
 * Renders action buttons (Submit, Cancel) in a right-aligned bar
 * with a top border separator.
 */
export function FormCardFooter({ children, className }: FormCardFooterProps) {
  return (
    <div
      className={cn(
        "px-8 py-6 flex items-center justify-end gap-4 border-t border-border-subtle bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}
