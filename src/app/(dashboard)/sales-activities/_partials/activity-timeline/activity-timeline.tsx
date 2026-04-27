import type { IActivityLog } from "@services/sales/activity-logs";
import { ActivityCard } from "@app/components/ui/ActivityCard";

// ─── ActivityTimeline ───────────────────────────────────────────────────────────

interface ActivityTimelineProps {
  items: IActivityLog[];
}

/**
 * Container component that renders a vertical list of ActivityCard items.
 *
 * The vertical connector line between items is already handled inside
 * each ActivityCard, so this component simply maps over the items array.
 */
export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div className="flex flex-col">
      {items.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
