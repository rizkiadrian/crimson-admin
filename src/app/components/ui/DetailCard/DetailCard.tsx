import React from "react";
import Image from "next/image";
import { cn } from "@lib/utils";

// ─── DetailCard ─────────────────────────────────────────────────────────────────

export interface DetailCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card container for detail/show pages.
 * Same visual treatment as FormCard and TableCard.
 */
export function DetailCard({ children, className }: DetailCardProps) {
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

// ─── DetailCardHeader ───────────────────────────────────────────────────────────

export interface DetailCardHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "neutral" | "success" | "warning" | "error";
  actions?: React.ReactNode;
}

/**
 * Header for DetailCard with title, description, badge, and action slot.
 */
export function DetailCardHeader({
  title,
  description,
  badge,
  badgeVariant = "neutral",
  actions,
}: DetailCardHeaderProps) {
  const badgeColors = {
    neutral: "bg-neutral-100 text-text-muted",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    error: "bg-error-50 text-error-600",
  };

  return (
    <div className="px-8 pt-8 pb-6 border-b border-border-subtle flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-bold text-text-main">{title}</h2>
          {badge && (
            <span
              className={cn(
                "inline-flex items-center shrink-0 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase",
                badgeColors[badgeVariant]
              )}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[13px] font-medium text-text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── DetailCardBody ─────────────────────────────────────────────────────────────

export interface DetailCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Body section for DetailCard. Sections inside are separated by borders.
 */
export function DetailCardBody({ children, className }: DetailCardBodyProps) {
  return (
    <div className={cn("divide-y divide-border-subtle", className)}>
      {children}
    </div>
  );
}

// ─── DetailSection ──────────────────────────────────────────────────────────────

export interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A labeled section inside a DetailCard body.
 * Each section has its own padding and is separated by a border from siblings.
 */
export function DetailSection({
  title,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={cn("px-8 py-7", className)}>
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-[11px] text-neutral-500 uppercase font-bold tracking-widest">
          {title}
        </h3>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>
      {children}
    </div>
  );
}

// ─── DetailFieldGrid ────────────────────────────────────────────────────────────

export interface DetailFieldGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Grid container for DetailField items with consistent gap.
 */
export function DetailFieldGrid({
  children,
  columns = 3,
  className,
}: DetailFieldGridProps) {
  const colClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colClass[columns], className)}>
      {children}
    </div>
  );
}

// ─── DetailField ────────────────────────────────────────────────────────────────

export interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/**
 * A single label-value pair with a subtle background card.
 */
export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div
      className={cn(
        "bg-neutral-50 rounded-xl px-4 py-3.5 border border-neutral-100",
        className
      )}
    >
      <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <div className="text-[14px] font-semibold text-text-main">
        {value || <span className="text-neutral-300">—</span>}
      </div>
    </div>
  );
}

// ─── DetailImageGrid ────────────────────────────────────────────────────────────

export interface DetailImageItem {
  label: string;
  src: string | null;
}

export interface DetailImageGridProps {
  images: DetailImageItem[];
  columns?: 2 | 3 | 4;
}

/**
 * Grid of labeled images for displaying document attachments.
 * Each image has a label, rounded card, and click-to-open behavior.
 */
export function DetailImageGrid({ images, columns = 2 }: DetailImageGridProps) {
  const colClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colClass[columns])}>
      {images.map((img) => (
        <div
          key={img.label}
          className="bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden"
        >
          <div className="px-4 pt-3 pb-2">
            <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wide">
              {img.label}
            </p>
          </div>
          {img.src ? (
            <a
              href={img.src}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden group relative h-52"
            >
              <Image
                src={img.src}
                alt={img.label}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </a>
          ) : (
            <div className="w-full h-52 bg-neutral-100 flex items-center justify-center">
              <p className="text-sm text-neutral-400">No image</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
