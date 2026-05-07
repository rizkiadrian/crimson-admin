"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2 } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import type { FormSelectOption } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { PATHS } from "@config/routing";
import { referralCampaignsService } from "@services/backoffice/referral-campaigns";
import { vouchersService } from "@services/backoffice/vouchers";
import type {
  RewardType,
  TargetRole,
  IReferralMilestonePayload,
  IReferralTierPayload,
} from "@services/backoffice/referral-campaigns";

// ─── Options ────────────────────────────────────────────────────────────────────

const TARGET_ROLE_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "Mitra", value: "mitra" },
];

const REWARD_TYPE_OPTIONS = [
  { label: "Cashback", value: "cashback" },
  { label: "Voucher", value: "voucher" },
  { label: "None", value: "none" },
];

const EVENT_TYPE_OPTIONS = [
  { label: "Registration", value: "registration" },
  { label: "First Transaction", value: "first_transaction" },
  { label: "Mitra Approved", value: "mitra_approved" },
  { label: "Profile Completed", value: "profile_completed" },
  { label: "KYC Verified", value: "kyc_verified" },
];

// ─── Types ──────────────────────────────────────────────────────────────────────

interface MilestoneFormData {
  name: string;
  event_type: string;
  sort_order: string;
  referrer_reward_type: RewardType;
  referrer_reward_amount: string;
  referrer_voucher_id: string;
  referee_reward_type: RewardType;
  referee_reward_amount: string;
  referee_voucher_id: string;
}

interface TierFormData {
  name: string;
  min_referrals: string;
  max_referrals: string;
  bonus_percentage: string;
  sort_order: string;
}

interface CampaignFormData {
  name: string;
  description: string;
  target_role: TargetRole;
  starts_at: string;
  ends_at: string;
  max_referrals_per_user: string;
}

const EMPTY_MILESTONE: MilestoneFormData = {
  name: "",
  event_type: "",
  sort_order: "1",
  referrer_reward_type: "cashback",
  referrer_reward_amount: "",
  referrer_voucher_id: "",
  referee_reward_type: "cashback",
  referee_reward_amount: "",
  referee_voucher_id: "",
};

const EMPTY_TIER: TierFormData = {
  name: "",
  min_referrals: "0",
  max_referrals: "",
  bonus_percentage: "",
  sort_order: "1",
};

// ─── Voucher Search Hook ────────────────────────────────────────────────────────

function useVoucherOptions() {
  const [options, setOptions] = useState<FormSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVouchers = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const resp = await vouchersService.list({
        search: search || undefined,
        per_page: 20,
      });
      const voucherOptions: FormSelectOption[] = resp.data.map((v) => ({
        label: `${v.name}${v.code ? ` (${v.code})` : ""}`,
        value: String(v.id),
      }));
      setOptions(voucherOptions);
    } catch {
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial vouchers on mount
  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchVouchers(query);
      }, 300);
    },
    [fetchVouchers]
  );

  return { options, isLoading, handleSearch };
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function ReferralCampaignCreatePage() {
  return <CampaignCreateForm />;
}

function CampaignCreateForm() {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const {
    options: voucherOptions,
    isLoading: vouchersLoading,
    handleSearch: handleVoucherSearch,
  } = useVoucherOptions();

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    target_role: "client",
    starts_at: "",
    ends_at: "",
    max_referrals_per_user: "",
  });

  const [milestones, setMilestones] = useState<MilestoneFormData[]>([
    { ...EMPTY_MILESTONE },
  ]);
  const [tiers, setTiers] = useState<TierFormData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // ─── Milestone Handlers ─────────────────────────────────────────────────────

  const handleMilestoneChange = (
    index: number,
    field: keyof MilestoneFormData,
    value: string
  ) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { ...EMPTY_MILESTONE, sort_order: String(prev.length + 1) },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Tier Handlers ──────────────────────────────────────────────────────────

  const handleTierChange = (
    index: number,
    field: keyof TierFormData,
    value: string
  ) => {
    setTiers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addTier = () => {
    setTiers((prev) => [
      ...prev,
      { ...EMPTY_TIER, sort_order: String(prev.length + 1) },
    ]);
  };

  const removeTier = (index: number) => {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      setSubmitting(true);

      const milestonesPayload: IReferralMilestonePayload[] = milestones.map(
        (m) => ({
          name: m.name,
          event_type: m.event_type,
          sort_order: Number(m.sort_order),
          referrer_reward_type: m.referrer_reward_type,
          referrer_reward_amount:
            m.referrer_reward_type === "cashback"
              ? Number(m.referrer_reward_amount) || null
              : null,
          referrer_voucher_id:
            m.referrer_reward_type === "voucher"
              ? Number(m.referrer_voucher_id) || null
              : null,
          referee_reward_type: m.referee_reward_type,
          referee_reward_amount:
            m.referee_reward_type === "cashback"
              ? Number(m.referee_reward_amount) || null
              : null,
          referee_voucher_id:
            m.referee_reward_type === "voucher"
              ? Number(m.referee_voucher_id) || null
              : null,
        })
      );

      const tiersPayload: IReferralTierPayload[] = tiers.map((t) => ({
        name: t.name,
        min_referrals: Number(t.min_referrals),
        max_referrals: t.max_referrals ? Number(t.max_referrals) : null,
        bonus_percentage: Number(t.bonus_percentage),
        sort_order: Number(t.sort_order),
      }));

      const resp = await referralCampaignsService.create({
        name: formData.name,
        description: formData.description || null,
        target_role: formData.target_role,
        starts_at: formData.starts_at,
        ends_at: formData.ends_at || null,
        max_referrals_per_user: formData.max_referrals_per_user
          ? Number(formData.max_referrals_per_user)
          : null,
        milestones: milestonesPayload,
        tiers: tiersPayload.length > 0 ? tiersPayload : undefined,
      });

      showNotification(resp.message || "Campaign berhasil dibuat", "success");
      router.push(PATHS.referralCampaigns);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <FormCard>
        <FormCardHeader
          title="Create Referral Campaign"
          description="Buat campaign referral baru dengan milestone dan tier rewards."
          badge="Referral Program"
        />

        <form onSubmit={handleSubmit}>
          <FormCardBody>
            {/* Section 1 — Basic Info */}
            <div>
              <p className="text-xs text-secondary-500 uppercase font-medium mb-4 tracking-wide">
                Basic Info
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormInput
                  id="name"
                  label="Campaign Name"
                  placeholder="e.g. Referral Client Q1 2025"
                  value={formData.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  maxLength={255}
                />

                <FormSelect
                  id="target_role"
                  label="Target Role"
                  value={formData.target_role}
                  onChange={handleChange}
                  options={TARGET_ROLE_OPTIONS}
                  error={formErrors.target_role}
                />

                <FormInput
                  id="starts_at"
                  label="Start Date"
                  format="date"
                  placeholder="Select start date"
                  value={formData.starts_at}
                  onChange={handleChange}
                  error={formErrors.starts_at}
                />

                <FormInput
                  id="ends_at"
                  label="End Date (optional)"
                  format="date"
                  placeholder="Select end date"
                  value={formData.ends_at}
                  onChange={handleChange}
                  error={formErrors.ends_at}
                />

                <FormInput
                  id="max_referrals_per_user"
                  label="Max Referrals Per User (optional)"
                  placeholder="Leave empty for unlimited"
                  type="number"
                  value={formData.max_referrals_per_user}
                  onChange={handleChange}
                  error={formErrors.max_referrals_per_user}
                  min={1}
                />
              </div>

              <div className="mt-6">
                <FormInput
                  id="description"
                  as="textarea"
                  label="Description (optional)"
                  placeholder="Deskripsi campaign"
                  value={formData.description}
                  onChange={handleChange}
                  error={formErrors.description}
                />
              </div>
            </div>

            {/* Section 2 — Milestones */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-secondary-500 uppercase font-medium tracking-wide">
                  Milestones
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addMilestone}
                  className="gap-1.5"
                >
                  <Plus size={14} />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <MilestoneEntry
                    key={index}
                    index={index}
                    data={milestone}
                    onChange={handleMilestoneChange}
                    onRemove={removeMilestone}
                    canRemove={milestones.length > 1}
                    formErrors={formErrors}
                    voucherOptions={voucherOptions}
                    vouchersLoading={vouchersLoading}
                    onVoucherSearch={handleVoucherSearch}
                  />
                ))}
              </div>
            </div>

            {/* Section 3 — Tiers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-secondary-500 uppercase font-medium tracking-wide">
                  Tiers (optional)
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTier}
                  className="gap-1.5"
                >
                  <Plus size={14} />
                  Add Tier
                </Button>
              </div>

              {tiers.length === 0 ? (
                <p className="text-sm text-text-muted">
                  No tiers configured. Add tiers to provide bonus rewards for
                  active referrers.
                </p>
              ) : (
                <div className="space-y-6">
                  {tiers.map((tier, index) => (
                    <TierEntry
                      key={index}
                      index={index}
                      data={tier}
                      onChange={handleTierChange}
                      onRemove={removeTier}
                      formErrors={formErrors}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4" />
          </FormCardBody>

          <FormCardFooter>
            <Button
              type="button"
              variant="ghost"
              href={PATHS.referralCampaigns}
              className="text-text-muted hover:text-text-main hover:bg-neutral-100 px-6 font-medium"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="px-8 shadow-md shadow-primary-200/60"
              isLoading={submitting}
            >
              <Check size={16} strokeWidth={2.5} className="mr-2" />
              Create Campaign
            </Button>
          </FormCardFooter>
        </form>
      </FormCard>
    </div>
  );
}

// ─── Milestone Entry ────────────────────────────────────────────────────────────

function MilestoneEntry({
  index,
  data,
  onChange,
  onRemove,
  canRemove,
  formErrors,
  voucherOptions,
  vouchersLoading,
  onVoucherSearch,
}: {
  index: number;
  data: MilestoneFormData;
  onChange: (
    index: number,
    field: keyof MilestoneFormData,
    value: string
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  formErrors: Record<string, string>;
  voucherOptions: FormSelectOption[];
  vouchersLoading: boolean;
  onVoucherSearch: (query: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border-subtle p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-main">
          Milestone {index + 1}
        </p>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-auto w-auto p-1.5 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
            onClick={() => onRemove(index)}
            aria-label="Remove milestone"
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        <FormInput
          id={`milestones.${index}.name`}
          label="Name"
          placeholder="e.g. Registration Complete"
          value={data.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          error={formErrors[`milestones.${index}.name`]}
        />

        <FormSelect
          id={`milestones.${index}.event_type`}
          label="Event Type"
          value={data.event_type}
          onChange={(e) => onChange(index, "event_type", e.target.value)}
          options={EVENT_TYPE_OPTIONS}
          placeholder="Select event"
          error={formErrors[`milestones.${index}.event_type`]}
        />

        <FormInput
          id={`milestones.${index}.sort_order`}
          label="Sort Order"
          type="number"
          value={data.sort_order}
          onChange={(e) => onChange(index, "sort_order", e.target.value)}
          error={formErrors[`milestones.${index}.sort_order`]}
          min={1}
        />
      </div>

      {/* Referrer Reward */}
      <div>
        <p className="text-xs text-text-muted font-medium mb-2">
          Referrer Reward
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <FormSelect
            id={`milestones.${index}.referrer_reward_type`}
            label="Type"
            value={data.referrer_reward_type}
            onChange={(e) =>
              onChange(index, "referrer_reward_type", e.target.value)
            }
            options={REWARD_TYPE_OPTIONS}
            error={formErrors[`milestones.${index}.referrer_reward_type`]}
          />

          {data.referrer_reward_type === "cashback" && (
            <FormInput
              id={`milestones.${index}.referrer_reward_amount`}
              label="Amount (Rp)"
              type="number"
              placeholder="e.g. 50000"
              value={data.referrer_reward_amount}
              onChange={(e) =>
                onChange(index, "referrer_reward_amount", e.target.value)
              }
              error={formErrors[`milestones.${index}.referrer_reward_amount`]}
              min={1}
            />
          )}

          {data.referrer_reward_type === "voucher" && (
            <FormSelect
              id={`milestones.${index}.referrer_voucher_id`}
              label="Voucher"
              value={data.referrer_voucher_id}
              onChange={(e) =>
                onChange(index, "referrer_voucher_id", e.target.value)
              }
              options={voucherOptions}
              placeholder="Select voucher"
              onSearch={onVoucherSearch}
              isLoading={vouchersLoading}
              searchPlaceholder="Search voucher..."
              error={formErrors[`milestones.${index}.referrer_voucher_id`]}
            />
          )}
        </div>
      </div>

      {/* Referee Reward */}
      <div>
        <p className="text-xs text-text-muted font-medium mb-2">
          Referee Reward
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <FormSelect
            id={`milestones.${index}.referee_reward_type`}
            label="Type"
            value={data.referee_reward_type}
            onChange={(e) =>
              onChange(index, "referee_reward_type", e.target.value)
            }
            options={REWARD_TYPE_OPTIONS}
            error={formErrors[`milestones.${index}.referee_reward_type`]}
          />

          {data.referee_reward_type === "cashback" && (
            <FormInput
              id={`milestones.${index}.referee_reward_amount`}
              label="Amount (Rp)"
              type="number"
              placeholder="e.g. 25000"
              value={data.referee_reward_amount}
              onChange={(e) =>
                onChange(index, "referee_reward_amount", e.target.value)
              }
              error={formErrors[`milestones.${index}.referee_reward_amount`]}
              min={1}
            />
          )}

          {data.referee_reward_type === "voucher" && (
            <FormSelect
              id={`milestones.${index}.referee_voucher_id`}
              label="Voucher"
              value={data.referee_voucher_id}
              onChange={(e) =>
                onChange(index, "referee_voucher_id", e.target.value)
              }
              options={voucherOptions}
              placeholder="Select voucher"
              onSearch={onVoucherSearch}
              isLoading={vouchersLoading}
              searchPlaceholder="Search voucher..."
              error={formErrors[`milestones.${index}.referee_voucher_id`]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tier Entry ─────────────────────────────────────────────────────────────────

function TierEntry({
  index,
  data,
  onChange,
  onRemove,
  formErrors,
}: {
  index: number;
  data: TierFormData;
  onChange: (index: number, field: keyof TierFormData, value: string) => void;
  onRemove: (index: number) => void;
  formErrors: Record<string, string>;
}) {
  return (
    <div className="rounded-xl border border-border-subtle p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text-main">Tier {index + 1}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-auto w-auto p-1.5 rounded-lg hover:text-error-600 hover:bg-error-50 hover:border-transparent"
          onClick={() => onRemove(index)}
          aria-label="Remove tier"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
        <FormInput
          id={`tiers.${index}.name`}
          label="Tier Name"
          placeholder="e.g. Bronze"
          value={data.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
          error={formErrors[`tiers.${index}.name`]}
        />

        <FormInput
          id={`tiers.${index}.min_referrals`}
          label="Min Referrals"
          type="number"
          value={data.min_referrals}
          onChange={(e) => onChange(index, "min_referrals", e.target.value)}
          error={formErrors[`tiers.${index}.min_referrals`]}
          min={0}
        />

        <FormInput
          id={`tiers.${index}.max_referrals`}
          label="Max Referrals (optional)"
          type="number"
          placeholder="Leave empty for unlimited"
          value={data.max_referrals}
          onChange={(e) => onChange(index, "max_referrals", e.target.value)}
          error={formErrors[`tiers.${index}.max_referrals`]}
          min={1}
        />

        <FormInput
          id={`tiers.${index}.bonus_percentage`}
          label="Bonus Percentage (%)"
          type="number"
          placeholder="e.g. 10"
          value={data.bonus_percentage}
          onChange={(e) => onChange(index, "bonus_percentage", e.target.value)}
          error={formErrors[`tiers.${index}.bonus_percentage`]}
          min={0}
          max={100}
        />

        <FormInput
          id={`tiers.${index}.sort_order`}
          label="Sort Order"
          type="number"
          value={data.sort_order}
          onChange={(e) => onChange(index, "sort_order", e.target.value)}
          error={formErrors[`tiers.${index}.sort_order`]}
          min={1}
        />
      </div>
    </div>
  );
}
