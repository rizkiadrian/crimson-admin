/**
 * Skeleton placeholder that mimics the shape of ActivityCard.
 *
 * Uses Tailwind animate-pulse pattern with neutral-200 backgrounds
 * to match the ActivityCard layout: icon circle, title, badge area,
 * description lines, and relative time.
 */
export function ActivityCardSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      {/* Type Icon placeholder */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-9 h-9 rounded-full bg-neutral-200" />
        {/* Vertical connector line */}
        <div className="w-px flex-1 bg-neutral-200 mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6 space-y-2">
        {/* Title */}
        <div className="h-4 w-3/5 bg-neutral-200 rounded" />

        {/* Status Badge + Lead Name */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-neutral-200 rounded-full" />
          <div className="h-3 w-24 bg-neutral-200 rounded" />
        </div>

        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-neutral-200 rounded" />
          <div className="h-3 w-4/5 bg-neutral-200 rounded" />
        </div>

        {/* Relative time */}
        <div className="h-3 w-20 bg-neutral-200 rounded" />
      </div>
    </div>
  );
}
