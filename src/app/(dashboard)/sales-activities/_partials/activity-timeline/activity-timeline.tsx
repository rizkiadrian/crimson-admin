import type { IActivityLog } from "@services/sales/activity-logs";
import { ActivityCard } from "@app/components/ui/ActivityCard";

// ─── ActivityTimeline ───────────────────────────────────────────────────────────

interface ActivityTimelineProps {
  items: IActivityLog[];
  /** If true, each card links to its detail page. */
  linkToDetail?: boolean;
  /** Base path for detail links. Defaults to "/sales-activities". */
  detailBasePath?: string;
}

/**
 * Container component that renders a vertical list of ActivityCard items.
 *
 * The vertical connector line between items is already handled inside
 * each ActivityCard, so this component simply maps over the items array.
 */
export function ActivityTimeline({
  items,
  linkToDetail = false,
  detailBasePath,
}: ActivityTimelineProps) {
  return (
    <div className="flex flex-col">
      {items.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          linkToDetail={linkToDetail}
          detailBasePath={detailBasePath}
        />
      ))}
    </div>
  );
}
