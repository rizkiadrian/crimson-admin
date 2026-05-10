"use client";

import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Plus, Trash2 } from "lucide-react";
import PopupColorPicker from "./PopupColorPicker";

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface GradientConfig {
  stops: GradientStop[];
  type: "linear" | "radial";
  angle: number; // 0-360 for linear
}

interface PopupGradientEditorProps {
  value: GradientConfig;
  onChange: (config: GradientConfig) => void;
}

const DIRECTION_OPTIONS = [
  { label: "Linear", value: "linear" },
  { label: "Radial", value: "radial" },
];

export default function PopupGradientEditor({
  value,
  onChange,
}: PopupGradientEditorProps) {
  const updateStop = (index: number, updates: Partial<GradientStop>) => {
    const stops = [...value.stops];
    stops[index] = { ...stops[index], ...updates };
    onChange({ ...value, stops });
  };

  const addStop = () => {
    if (value.stops.length >= 4) return;
    const newStop: GradientStop = { color: "#888888", position: 50 };
    onChange({ ...value, stops: [...value.stops, newStop] });
  };

  const removeStop = (index: number) => {
    if (value.stops.length <= 2) return;
    const stops = value.stops.filter((_, i) => i !== index);
    onChange({ ...value, stops });
  };

  const gradientCSS =
    value.type === "radial"
      ? `radial-gradient(circle, ${value.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`
      : `linear-gradient(${value.angle}deg, ${value.stops.map((s) => `${s.color} ${s.position}%`).join(", ")})`;

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className="w-full h-16 rounded-lg border border-neutral-200"
        style={{ background: gradientCSS }}
      />

      {/* Type & Angle */}
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          id="gradient-type"
          label="Type"
          value={value.type}
          onChange={(e) =>
            onChange({ ...value, type: e.target.value as "linear" | "radial" })
          }
          options={DIRECTION_OPTIONS}
        />
        {value.type === "linear" && (
          <FormInput
            id="gradient-angle"
            label="Angle (°)"
            type="number"
            value={String(value.angle)}
            onChange={(e) =>
              onChange({ ...value, angle: Number(e.target.value) % 360 })
            }
          />
        )}
      </div>

      {/* Color Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            Color Stops ({value.stops.length}/4)
          </span>
          {value.stops.length < 4 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-auto w-auto p-1"
              onClick={addStop}
            >
              <Plus size={14} />
            </Button>
          )}
        </div>

        {value.stops.map((stop, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 bg-neutral-50 rounded-lg"
          >
            <div className="flex-1">
              <PopupColorPicker
                value={stop.color}
                onChange={(color) => updateStop(i, { color })}
              />
            </div>
            <div className="w-20">
              <FormInput
                id={`stop-pos-${i}`}
                label="Pos %"
                type="number"
                value={String(stop.position)}
                onChange={(e) =>
                  updateStop(i, {
                    position: Math.min(
                      100,
                      Math.max(0, Number(e.target.value))
                    ),
                  })
                }
              />
            </div>
            {value.stops.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-1 mt-5"
                onClick={() => removeStop(i)}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
