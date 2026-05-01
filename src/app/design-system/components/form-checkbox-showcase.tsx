"use client";

import { useState } from "react";
import {
  FormCheckbox,
  FormCheckboxGroup,
} from "@app/components/ui/FormCheckbox";

export function FormCheckboxShowcase() {
  // Single checkbox states
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);

  // Group states
  const [selectedFruits, setSelectedFruits] = useState<string[]>(["apple"]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "general",
    "daily",
  ]);
  const [verticalValues, setVerticalValues] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      {/* Single Checkbox */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-secondary-800 mb-1">
            FormCheckbox (Single)
          </h3>
          <p className="text-sm text-secondary-500">
            Individual checkbox with label. Use for boolean toggles like
            active/inactive status.
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="space-y-3">
            <p className="text-xs text-secondary-400 uppercase font-medium tracking-wide">
              Default
            </p>
            <FormCheckbox
              id="demo-unchecked"
              label="Accept terms"
              checked={checked1}
              onChange={setChecked1}
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs text-secondary-400 uppercase font-medium tracking-wide">
              Checked
            </p>
            <FormCheckbox
              id="demo-checked"
              label="Active"
              checked={checked2}
              onChange={setChecked2}
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs text-secondary-400 uppercase font-medium tracking-wide">
              Disabled
            </p>
            <FormCheckbox
              id="demo-disabled"
              label="Disabled option"
              checked={false}
              onChange={() => {}}
              disabled
            />
          </div>

          <div className="space-y-3">
            <p className="text-xs text-secondary-400 uppercase font-medium tracking-wide">
              Disabled + Checked
            </p>
            <FormCheckbox
              id="demo-disabled-checked"
              label="Locked option"
              checked={true}
              onChange={() => {}}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Checkbox Group — Horizontal */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-secondary-800 mb-1">
            FormCheckboxGroup (Horizontal)
          </h3>
          <p className="text-sm text-secondary-500">
            Multi-select checkbox group with label and error support. Best for
            small, fixed option sets (≤6 options).
          </p>
        </div>

        <div className="space-y-6">
          <FormCheckboxGroup
            label="Category Types"
            options={[
              { label: "General", value: "general" },
              { label: "Daily", value: "daily" },
              { label: "Monthly", value: "monthly" },
              { label: "Popular", value: "popular" },
            ]}
            value={selectedTypes}
            onChange={setSelectedTypes}
          />

          <FormCheckboxGroup
            label="Favorite Fruits"
            options={[
              { label: "Apple", value: "apple" },
              { label: "Banana", value: "banana" },
              { label: "Cherry", value: "cherry" },
            ]}
            value={selectedFruits}
            onChange={setSelectedFruits}
          />

          <FormCheckboxGroup
            label="With Error"
            options={[
              { label: "Option A", value: "a" },
              { label: "Option B", value: "b" },
            ]}
            value={[]}
            onChange={() => {}}
            error="Please select at least one option"
          />
        </div>
      </div>

      {/* Checkbox Group — Vertical */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-secondary-800 mb-1">
            FormCheckboxGroup (Vertical)
          </h3>
          <p className="text-sm text-secondary-500">
            Vertical layout for longer labels or when horizontal space is
            limited.
          </p>
        </div>

        <div className="max-w-sm">
          <FormCheckboxGroup
            label="Permissions"
            direction="vertical"
            options={[
              { label: "View dashboard", value: "view" },
              { label: "Edit members", value: "edit" },
              { label: "Delete records", value: "delete" },
              { label: "Manage settings", value: "settings" },
            ]}
            value={verticalValues}
            onChange={setVerticalValues}
          />
        </div>
      </div>
    </div>
  );
}
