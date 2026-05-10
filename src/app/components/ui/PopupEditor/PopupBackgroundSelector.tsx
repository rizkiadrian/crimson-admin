"use client";

import { FormSelect } from "@app/components/ui/FormSelect";
import PopupColorPicker from "./PopupColorPicker";
import PopupGradientEditor, {
  type GradientConfig,
} from "./PopupGradientEditor";

export type BackgroundMode = "solid" | "gradient" | "image" | "pattern";

export interface PopupBackgroundConfig {
  mode: BackgroundMode;
  color?: string;
  gradient?: GradientConfig;
  image_url?: string;
  pattern?: string;
  pattern_color?: string;
}

interface PopupBackgroundSelectorProps {
  value: PopupBackgroundConfig;
  onChange: (config: PopupBackgroundConfig) => void;
}

const MODE_OPTIONS = [
  { label: "Solid Color", value: "solid" },
  { label: "Gradient", value: "gradient" },
  { label: "Image", value: "image" },
  { label: "Pattern", value: "pattern" },
];

const PATTERN_OPTIONS = [
  { label: "Dots", value: "dots" },
  { label: "Lines", value: "lines" },
  { label: "Geometric", value: "geometric" },
  { label: "Waves", value: "waves" },
];

export default function PopupBackgroundSelector({
  value,
  onChange,
}: PopupBackgroundSelectorProps) {
  return (
    <div className="space-y-4">
      <FormSelect
        id="bg-mode"
        label="Background Type"
        value={value.mode}
        onChange={(e) => {
          const mode = e.target.value as BackgroundMode;
          const update: PopupBackgroundConfig = { ...value, mode };
          if (mode === "pattern" && !value.pattern) update.pattern = "dots";
          onChange(update);
        }}
        options={MODE_OPTIONS}
      />

      {value.mode === "solid" && (
        <PopupColorPicker
          label="Background Color"
          value={value.color || "#FFFFFF"}
          onChange={(color) => onChange({ ...value, color })}
          showOpacity
        />
      )}

      {value.mode === "gradient" && (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
              Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  label: "Crimson",
                  stops: [
                    { color: "#d32f2f", position: 0 },
                    { color: "#7f1c1c", position: 100 },
                  ],
                },
                {
                  label: "Crimson Soft",
                  stops: [
                    { color: "#e46767", position: 0 },
                    { color: "#d32f2f", position: 100 },
                  ],
                },
                {
                  label: "Dark",
                  stops: [
                    { color: "#222222", position: 0 },
                    { color: "#4f4f4f", position: 100 },
                  ],
                },
                {
                  label: "Emerald",
                  stops: [
                    { color: "#10b981", position: 0 },
                    { color: "#059669", position: 100 },
                  ],
                },
                {
                  label: "Sunset",
                  stops: [
                    { color: "#d32f2f", position: 0 },
                    { color: "#f59e0b", position: 100 },
                  ],
                },
                {
                  label: "Warm",
                  stops: [
                    { color: "#fbbf24", position: 0 },
                    { color: "#e46767", position: 100 },
                  ],
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="w-10 h-6 rounded border border-neutral-200 cursor-pointer transition-transform hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${preset.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`,
                  }}
                  onClick={() =>
                    onChange({
                      ...value,
                      gradient: {
                        stops: preset.stops,
                        type: "linear",
                        angle: 135,
                      },
                    })
                  }
                  title={preset.label}
                />
              ))}
            </div>
          </div>
          <PopupGradientEditor
            value={
              value.gradient || {
                stops: [
                  { color: "#d32f2f", position: 0 },
                  { color: "#7f1c1c", position: 100 },
                ],
                type: "linear",
                angle: 180,
              }
            }
            onChange={(gradient) => onChange({ ...value, gradient })}
          />
        </>
      )}

      {value.mode === "image" && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            Background Image URL
          </label>
          <input
            type="url"
            value={value.image_url || ""}
            onChange={(e) => onChange({ ...value, image_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
          />
        </div>
      )}

      {value.mode === "pattern" && (
        <div className="space-y-3">
          <FormSelect
            id="bg-pattern"
            label="Pattern"
            value={value.pattern || "dots"}
            onChange={(e) => onChange({ ...value, pattern: e.target.value })}
            options={PATTERN_OPTIONS}
          />
          <PopupColorPicker
            label="Pattern Color"
            value={value.pattern_color || "#000000"}
            onChange={(pattern_color) => onChange({ ...value, pattern_color })}
          />
        </div>
      )}
    </div>
  );
}
