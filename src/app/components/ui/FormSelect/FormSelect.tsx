"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";
import { cn } from "@lib/utils";

export interface FormSelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps {
  /** Label text displayed above the select. */
  label: string;
  /** HTML id attribute, also used for the label's `htmlFor`. */
  id: string;
  /** Currently selected value. */
  value: string;
  /**
   * Callback fired when the selected value changes.
   * Emits a synthetic event compatible with `React.ChangeEvent<HTMLSelectElement>`.
   */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Options to render inside the dropdown. */
  options: FormSelectOption[];
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Error message. When present, triggers error border and shows the message below. */
  error?: string;
  /** Size variant. "sm" reduces padding for compact layouts. */
  inputSize?: "default" | "sm";
  /** Additional className applied to the trigger button. */
  className?: string;
  /** Additional className applied to the outer wrapper div. */
  containerClassName?: string;
  /** Whether the select is disabled. */
  disabled?: boolean;
  /** Optional icon rendered inside the trigger (left). */
  leftIcon?: React.ReactNode;
  /** Callback fired when the user types in the search box. If provided, enables the search input. */
  onSearch?: (query: string) => void;
  /** If true, shows a loading spinner inside the dropdown. */
  isLoading?: boolean;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
}

/**
 * Custom dropdown select styled consistently with `FormInput`.
 *
 * - Click the trigger to open/close the option list.
 * - Click outside or press Escape to close.
 * - The `ChevronDown` icon rotates 180° when open.
 * - Selected option is highlighted with a checkmark and primary color.
 * - Emits a synthetic `ChangeEvent<HTMLSelectElement>` via `onChange` for
 *   full drop-in compatibility with existing form handlers.
 *
 * @example
 * <FormSelect
 *   id="priority"
 *   label="Priority"
 *   value={formData.priority}
 *   onChange={handleChange}
 *   options={PRIORITY_OPTIONS}
 *   placeholder="Select priority"
 *   error={formErrors.priority}
 * />
 */
export const FormSelect = React.forwardRef<HTMLDivElement, FormSelectProps>(
  (
    {
      label,
      id,
      value,
      onChange,
      options,
      placeholder,
      error,
      inputSize = "default",
      className,
      containerClassName,
      disabled = false,
      leftIcon,
      onSearch,
      isLoading = false,
      searchPlaceholder = "Search...",
    },
    ref
  ) => {
    const [open, setOpenRaw] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Wrap setOpen so closing always resets the search state
    const setOpen = useCallback(
      (next: boolean | ((prev: boolean) => boolean)) => {
        setOpenRaw((prev) => {
          const nextVal = typeof next === "function" ? next(prev) : next;
          if (!nextVal && prev) {
            // Closing — reset search (deferred to avoid setState-during-render)
            queueMicrotask(() => {
              setSearchQuery("");
              if (onSearch) onSearch("");
            });
          }
          return nextVal;
        });
      },
      [onSearch]
    );

    const selectedOption = options.find((o) => o.value === value);
    const paddingClass =
      inputSize === "sm" ? "py-2.5 px-3 text-[13px]" : "py-3.5 px-4 text-base";

    // ─── Close on outside click (same pattern as FormInput calendar) ──────────
    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      };
      document.addEventListener("mouseup", handleClickOutside);
      return () => document.removeEventListener("mouseup", handleClickOutside);
    }, [open, setOpen]);

    // ─── Close on Escape ──────────────────────────────────────────────────────
    useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, setOpen]);

    // ─── Emit synthetic ChangeEvent<HTMLSelectElement> ────────────────────────
    const handleSelect = useCallback(
      (optionValue: string) => {
        setOpen(false);
        if (optionValue === value) return;
        const syntheticEvent = {
          target: { id, name: id, value: optionValue },
          currentTarget: { id, name: id, value: optionValue },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      },
      [onChange, setOpen, id, value]
    );

    return (
      <div className={cn("w-full", containerClassName)} ref={wrapperRef}>
        {/* Label */}
        <label
          htmlFor={id}
          className="block text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide select-none"
        >
          {label}
        </label>

        {/* Trigger */}
        <div className="relative" ref={ref}>
          <button
            id={id}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby={`${id}-label`}
            className={cn(
              "w-full flex items-center justify-between overflow-hidden transition-colors border rounded-xl text-left cursor-pointer",
              paddingClass,
              // Normal state
              !error &&
                !open &&
                "bg-neutral-50 border-neutral-200 hover:border-neutral-300",
              // Open state
              !error &&
                open &&
                "bg-white border-secondary-900 ring-2 ring-secondary-900/10",
              // Error state
              error && "bg-white border-error-500 ring-2 ring-error-500/20",
              // Disabled state
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            <div className="flex items-center flex-1 min-w-0">
              {leftIcon && (
                <div
                  className={cn(
                    "flex items-center justify-center mr-3",
                    error ? "text-error-400" : "text-secondary-500"
                  )}
                >
                  {leftIcon}
                </div>
              )}
              <span
                className={cn(
                  "truncate block",
                  selectedOption ? "text-secondary-900" : "text-secondary-400"
                )}
              >
                {selectedOption
                  ? selectedOption.label
                  : (placeholder ?? "Select…")}
              </span>
            </div>

            <ChevronDown
              size={16}
              className={cn(
                "ml-2 shrink-0 transition-transform duration-200",
                error ? "text-error-400" : "text-secondary-400",
                open && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown panel — same styling as FormInput calendar popover */}
          {open && (
            <div
              role="listbox"
              aria-labelledby={`${id}-label`}
              className="absolute top-full left-0 right-0 mt-2 z-50 bg-bg-card rounded-xl shadow-2xl border border-border-subtle overflow-hidden animate-dropdown flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {onSearch && (
                <div className="p-2 border-b border-border-subtle shrink-0">
                  <div className="relative flex items-center">
                    <Search
                      size={14}
                      className="absolute left-3 text-secondary-400"
                    />
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-2 text-[13px] bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        onSearch(e.target.value);
                      }}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <ul className="py-1 max-h-60 overflow-y-auto min-h-[40px]">
                {isLoading ? (
                  <li className="flex items-center justify-center py-4 text-secondary-400">
                    <Loader2 size={18} className="animate-spin" />
                  </li>
                ) : options.length === 0 ? (
                  <li className="px-4 py-3 text-[13px] text-center text-secondary-500 italic">
                    No results found
                  </li>
                ) : (
                  <>
                    {placeholder && !onSearch && (
                      <li
                        role="option"
                        aria-selected={value === ""}
                        className="px-4 py-2.5 text-[13px] text-secondary-400 cursor-default select-none italic"
                      >
                        {placeholder}
                      </li>
                    )}
                    {options.map((opt) => {
                      const isSelected = opt.value === value;
                      return (
                        <li
                          key={opt.value}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(opt.value)}
                          className={cn(
                            "flex items-center justify-between px-4 py-2.5 text-[14px] font-medium cursor-pointer select-none transition-colors",
                            isSelected
                              ? "bg-primary-50 text-primary-600"
                              : "text-secondary-700 hover:bg-neutral-50 hover:text-secondary-900"
                          )}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <Check
                              size={14}
                              className="shrink-0 text-primary-500"
                              strokeWidth={2.5}
                            />
                          )}
                        </li>
                      );
                    })}
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
