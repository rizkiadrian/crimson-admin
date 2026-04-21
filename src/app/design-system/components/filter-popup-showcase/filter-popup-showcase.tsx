"use client";

import React, { useState } from "react";
import { Text } from "@app/components/ui/Text";
import { Button } from "@app/components/ui/Button";
import {
  FilterPopup,
  FilterSection,
  FilterChipGroup,
  FilterRangeSlider,
  FilterDateRange,
} from "@app/components/ui/FilterPopup";
import { ListFilter } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Inactive", value: "inactive" },
  { label: "High Risk", value: "high-risk" },
];

const DEFAULT_FILTERS = {
  statuses: [] as string[],
  spendRange: [10000, 250000] as [number, number],
  dateFrom: "",
  dateTo: "",
};

export function FilterPopupShowcase() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Trigger card */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-400 uppercase tracking-wider"
          >
            Filter Popup
          </Text>
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-sm text-text-muted text-center max-w-xs">
            Click the button below to open the filter popup with chips, range
            slider, and date range.
          </p>
          <Button
            variant="outlined"
            className="gap-2"
            onClick={() => setFilterOpen(true)}
          >
            <ListFilter size={16} />
            Open Filter
          </Button>
        </div>
      </div>

      {/* Chip group standalone */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-400 uppercase tracking-wider"
          >
            Chip Group (Standalone)
          </Text>
        </div>

        <div className="w-full max-w-md">
          <FilterChipGroup
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onChange={(statuses) =>
              setFilters((prev) => ({ ...prev, statuses }))
            }
          />
        </div>
      </div>

      {/* Range slider standalone */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-400 uppercase tracking-wider"
          >
            Range Slider (Standalone)
          </Text>
        </div>

        <div className="w-full max-w-md">
          <FilterRangeSlider
            min={0}
            max={500000}
            step={10000}
            value={filters.spendRange}
            onChange={(spendRange) =>
              setFilters((prev) => ({ ...prev, spendRange }))
            }
            formatLabel={(v) => `$${(v / 1000).toFixed(0)}k`}
            formatRange={(low, high) =>
              `$${(low / 1000).toFixed(0)}k - $${(high / 1000).toFixed(0)}k+`
            }
          />
        </div>
      </div>

      {/* Date range standalone */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-400 uppercase tracking-wider"
          >
            Date Range (Standalone)
          </Text>
        </div>

        <div className="w-full max-w-md">
          <FilterDateRange
            startDate={filters.dateFrom}
            endDate={filters.dateTo}
            onStartDateChange={(dateFrom) =>
              setFilters((prev) => ({ ...prev, dateFrom }))
            }
            onEndDateChange={(dateTo) =>
              setFilters((prev) => ({ ...prev, dateTo }))
            }
          />
        </div>
      </div>

      {/* The actual popup */}
      <FilterPopup
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Portfolio"
        onApply={() => setFilterOpen(false)}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      >
        <FilterSection label="Relationship Status">
          <FilterChipGroup
            options={STATUS_OPTIONS}
            selected={filters.statuses}
            onChange={(statuses) =>
              setFilters((prev) => ({ ...prev, statuses }))
            }
          />
        </FilterSection>

        <FilterSection
          label="Transactional Spend Range"
          labelRight={`$${(filters.spendRange[0] / 1000).toFixed(0)}k - $${(filters.spendRange[1] / 1000).toFixed(0)}k+`}
        >
          <FilterRangeSlider
            min={0}
            max={500000}
            step={10000}
            value={filters.spendRange}
            onChange={(spendRange) =>
              setFilters((prev) => ({ ...prev, spendRange }))
            }
            formatLabel={(v) =>
              v === 0 ? "$0" : `$${(v / 1000).toFixed(0)}k+`
            }
          />
        </FilterSection>

        <FilterSection label="Date Joined">
          <FilterDateRange
            startDate={filters.dateFrom}
            endDate={filters.dateTo}
            onStartDateChange={(dateFrom) =>
              setFilters((prev) => ({ ...prev, dateFrom }))
            }
            onEndDateChange={(dateTo) =>
              setFilters((prev) => ({ ...prev, dateTo }))
            }
            startPlaceholder="Jan 01, 2023"
            endPlaceholder="Present"
          />
        </FilterSection>
      </FilterPopup>
    </div>
  );
}
