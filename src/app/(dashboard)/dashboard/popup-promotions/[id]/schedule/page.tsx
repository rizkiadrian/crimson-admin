"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { PATHS } from "@config/routing";
import { popupPromotionsService } from "@services/marketing/popup-promotions";
import type { IPopupPromotion } from "@services/marketing/popup-promotions";

export default function PopupPromotionSchedulePage() {
  const params = useParams();
  const id = params.id as string;
  const fetcher = useCallback(() => popupPromotionsService.getById(id), [id]);
  const { data, isLoading, error } = useDetailData<IPopupPromotion>({
    fetcher,
    enabled: !!id,
  });

  if (isLoading)
    return (
      <FormCard>
        <FormCardLoading />
      </FormCard>
    );
  if (error || !data)
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

  return <ScheduleForm popup={data} />;
}

function ScheduleForm({ popup }: { popup: IPopupPromotion }) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [startDate, setStartDate] = useState(
    popup.schedule_config?.start_date || ""
  );
  const [endDate, setEndDate] = useState(popup.schedule_config?.end_date || "");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      setFormErrors({ start_date: "Start date is required" });
      return;
    }
    setFormErrors({});
    setSubmitting(true);
    try {
      await popupPromotionsService.update(popup.id, {
        schedule_config: { start_date: startDate, end_date: endDate || null },
      });
      await popupPromotionsService.changeStatus(popup.id, "scheduled");
      showNotification("Popup scheduled successfully", "success");
      router.push(PATHS.popupPromotions);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard>
      <FormCardHeader
        title="Set Schedule"
        description={`Schedule "${popup.name}" for activation`}
        badge="Popup Promotions"
      />
      <form onSubmit={handleSubmit}>
        <FormCardBody>
          <FormInput
            id="start_date"
            label="Start Date"
            format="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={formErrors.start_date}
          />
          <FormInput
            id="end_date"
            label="End Date (optional)"
            format="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={formErrors.end_date}
          />
        </FormCardBody>
        <FormCardFooter>
          <Button
            type="button"
            variant="ghost"
            href={PATHS.popupPromotions}
            className="px-6 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-8 shadow-md shadow-primary-200/60"
            isLoading={submitting}
          >
            <CalendarClock size={16} strokeWidth={2.5} className="mr-2" />
            Schedule Popup
          </Button>
        </FormCardFooter>
      </form>
    </FormCard>
  );
}
