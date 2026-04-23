"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@lib/utils";
import { useConfirmStore } from "@store/useConfirmStore";
import { Button } from "@app/components/ui/Button";

/** Duration in ms for the enter/exit animation. */
const ANIMATION_DURATION = 200;

/**
 * Global confirmation dialog component.
 *
 * Mount once in the root layout. Driven entirely by useConfirmStore.
 * Renders a centered modal with warning icon, title, description,
 * and Cancel + Confirm buttons.
 */
export function ConfirmDialog() {
  const {
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel,
    isLoading,
    onConfirm,
    hideConfirm,
    setLoading,
  } = useConfirmStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cleanupRef = useRef<number>(0);

  // Phase 1: Mount/unmount
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

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

  // Close on Escape key (only when not loading)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) hideConfirm();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, hideConfirm]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        !isLoading &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        hideConfirm();
      }
    },
    [isLoading, hideConfirm]
  );

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) return;
    try {
      setLoading(true);
      await onConfirm();
      hideConfirm();
    } catch {
      setLoading(false);
    }
  }, [onConfirm, setLoading, hideConfirm]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />

      <div
        ref={panelRef}
        className={cn(
          "relative bg-bg-card rounded-2xl shadow-2xl border border-border-subtle w-full max-w-sm mx-4 transition-all",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        )}
        style={{
          transitionDuration: `${ANIMATION_DURATION}ms`,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-error-50 flex items-center justify-center mb-5">
            <AlertTriangle
              size={28}
              className="text-error-500"
              strokeWidth={2}
            />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>
          <p className="text-sm text-text-muted leading-relaxed max-w-xs">
            {description}
          </p>
        </div>

        <div className="px-8 pb-8 flex items-center gap-3">
          <Button
            type="button"
            variant="outlined"
            className="flex-1 rounded-full"
            onClick={hideConfirm}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1 rounded-full shadow-md shadow-primary-200/60"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
