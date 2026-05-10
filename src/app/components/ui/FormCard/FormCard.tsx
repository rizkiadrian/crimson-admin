import React from "react";
import { cn } from "@lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "@app/components/ui/Button";

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
        "bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-visible",
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

// ─── FormCardLoading ────────────────────────────────────────────────────────────

/**
 * Full-card loading state with a centered spinner.
 * Use inside a FormCard when fetching data for an edit/detail page.
 *
 * @example
 * ```tsx
 * if (isLoading) return <FormCard><FormCardLoading /></FormCard>;
 * ```
 */
export function FormCardLoading() {
  return (
    <div className="flex items-center justify-center min-h-80">
      <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
    </div>
  );
}

// ─── FormCardError ──────────────────────────────────────────────────────────────

export interface FormCardErrorProps {
  /** Error message to display. */
  message: string;
  /** Title text above the error message. Defaults to "Failed to load data". */
  title?: string;
  /** URL to navigate back to. When provided, shows a "Go Back" button. */
  backHref?: string;
  /** Label for the back button. Defaults to "Go Back". */
  backLabel?: string;
}

/**
 * Full-card error state with an error message and optional back button.
 * Use inside a FormCard when a fetch fails on an edit/detail page.
 *
 * @example
 * ```tsx
 * if (error) return <FormCard><FormCardError message={error} backHref="/members" /></FormCard>;
 * ```
 */
export function FormCardError({
  message,
  title = "Failed to load data",
  backHref,
  backLabel = "Go Back",
}: FormCardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-80 gap-3">
      <p className="text-[15px] font-bold text-text-main">{title}</p>
      <p className="text-sm text-text-muted">{message}</p>
      {backHref && (
        <Button variant="outlined" size="sm" href={backHref} className="mt-2">
          {backLabel}
        </Button>
      )}
    </div>
  );
}
