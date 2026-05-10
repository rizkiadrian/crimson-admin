"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import {
  BarChart3,
  Eye,
  MousePointer,
  XCircle,
  Target,
  Pencil,
  Copy,
  FlaskConical,
} from "lucide-react";
import {
  FormCard,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { StatCard } from "@app/components/ui/StatCard";
import { Badge } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { useNotificationStore } from "@store/useNotificationStore";
import { popupPromotionsService } from "@services/marketing/popup-promotions";
import type {
  IPopupPromotion,
  IPopupAnalytics,
} from "@services/marketing/popup-promotions";
import { PATHS } from "@config/routing";

export default function PopupPromotionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const showNotification = useNotificationStore((s) => s.showNotification);

  const fetcher = useCallback(() => popupPromotionsService.getById(id), [id]);
  const {
    data: popup,
    isLoading,
    error,
  } = useDetailData<IPopupPromotion>({ fetcher, enabled: !!id });

  const analyticsFetcher = useCallback(async () => {
    const resp = await popupPromotionsService.getAnalytics(id);
    return resp;
  }, [id]);
  const { data: analytics } = useDetailData<IPopupAnalytics>({
    fetcher: analyticsFetcher,
    enabled: !!id,
  });

  const handleDuplicate = async () => {
    try {
      const resp = await popupPromotionsService.duplicate(id);
      showNotification(resp.message, "success");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(apiError.message || "Failed", "error");
    }
  };

  const handleCreateAB = async () => {
    try {
      const resp = await popupPromotionsService.createABVariant(id);
      showNotification(resp.message, "success");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      showNotification(apiError.message || "Failed", "error");
    }
  };

  if (isLoading)
    return (
      <FormCard>
        <FormCardLoading />
      </FormCard>
    );
  if (error || !popup)
    return (
      <FormCard>
        <FormCardError
          message={error || "Not found"}
          title="Failed to load"
          backHref={PATHS.popupPromotions}
          backLabel="Back"
        />
      </FormCard>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{popup.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant={
                popup.status === "active"
                  ? "success"
                  : popup.status === "paused"
                    ? "warning"
                    : "neutral"
              }
            >
              {popup.status}
            </Badge>
            <Badge variant="primary">{popup.content_type}</Badge>
            {popup.ab_variant && (
              <Badge variant="tertiary">A/B: {popup.ab_variant}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleDuplicate}
            className="gap-1.5"
          >
            <Copy size={14} /> Duplicate
          </Button>
          <Button
            variant="secondary"
            onClick={handleCreateAB}
            className="gap-1.5"
          >
            <FlaskConical size={14} /> A/B Test
          </Button>
          <Button
            variant="primary"
            href={PATHS.popupPromotionEdit(popup.id)}
            className="gap-1.5"
          >
            <Pencil size={14} /> Edit
          </Button>
          {popup.ab_group_id && (
            <Button
              variant="secondary"
              href={PATHS.popupPromotionCompare(popup.id)}
              className="gap-1.5"
            >
              <BarChart3 size={14} /> Compare
            </Button>
          )}
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Impressions"
            value={analytics.impressions}
            icon={Eye}
          />
          <StatCard
            title="Clicks"
            value={analytics.clicks}
            icon={MousePointer}
            description={`CTR: ${analytics.ctr}%`}
          />
          <StatCard
            title="Dismissals"
            value={analytics.dismissals}
            icon={XCircle}
            description={`Rate: ${analytics.dismiss_rate}%`}
          />
          <StatCard
            title="Conversions"
            value={analytics.conversions}
            icon={Target}
            description={`CVR: ${analytics.cvr}%`}
          />
        </div>
      )}

      {/* Config Summary */}
      <FormCard>
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-neutral-900">
            Configuration
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Priority:</span>{" "}
              <span className="font-medium">{popup.priority}</span>
            </div>
            <div>
              <span className="text-neutral-500">Content Type:</span>{" "}
              <span className="font-medium">{popup.content_type}</span>
            </div>
            {popup.target_config && (
              <>
                <div>
                  <span className="text-neutral-500">User Types:</span>{" "}
                  <span className="font-medium">
                    {popup.target_config.user_types?.join(", ") || "All"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Journey Stages:</span>{" "}
                  <span className="font-medium">
                    {popup.target_config.journey_stages?.join(", ") || "All"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">Platforms:</span>{" "}
                  <span className="font-medium">
                    {popup.target_config.platforms?.join(", ") || "All"}
                  </span>
                </div>
              </>
            )}
            {popup.schedule_config && (
              <>
                <div>
                  <span className="text-neutral-500">Start:</span>{" "}
                  <span className="font-medium">
                    {popup.schedule_config.start_date || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">End:</span>{" "}
                  <span className="font-medium">
                    {popup.schedule_config.end_date || "No end"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </FormCard>
    </div>
  );
}
