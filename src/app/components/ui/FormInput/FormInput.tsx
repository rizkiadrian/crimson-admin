"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@lib/utils";
import { Eye, EyeOff, Calendar } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";

export interface FormInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "format"
> {
  /** Label text displayed above the input. */
  label: string;
  /** HTML id attribute, also used for the label's `htmlFor`. */
  id: string;
  /** Icon rendered inside the input on the left side. */
  leftIcon?: React.ReactNode;
  /** Icon rendered inside the input on the right side. */
  rightIcon?: React.ReactNode;
  /** Additional className applied to the outer input container. */
  containerClassName?: string;
  /**
   * Input format mode:
   * - `"phone"`: auto-formats display as +62 XXX-XXXX-XXXX, emits raw digits.
   * - `"date"`: shows a calendar popover, emits ISO date string (YYYY-MM-DD).
   * - `"default"`: standard text input.
   */
  format?: "phone" | "date" | "default";
  /** Error message string. When present, triggers error border and shows the message below. */
  error?: string;
  /** Display format for date values. Defaults to "MMM dd, yyyy" (e.g. "Jan 01, 2023"). */
  dateDisplayFormat?: string;
  /** Hide the label. Useful inside compact layouts like FilterDateRange. */
  hideLabel?: boolean;
  /** Size variant. "sm" reduces padding for compact contexts like filter popups. */
  inputSize?: "default" | "sm";
}

/**
 * Form input with built-in label, error state, icon slots, password toggle,
 * Indonesian phone number formatting, and calendar date picker.
 *
 * When `format="phone"`:
 * - The displayed value is formatted as `+62 XXX-XXXX-XXXX` for readability.
 * - The value emitted via `onChange` is the raw digit string (e.g. "6281234567890").
 *
 * When `format="date"`:
 * - Clicking the input or calendar icon opens a `react-day-picker` calendar popover.
 * - The displayed value is formatted as "MMM dd, yyyy" (customizable via `dateDisplayFormat`).
 * - The value emitted via `onChange` is an ISO date string (YYYY-MM-DD).
 *
 * When `type="password"`:
 * - A show/hide toggle button replaces the right icon slot.
 *
 * Supports `ref` forwarding for integration with form libraries (e.g. React Hook Form).
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      id,
      className,
      leftIcon,
      rightIcon,
      containerClassName,
      type = "text",
      format: inputFormat = "default",
      error,
      onChange,
      value,
      dateDisplayFormat = "MMM dd, yyyy",
      hideLabel = false,
      inputSize = "default",
      placeholder,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const calendarPopoverRef = useRef<HTMLDivElement>(null);
    const inputBarRef = useRef<HTMLDivElement>(null);

    const isPassword = type === "password";
    const isDate = inputFormat === "date";
    const currentType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : isDate
        ? "text"
        : type;

    // Close calendar only when clicking outside the entire component (input + popover).
    // Uses "mouseup" instead of "mousedown" so DayPicker's onSelect fires first.
    useEffect(() => {
      if (!calendarOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setCalendarOpen(false);
        }
      };
      document.addEventListener("mouseup", handleClickOutside);
      return () => document.removeEventListener("mouseup", handleClickOutside);
    }, [calendarOpen]);

    // ─── Phone formatting helpers ─────────────────────────────────────────

    const getPhoneDisplayValue = (
      val: string | number | readonly string[] | undefined
    ) => {
      if (typeof val !== "string") return val;

      let cleaned = val.replace(/[^\d+]/g, "");
      if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
      else if (cleaned.startsWith("8")) cleaned = "628" + cleaned.slice(1);
      else if (cleaned.startsWith("+62")) cleaned = "62" + cleaned.substring(3);

      const digits = cleaned.replace(/\D/g, "");
      if (digits.startsWith("62")) {
        let formatted = "+62";
        if (digits.length > 2) formatted += " " + digits.substring(2, 5);
        if (digits.length > 5) formatted += "-" + digits.substring(5, 9);
        if (digits.length > 9) formatted += "-" + digits.substring(9, 15);
        return formatted;
      }
      return cleaned;
    };

    const getRawPhoneValue = (val: string) => {
      let cleaned = val.replace(/[^\d+]/g, "");
      if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
      else if (cleaned.startsWith("8")) cleaned = "628" + cleaned.slice(1);
      else if (cleaned.startsWith("+62")) cleaned = "62" + cleaned.substring(3);
      return cleaned.replace(/\D/g, "");
    };

    // ─── Date formatting helpers ──────────────────────────────────────────

    /** Converts an ISO date string (YYYY-MM-DD) to a display string. */
    const getDateDisplayValue = (
      val: string | number | readonly string[] | undefined
    ): string => {
      if (typeof val !== "string" || !val) return "";
      const parsed = parse(val, "yyyy-MM-dd", new Date());
      if (!isValid(parsed)) return val;
      return format(parsed, dateDisplayFormat);
    };

    /** Converts the ISO value string to a Date object for the calendar. */
    const getSelectedDate = (): Date | undefined => {
      if (typeof value !== "string" || !value) return undefined;
      const parsed = parse(value, "yyyy-MM-dd", new Date());
      return isValid(parsed) ? parsed : undefined;
    };

    /** Emits a synthetic onChange event with the ISO date string. */
    const emitDateChange = useCallback(
      (date: Date | undefined) => {
        if (!onChange) return;
        const isoValue = date ? format(date, "yyyy-MM-dd") : "";
        const syntheticEvent = {
          target: { id, name: id, value: isoValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      },
      [onChange, id]
    );

    // ─── onChange interceptor ─────────────────────────────────────────────

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (inputFormat === "phone") {
        const rawValue = getRawPhoneValue(e.target.value);
        if (onChange) {
          const clonedEvent = {
            ...e,
            target: {
              ...e.target,
              id: e.target.id,
              name: e.target.name,
              value: rawValue,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(clonedEvent);
        }
      } else if (inputFormat === "date") {
        // For date inputs, typing is disabled — selection happens via calendar
        return;
      } else {
        onChange?.(e);
      }
    };

    // ─── Compute display value ────────────────────────────────────────────

    const displayValue =
      inputFormat === "phone"
        ? getPhoneDisplayValue(value)
        : inputFormat === "date"
          ? getDateDisplayValue(value)
          : value;

    // ─── Determine left icon ──────────────────────────────────────────────

    const resolvedLeftIcon = isDate ? <Calendar size={16} /> : leftIcon;

    const paddingClass =
      inputSize === "sm" ? "py-2.5 px-3 text-[13px]" : "py-3.5 px-4 text-base";

    return (
      <div className="w-full" ref={containerRef}>
        {!hideLabel && (
          <label
            htmlFor={id}
            className="block text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide select-none"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <div
            ref={inputBarRef}
            className={cn(
              "flex items-center w-full overflow-hidden transition-colors border rounded-xl",
              !error &&
                "bg-neutral-50 border-neutral-200 focus-within:ring-2 focus-within:ring-secondary-900/10 focus-within:border-secondary-900 focus-within:bg-white",
              error &&
                "bg-white border-error-500 focus-within:ring-2 focus-within:ring-error-500/20 focus-within:border-error-500",
              isDate && "cursor-pointer",
              containerClassName
            )}
            onClick={isDate ? () => setCalendarOpen(true) : undefined}
          >
            {resolvedLeftIcon && (
              <div
                className={cn(
                  "flex items-center justify-center pl-4",
                  error ? "text-error-500" : "text-secondary-500"
                )}
              >
                {resolvedLeftIcon}
              </div>
            )}

            <input
              id={id}
              ref={ref}
              type={currentType}
              onChange={handleInputChange}
              value={displayValue}
              readOnly={isDate}
              placeholder={placeholder}
              className={cn(
                "flex-1 bg-transparent outline-none text-secondary-900 placeholder:text-secondary-400",
                paddingClass,
                isDate && "cursor-pointer select-none",
                className
              )}
              {...props}
            />

            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "flex items-center justify-center pr-4 transition-colors focus:outline-none",
                  error
                    ? "text-error-400 hover:text-error-600"
                    : "text-secondary-400 hover:text-secondary-700"
                )}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            ) : !isDate && rightIcon ? (
              <div
                className={cn(
                  "flex items-center justify-center pr-4 pointer-events-none",
                  error ? "text-error-400" : "text-secondary-400"
                )}
              >
                {rightIcon}
              </div>
            ) : null}
          </div>

          {/* Calendar popover for date format */}
          {isDate && calendarOpen && (
            <div
              ref={calendarPopoverRef}
              className="absolute top-full left-0 mt-2 z-50 bg-bg-card rounded-xl shadow-2xl border border-border-subtle p-3 animate-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <DayPicker
                mode="single"
                selected={getSelectedDate()}
                onSelect={(date) => {
                  emitDateChange(date);
                  setCalendarOpen(false);
                }}
                classNames={{
                  root: "rdp-lingkar",
                  months: "flex gap-4",
                  month_caption:
                    "flex items-center justify-center h-10 font-bold text-sm text-text-main",
                  nav: "flex items-center justify-between absolute top-3 left-3 right-3",
                  button_previous:
                    "p-1.5 rounded-lg text-neutral-400 hover:text-text-main hover:bg-neutral-100 transition-colors cursor-pointer",
                  button_next:
                    "p-1.5 rounded-lg text-neutral-400 hover:text-text-main hover:bg-neutral-100 transition-colors cursor-pointer",
                  weekdays: "flex",
                  weekday:
                    "w-9 h-9 flex items-center justify-center text-[11px] font-bold text-neutral-400 uppercase",
                  week: "flex",
                  day: "w-9 h-9 flex items-center justify-center text-[13px] font-medium text-secondary-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer",
                  selected:
                    "!bg-primary-500 !text-white !font-bold hover:!bg-primary-600",
                  today: "font-bold text-primary-500",
                  outside: "text-neutral-300",
                  disabled: "text-neutral-200 pointer-events-none",
                }}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs font-medium text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
