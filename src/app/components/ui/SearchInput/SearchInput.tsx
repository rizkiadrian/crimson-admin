"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@lib/utils";

export interface SearchInputProps {
  /** Current search value (controlled). */
  value: string;
  /** Called when the user submits a search (after debounce or Enter key). */
  onSearch: (value: string) => void;
  /** Placeholder text. Defaults to "Search...". */
  placeholder?: string;
  /** Debounce delay in ms. Defaults to 400. Set to 0 to disable debounce. */
  debounceMs?: number;
  /** Additional className for the outer container. */
  className?: string;
}

/**
 * Debounced search input with clear button.
 *
 * Features:
 * - Debounced onChange (configurable delay, default 400ms)
 * - Instant search on Enter key
 * - Clear button (X) that resets and triggers search immediately
 * - Search icon on the left
 * - Consistent styling with the design system
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchQuery}
 *   onSearch={(q) => setParams({ search: q })}
 *   placeholder="Search members..."
 * />
 * ```
 */
export function SearchInput({
  value,
  onSearch,
  placeholder = "Search...",
  debounceMs = 400,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes (e.g. reset from parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const triggerSearch = useCallback(
    (val: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onSearch(val);
    },
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Debounced search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(newValue);
    }, debounceMs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerSearch(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue("");
    triggerSearch("");
    inputRef.current?.focus();
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div
      className={cn("relative flex items-center w-full max-w-xs", className)}
    >
      <Search
        size={16}
        className="absolute left-3.5 text-neutral-400 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-[13px] font-medium text-secondary-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-secondary-900/10 focus:border-secondary-900 focus:bg-white transition-colors"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-0.5 rounded-md text-neutral-400 hover:text-text-main hover:bg-neutral-200 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
