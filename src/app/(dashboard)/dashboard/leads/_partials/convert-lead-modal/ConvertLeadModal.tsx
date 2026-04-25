"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import { leadsService } from "@services/backoffice/leads";
import { useNotificationStore } from "@store/useNotificationStore";
import { Check, X } from "lucide-react";
import { cn } from "@lib/utils";

interface ConvertLeadModalProps {
  open: boolean;
  leadId: number;
  leadName: string;
  onClose: () => void;
  onConverted: () => void;
}

const ANIMATION_DURATION = 200;

/**
 * Modal dialog for converting a lead to a registered user.
 * Accepts a `converted_user_id` and calls PATCH /backoffice/leads/{id}/convert.
 */
export function ConvertLeadModal({
  open,
  leadId,
  leadName,
  onClose,
  onConverted,
}: ConvertLeadModalProps) {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [userId, setUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cleanupRef = useRef<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Phase 1: Mount/unmount
  useEffect(() => {
    if (open) {
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
      setMounted(true);
    } else if (mounted) {
      setVisible(false);
      unmountTimerRef.current = setTimeout(() => {
        setMounted(false);
      }, ANIMATION_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Phase 2: Enter animation after mount
  useEffect(() => {
    if (!mounted) return;
    const raf1 = requestAnimationFrame(() => {
      cleanupRef.current = requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    return () => cancelAnimationFrame(raf1);
  }, [mounted]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setUserId("");
    setError("");
    onClose();
  }, [submitting, onClose]);

  // Close on Escape key (only when not loading)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, handleClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        !submitting &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    },
    [submitting, handleClose]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericId = Number(userId);
    if (!userId || isNaN(numericId) || numericId <= 0) {
      setError("User ID harus berupa angka positif.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const resp = await leadsService.leadsConvert(leadId, {
        converted_user_id: numericId,
      });
      showNotification(resp.message, "success");
      onConverted();
      handleClose();
    } catch (err: unknown) {
      const apiError = err as {
        message?: string;
        errors?: { converted_user_id?: string[] };
      };
      setError(
        apiError.errors?.converted_user_id?.[0] ||
          apiError.message ||
          "Gagal meng-convert lead."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />

      {/* Modal Content */}
      <div
        ref={panelRef}
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border-subtle transition-all",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        )}
        style={{
          transitionDuration: `${ANIMATION_DURATION}ms`,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border-subtle">
          <div>
            <h2 className="text-[16px] font-bold text-text-main">
              Convert Lead
            </h2>
            <p className="text-[13px] text-text-muted mt-1">
              Hubungkan lead{" "}
              <span className="font-semibold text-text-main">"{leadName}"</span>{" "}
              ke akun user yang sudah terdaftar.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <FormInput
              id="converted_user_id"
              label="User ID"
              placeholder="Masukkan ID user yang terdaftar"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError("");
              }}
              error={error}
              type="number"
            />
            <p className="mt-2 text-[12px] text-text-muted">
              Masukkan ID numerik dari akun user yang akan di-link ke lead ini.
              Status lead akan otomatis berubah menjadi{" "}
              <span className="font-semibold">Won</span>.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={submitting}
              className="text-text-muted hover:text-text-main hover:bg-neutral-100 px-5 font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 shadow-md shadow-primary-200/60"
              isLoading={submitting}
            >
              <Check size={15} strokeWidth={2.5} className="mr-2" />
              Convert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
