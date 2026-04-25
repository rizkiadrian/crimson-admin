"use client";

import React, { useState } from "react";
import { Text } from "@app/components/ui/Text";
import { SearchInput } from "@app/components/ui/SearchInput";

export function SearchInputShowcase() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("pre-filled");
  const [lastSearch, setLastSearch] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Default */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Default (Debounced)
          </Text>
        </div>

        <div className="w-full max-w-xs mt-6 space-y-3">
          <SearchInput
            value={value1}
            onSearch={(q) => {
              setValue1(q);
              setLastSearch(q);
            }}
            placeholder="Search members..."
          />
          <p className="text-xs text-text-muted text-center">
            Last search: &quot;{lastSearch}&quot;
          </p>
        </div>
      </div>

      {/* Pre-filled with clear */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Pre-filled + Clear
          </Text>
        </div>

        <div className="w-full max-w-xs mt-6 space-y-3">
          <SearchInput
            value={value2}
            onSearch={setValue2}
            placeholder="Type to search..."
          />
          <p className="text-xs text-text-muted text-center">
            Click X to clear. Value: &quot;{value2}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
