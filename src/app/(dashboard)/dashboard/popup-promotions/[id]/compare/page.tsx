"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import {
  FormCard,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { StatCard } from "@app/components/ui/StatCard";
import { Button } from "@app/components/ui/Button";
import { Eye, MousePointer, Target } from "lucide-react";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { popupPromotionsService } from "@services/marketing/popup-promotions";
import type { IPopupABVariant } from "@services/marketing/popup-promotions";
import { PATHS } from "@config/routing";

export default function PopupABComparePage() {
  const params = useParams();
  const id = params.id as string;

  const fetcher = useCallback(
    () => popupPromotionsService.getCompare(id),
    [id]
  );
  const {
    data: variants,
    isLoading,
    error,
  } = useDetailData<IPopupABVariant[]>({ fetcher, enabled: !!id });

  if (isLoading)
    return (
      <FormCard>
        <FormCardLoading />
      </FormCard>
    );
  if (error || !variants)
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

  if (!variants.length) {
    return (
      <FormCard>
        <div className="p-8 text-center">
          <p className="text-neutral-500">
            This popup is not part of an A/B test.
          </p>
          <Button
            variant="ghost"
            href={PATHS.popupPromotionDetail(id)}
            className="mt-4"
          >
            Back to Detail
          </Button>
        </div>
      </FormCard>
    );
  }

  const winner = variants.reduce((a, b) => (a.cvr > b.cvr ? a : b));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">
          A/B Test Comparison
        </h1>
        <Button variant="ghost" href={PATHS.popupPromotionDetail(id)}>
          Back to Detail
        </Button>
      </div>

      {/* Winner */}
      <div className="bg-success-50 border border-success-200 rounded-xl p-4">
        <p className="text-sm text-success-700 font-medium">
          🏆 Recommended winner: <strong>Variant {winner.variant}</strong> (
          {winner.name}) — CVR {winner.cvr}%
        </p>
      </div>

      {/* Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {variants.map((v) => (
          <div
            key={v.popup_id}
            className={`border rounded-xl p-6 space-y-4 ${v.popup_id === winner.popup_id ? "border-success-300 bg-success-50/30" : "border-neutral-200"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">
                Variant {v.variant}
              </h3>
              {v.popup_id === winner.popup_id && (
                <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full font-medium">
                  Winner
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500">{v.name}</p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard title="Impressions" value={v.impressions} icon={Eye} />
              <StatCard title="CTR" value={`${v.ctr}%`} icon={MousePointer} />
              <StatCard title="CVR" value={`${v.cvr}%`} icon={Target} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div>
                <p className="text-neutral-500">Clicks</p>
                <p className="font-semibold">{v.clicks}</p>
              </div>
              <div>
                <p className="text-neutral-500">Dismissals</p>
                <p className="font-semibold">{v.dismissals}</p>
              </div>
              <div>
                <p className="text-neutral-500">Conversions</p>
                <p className="font-semibold">{v.conversions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
