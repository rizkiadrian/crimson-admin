"use client";

import type { IActivityLog } from "@services/sales/activity-logs";
import { Badge } from "@app/components/ui/Table";
import {
  formatRelativeTime,
  getActivityTypeConfig,
  getStatusBadgeConfig,
} from "./utils";

// ─── ActivityCard ───────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: IActivityLog;
}

/**
 * Single activity item card for timeline views.
 *
 * Displays a type icon, title, status badge, optional lead name,
 * truncated description, and relative timestamp.
 */
export function ActivityCard({ activity }: ActivityCardProps) {
  const typeConfig = getActivityTypeConfig(activity.type);
  const statusConfig = getStatusBadgeConfig(activity.status);
  const Icon = typeConfig.icon;

  return (
    <div className="flex gap-3">
      {/* Type Icon */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${typeConfig.bgColor}`}
        >
          <Icon size={18} className={typeConfig.iconColor} />
        </div>
        {/* Vertical connector line */}
        <div className="w-px flex-1 bg-border-subtle mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        {/* Title */}
        <p className="text-sm font-semibold text-text-main leading-snug">
          {activity.title}
        </p>

        {/* Status Badge + Lead Name */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {activity.lead && (
            <span className="text-xs text-text-muted">
              Lead: {activity.lead.name}
            </span>
          )}
        </div>

        {/* Description (truncated) */}
        {activity.description && (
          <p className="text-xs text-text-muted mt-1.5 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Relative Time */}
        <p className="text-xs text-text-muted/70 mt-1.5">
          {formatRelativeTime(activity.created_at)}
        </p>
      </div>
    </div>
  );
}
