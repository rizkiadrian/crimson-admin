"use client";

import { useState, useCallback } from "react";
import { cn } from "@lib/utils";
import { FormInput } from "@app/components/ui/FormInput";

const PRESET_COLORS = [
  // Primary (Crimson)
  "#d32f2f",
  "#e46767",
  "#7f1c1c",
  // Secondary (Neutral)
  "#222222",
  "#4f4f4f",
  "#888888",
  // Success
  "#10b981",
  "#34d399",
  // Warning/Gold
  "#f59e0b",
  "#fbbf24",
  // Base
  "#FFFFFF",
  "#000000",
];

const PRESET_GRADIENTS = [
  { label: "Crimson", css: "linear-gradient(135deg, #d32f2f, #7f1c1c)" },
  { label: "Crimson Soft", css: "linear-gradient(135deg, #e46767, #d32f2f)" },
  { label: "Dark", css: "linear-gradient(135deg, #222222, #4f4f4f)" },
  { label: "Emerald", css: "linear-gradient(135deg, #10b981, #059669)" },
  { label: "Sunset", css: "linear-gradient(135deg, #d32f2f, #f59e0b)" },
  { label: "Warm", css: "linear-gradient(135deg, #fbbf24, #e46767)" },
];

interface PopupColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showOpacity?: boolean;
}

export default function PopupColorPicker({
  value,
  onChange,
  label,
  showOpacity = false,
}: PopupColorPickerProps) {
  const [opacity, setOpacity] = useState(100);

  const handleHexChange = useCallback(
    (hex: string) => {
      if (/^#[0-9A-Fa-f]{0,8}$/.test(hex) || hex === "") {
        onChange(hex);
      }
    },
    [onChange]
  );

  const applyOpacity = useCallback(
    (hex: string, op: number) => {
      if (op >= 100) return onChange(hex);
      const alpha = Math.round((op / 100) * 255)
        .toString(16)
        .padStart(2, "0");
      onChange(hex.slice(0, 7) + alpha);
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "w-6 h-6 rounded border border-neutral-200 cursor-pointer transition-transform hover:scale-110",
              value.slice(0, 7) === color &&
                "ring-2 ring-primary-500 ring-offset-1"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Select ${color}`}
          />
        ))}
      </div>

      {/* Gradient presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_GRADIENTS.map((g) => (
          <button
            key={g.label}
            type="button"
            className={cn(
              "w-10 h-6 rounded border border-neutral-200 cursor-pointer transition-transform hover:scale-110",
              value === g.css && "ring-2 ring-primary-500 ring-offset-1"
            )}
            style={{ background: g.css }}
            onClick={() => onChange(g.css)}
            title={g.label}
          />
        ))}
      </div>

      {/* Hex input */}
      <FormInput
        id={`color-${label || "picker"}`}
        label="Hex"
        value={value}
        onChange={(e) => handleHexChange(e.target.value)}
        placeholder="#FF5733"
        className="font-mono text-sm"
      />

      {/* Visual color input (native) */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.slice(0, 7) || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-neutral-200 cursor-pointer"
        />
        <span className="text-xs text-neutral-500">Visual picker</span>
      </div>

      {/* Opacity slider */}
      {showOpacity && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => {
              const op = Number(e.target.value);
              setOpacity(op);
              applyOpacity(value.slice(0, 7), op);
            }}
            className="flex-1"
          />
          <span className="text-xs text-neutral-600 w-8">{opacity}%</span>
        </div>
      )}
    </div>
  );
}
