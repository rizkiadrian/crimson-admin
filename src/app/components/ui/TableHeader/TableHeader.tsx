// src/components/ui/TableHeader.tsx
import React from "react";

interface TableHeaderProps {
  title: string;
  badge?: string;
  // actions berupa ReactNode agar kita bebas memasukkan tombol apapun
  actions?: React.ReactNode;
}

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
