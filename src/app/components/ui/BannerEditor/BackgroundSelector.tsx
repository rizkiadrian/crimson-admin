"use client";

import { useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@lib/utils";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import type {
  IBackgroundConfig,
  BackgroundType,
  GradientDirection,
} from "@services/marketing/banners/banners.types";

/** Solid color presets */
const SOLID_PRESETS: string[] = [
  "#1E3A5F",
  "#FF5733",
  "#2ECC71",
  "#8E44AD",
  "#F39C12",
  "#E74C3C",
  "#3498DB",
  "#1ABC9C",
];

/** Gradient presets: [color1, color2, direction] */
const GRADIENT_PRESETS: {
  colors: [string, string];
  direction: GradientDirection;
}[] = [
  { colors: ["#667EEA", "#764BA2"], direction: "to-right" },
  { colors: ["#F093FB", "#F5576C"], direction: "to-right" },
  { colors: ["#4FACFE", "#00F2FE"], direction: "to-right" },
  { colors: ["#43E97B", "#38F9D7"], direction: "to-right" },
  { colors: ["#FA709A", "#FEE140"], direction: "to-bottom-right" },
  { colors: ["#A18CD1", "#FBC2EB"], direction: "to-bottom" },
  { colors: ["#FF9A9E", "#FECFEF"], direction: "to-bottom" },
  { colors: ["#F6D365", "#FDA085"], direction: "to-right" },
];

const DIRECTION_OPTIONS = [
  { label: "To Right →", value: "to-right" },
  { label: "To Bottom ↓", value: "to-bottom" },
  { label: "To Bottom Right ↘", value: "to-bottom-right" },
];

interface BackgroundSelectorProps {
  backgroundConfig: IBackgroundConfig;
  onChange: (config: IBackgroundConfig) => void;
}

/**
 * Renders a CSS background string for a preset swatch.
 */
function getSwatchStyle(
  type: "solid" | "gradient",
  colors: string[],
  direction?: string
): React.CSSProperties {
  if (type === "solid") {
    return { backgroundColor: colors[0] };
  }
  const dir =
    direction === "to-bottom"
      ? "to bottom"
      : direction === "to-bottom-right"
        ? "to bottom right"
        : "to right";
  return { background: `linear-gradient(${dir}, ${colors.join(", ")})` };
}

/**
 * Background selector for text placement banners.
 * Provides preset solid/gradient options, custom color input,
 * gradient direction selector, and toggle between solid/gradient modes.
 */
export default function BackgroundSelector({
  backgroundConfig,
  onChange,
}: BackgroundSelectorProps) {
  const isSolid = backgroundConfig.type === "solid";

  const handleModeToggle = useCallback(
    (mode: BackgroundType) => {
      if (mode === "solid") {
        onChange({
          type: "solid",
          colors: [backgroundConfig.colors[0] || "#1E3A5F"],
        });
      } else {
        onChange({
          type: "gradient",
          colors:
            backgroundConfig.colors.length >= 2
              ? backgroundConfig.colors
              : [backgroundConfig.colors[0] || "#667EEA", "#764BA2"],
          direction: backgroundConfig.direction || "to-right",
        });
      }
    },
    [backgroundConfig, onChange]
  );

  const handleSolidPresetSelect = useCallback(
    (color: string) => {
      onChange({ type: "solid", colors: [color] });
    },
    [onChange]
  );

  const handleGradientPresetSelect = useCallback(
    (preset: (typeof GRADIENT_PRESETS)[number]) => {
      onChange({
        type: "gradient",
        colors: [...preset.colors],
        direction: preset.direction,
      });
    },
    [onChange]
  );

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (isSolid) {
        onChange({ ...backgroundConfig, colors: [value] });
      } else {
        const newColors = [...backgroundConfig.colors];
        newColors[0] = value;
        onChange({ ...backgroundConfig, colors: newColors });
      }
    },
    [backgroundConfig, isSolid, onChange]
  );

  const handleSecondColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      const newColors = [...backgroundConfig.colors];
      newColors[1] = value;
      onChange({ ...backgroundConfig, colors: newColors });
    },
    [backgroundConfig, onChange]
  );

  const handleDirectionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({
        ...backgroundConfig,
        direction: e.target.value as GradientDirection,
      });
    },
    [backgroundConfig, onChange]
  );

  /**
   * Check if a solid preset is currently selected.
   */
  const isSolidPresetSelected = (color: string) =>
    isSolid &&
    backgroundConfig.colors[0]?.toLowerCase() === color.toLowerCase();

  /**
   * Check if a gradient preset is currently selected.
   */
  const isGradientPresetSelected = (
    preset: (typeof GRADIENT_PRESETS)[number]
  ) =>
    !isSolid &&
    backgroundConfig.colors[0]?.toLowerCase() ===
      preset.colors[0].toLowerCase() &&
    backgroundConfig.colors[1]?.toLowerCase() ===
      preset.colors[1].toLowerCase() &&
    backgroundConfig.direction === preset.direction;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-secondary-800">Background</h3>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={isSolid ? "primary" : "outlined"}
          size="sm"
          onClick={() => handleModeToggle("solid")}
        >
          Solid
        </Button>
        <Button
          type="button"
          variant={!isSolid ? "primary" : "outlined"}
          size="sm"
          onClick={() => handleModeToggle("gradient")}
        >
          Gradient
        </Button>
      </div>

      {/* Preset grid */}
      {isSolid ? (
        <div>
          <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
            Solid Presets
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SOLID_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Select solid color ${color}`}
                className={cn(
                  "w-full aspect-video rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center",
                  isSolidPresetSelected(color)
                    ? "border-primary-500 ring-2 ring-primary-500/30"
                    : "border-border-subtle hover:border-neutral-400"
                )}
                style={getSwatchStyle("solid", [color])}
                onClick={() => handleSolidPresetSelect(color)}
              >
                {isSolidPresetSelected(color) && (
                  <Check size={16} className="text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide">
            Gradient Presets
          </p>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Select gradient ${preset.colors[0]} to ${preset.colors[1]}`}
                className={cn(
                  "w-full aspect-video rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center",
                  isGradientPresetSelected(preset)
                    ? "border-primary-500 ring-2 ring-primary-500/30"
                    : "border-border-subtle hover:border-neutral-400"
                )}
                style={getSwatchStyle(
                  "gradient",
                  preset.colors,
                  preset.direction
                )}
                onClick={() => handleGradientPresetSelect(preset)}
              >
                {isGradientPresetSelected(preset) && (
                  <Check size={16} className="text-white drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom color inputs */}
      <div className={cn(!isSolid && "grid grid-cols-2 gap-3")}>
        <FormInput
          id="bg-color-1"
          label={isSolid ? "Custom Color" : "Color 1"}
          value={backgroundConfig.colors[0] || ""}
          onChange={handleCustomColorChange}
          placeholder="#FF5733"
        />
        {!isSolid && (
          <FormInput
            id="bg-color-2"
            label="Color 2"
            value={backgroundConfig.colors[1] || ""}
            onChange={handleSecondColorChange}
            placeholder="#33FF57"
          />
        )}
      </div>

      {/* Gradient direction */}
      {!isSolid && (
        <FormSelect
          id="bg-direction"
          label="Gradient Direction"
          value={backgroundConfig.direction || "to-right"}
          onChange={handleDirectionChange}
          options={DIRECTION_OPTIONS}
        />
      )}
    </div>
  );
}
