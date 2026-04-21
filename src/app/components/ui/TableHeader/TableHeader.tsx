import React from "react";

interface TableHeaderProps {
  /** Title text displayed on the left side. */
  title: string;
  /** Optional small badge shown next to the title (e.g. total count). */
  badge?: string;
  /** Action slot rendered on the right side (e.g. buttons for Add, Filter, Export). */
  actions?: React.ReactNode;
}

/**
 * Horizontal header bar for table sections.
 * Displays a title with an optional badge on the left and an action slot on the right.
 * Separated from TableCard so it can also be used standalone outside card contexts.
 */
export function TableHeader({ title, badge, actions }: TableHeaderProps) {
  return (
    <div className="px-8 py-8 flex items-center justify-between border-b border-border-subtle">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-text-main tracking-tight">
          {title}
        </h2>
        {badge && (
          <span className="px-3 py-1 bg-neutral-100 text-text-muted text-[10px] font-bold uppercase tracking-wider rounded-full">
            {badge}
          </span>
        )}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
