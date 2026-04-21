"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Check, RotateCcw } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";

// ─── FilterPopup ────────────────────────────────────────────────────────────────

export interface FilterPopupProps {
  /** Whether the popup is visible. */
  open: boolean;
  /** Called when the popup should close (backdrop click, X button, Cancel). */
  onClose: () => void;
  /** Popup title displayed in the header. */
  title: string;
  /** Filter sections rendered inside the popup body. */
  children: React.ReactNode;
  /** Called when "Apply Filters" is clicked. */
  onApply: () => void;
  /** Called when "Reset Filters" is clicked. */
  onReset: () => void;
}

/** Duration in ms for the enter/exit animation. */
const ANIMATION_DURATION = 200;

/**
 * Modal popup for table filters.
 *
 * Renders a centered overlay with:
 * - Header: title + close button
 * - Body: composable filter sections (chips, range sliders, date pickers)
 * - Footer: Reset Filters link, Cancel button, Apply Filters button
 *
 * Animates in (fade + scale up) and out (fade + scale down).
 * Closes on backdrop click or Escape key.
 */
export function FilterPopup({
  open,
  onClose,
  title,
  children,
  onApply,
  onReset,
}: FilterPopupProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Two-phase animation: `mounted` keeps DOM alive, `visible` drives CSS transitions.
  // Split into separate effects to avoid synchronous setState inside a single effect.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Phase 1: Mount/unmount the DOM node.
  // When `open` is true, mount immediately.
  // When `open` is false, start exit animation then unmount after duration.
  useEffect(() => {
    if (open) {
      // Clear any pending unmount timer from a previous close
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
      setMounted(true);
    } else if (mounted) {
      // Trigger exit animation by setting visible to false
      setVisible(false);
      unmountTimerRef.current = setTimeout(() => {
        setMounted(false);
      }, ANIMATION_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Phase 2: Trigger enter animation after mount is committed to the DOM.
  // This runs when `mounted` flips to true, ensuring the initial "hidden" state
  // is painted before transitioning to "visible".
  useEffect(() => {
    if (!mounted) return;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setVisible(true);
      });
      // Store raf2 for cleanup — not strictly needed but good practice
      cleanupRef.current = raf2;
    });
    return () => cancelAnimationFrame(raf1);
  }, [mounted]);

  // Ref to track inner rAF for cleanup
  const cleanupRef = useRef<number>(0);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "relative bg-bg-card rounded-2xl shadow-2xl border border-border-subtle w-full max-w-lg mx-4 transition-all",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        )}
        style={{
          transitionDuration: `${ANIMATION_DURATION}ms`,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-main tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-text-main hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close filter popup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body — filter sections */}
        <div className="px-8 pb-6 space-y-6">{children}</div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border-subtle flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-semibold text-primary-500 hover:text-primary-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="shadow-md shadow-primary-200/60"
              onClick={onApply}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FilterSection ──────────────────────────────────────────────────────────────

export interface FilterSectionProps {
  /** Uppercase label displayed above the filter content. */
  label: string;
  /** Optional content rendered on the right side of the label (e.g. range display). */
  labelRight?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A labeled section inside a FilterPopup.
 * Renders an uppercase label with optional right-side content, followed by the filter control.
 */
export function FilterSection({
  label,
  labelRight,
  children,
}: FilterSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
          {label}
        </span>
        {labelRight && (
          <span className="text-[13px] font-semibold text-primary-500">
            {labelRight}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── FilterChipGroup ────────────────────────────────────────────────────────────

export interface FilterChipOption {
  label: string;
  value: string;
}

export interface FilterChipGroupProps {
  /** Available options to display as chips. */
  options: FilterChipOption[];
  /** Currently selected values. */
  selected: string[];
  /** Called when selection changes. */
  onChange: (selected: string[]) => void;
  /** Allow multiple selections. Defaults to true. */
  multiple?: boolean;
}

/**
 * A group of selectable chip/pill buttons.
 * Matches the design: selected chips have a primary border, background tint, and checkmark icon.
 * Supports single or multi-select mode.
 */
export function FilterChipGroup({
  options,
  selected,
  onChange,
  multiple = true,
}: FilterChipGroupProps) {
  const handleToggle = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        onChange(selected.filter((v) => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border transition-all cursor-pointer",
              isSelected
                ? "bg-primary-50 text-primary-600 border-primary-300"
                : "bg-white text-secondary-700 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
            )}
          >
            {isSelected && <Check size={14} strokeWidth={2.5} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── FilterRangeSlider ──────────────────────────────────────────────────────────

export interface FilterRangeSliderProps {
  /** Minimum possible value. */
  min: number;
  /** Maximum possible value. */
  max: number;
  /** Step increment. */
  step?: number;
  /** Current range [low, high]. */
  value: [number, number];
  /** Called when the range changes. */
  onChange: (value: [number, number]) => void;
  /** Format function for the min/max labels below the slider. */
  formatLabel?: (value: number) => string;
  /** Format function for the selected range display. */
  formatRange?: (low: number, high: number) => string;
}

/**
 * Dual-thumb range slider for numeric filtering.
 * Uses two native range inputs overlaid on a custom track.
 * The filled portion between thumbs is highlighted in primary color.
 */
export function FilterRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (v) => String(v),
  formatRange,
}: FilterRangeSliderProps) {
  const [low, high] = value;

  // Calculate percentage positions for the filled track
  const range = max - min || 1;
  const lowPercent = ((low - min) / range) * 100;
  const highPercent = ((high - min) / range) * 100;

  const handleLowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLow = Math.min(Number(e.target.value), high - step);
    onChange([newLow, high]);
  };

  const handleHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHigh = Math.max(Number(e.target.value), low + step);
    onChange([low, newHigh]);
  };

  return (
    <div>
      {/* Range display */}
      {formatRange && (
        <div className="text-right mb-2">
          <span className="text-[13px] font-semibold text-primary-500">
            {formatRange(low, high)}
          </span>
        </div>
      )}

      {/* Slider track */}
      <div className="relative h-6 flex items-center">
        {/* Background track */}
        <div className="absolute left-0 right-0 h-1 bg-neutral-200 rounded-full" />

        {/* Filled track between thumbs */}
        <div
          className="absolute h-1 bg-primary-500 rounded-full"
          style={{
            left: `${lowPercent}%`,
            right: `${100 - highPercent}%`,
          }}
        />

        {/* Low thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLowChange}
          aria-label="Range minimum value"
          className="filter-range-thumb absolute w-full"
        />

        {/* High thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHighChange}
          aria-label="Range maximum value"
          className="filter-range-thumb absolute w-full"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[12px] font-medium text-neutral-400">
          {formatLabel(min)}
        </span>
        <span className="text-[12px] font-medium text-neutral-400">
          {formatLabel(max)}
        </span>
      </div>
    </div>
  );
}

// ─── FilterDateRange ────────────────────────────────────────────────────────────

export interface FilterDateRangeProps {
  /** Start date value (ISO string YYYY-MM-DD or empty). */
  startDate: string;
  /** End date value (ISO string YYYY-MM-DD or empty). */
  endDate: string;
  /** Called when start date changes with ISO string. */
  onStartDateChange: (date: string) => void;
  /** Called when end date changes with ISO string. */
  onEndDateChange: (date: string) => void;
  /** Placeholder for start date input. */
  startPlaceholder?: string;
  /** Placeholder for end date input. */
  endPlaceholder?: string;
}

/**
 * Date range picker using two FormInput components with `format="date"`.
 * Each input shows a calendar popover powered by react-day-picker.
 * Emits ISO date strings (YYYY-MM-DD) via the change callbacks.
 */
export function FilterDateRange({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = "Start date",
  endPlaceholder = "End date",
}: FilterDateRangeProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormInput
        id="filter-date-start"
        label="Start"
        hideLabel
        format="date"
        inputSize="sm"
        value={startDate}
        placeholder={startPlaceholder}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <FormInput
        id="filter-date-end"
        label="End"
        hideLabel
        format="date"
        inputSize="sm"
        value={endDate}
        placeholder={endPlaceholder}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </div>
  );
}
