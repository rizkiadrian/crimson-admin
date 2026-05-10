"use client";

import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import PopupColorPicker from "./PopupColorPicker";
import PopupImageInput from "./PopupImageInput";
import type { PopupElement } from "./PopupCanvasEditor";

interface PopupElementPanelProps {
  element: PopupElement | null;
  onChange: (element: PopupElement) => void;
  onDelete?: () => void;
}

const FONT_WEIGHT_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "bold" },
];

const SHAPE_OPTIONS = [
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
];

export default function PopupElementPanel({
  element,
  onChange,
  onDelete,
}: PopupElementPanelProps) {
  if (!element) {
    return (
      <div className="p-4 text-center text-sm text-neutral-400">
        Select an element to edit its properties
      </div>
    );
  }

  const update = (field: string, value: unknown) =>
    onChange({ ...element, [field]: value });

  return (
    <div className="space-y-4 p-4 border border-neutral-100 rounded-xl bg-neutral-50/50">
      <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
        {element.type.replace("_", " ")} Properties
      </h4>

      {/* Position & Size */}
      <div className="space-y-2 pt-2 border-t border-neutral-200">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Position & Size
        </p>
        <div className="grid grid-cols-2 gap-2">
          <FormInput
            id="el-x"
            label="X"
            type="number"
            value={String(Math.round(element.x))}
            onChange={(e) => update("x", Number(e.target.value))}
          />
          <FormInput
            id="el-y"
            label="Y"
            type="number"
            value={String(Math.round(element.y))}
            onChange={(e) => update("y", Number(e.target.value))}
          />
          <FormInput
            id="el-w"
            label="Width"
            type="number"
            value={String(Math.round(element.width))}
            onChange={(e) => update("width", Number(e.target.value))}
          />
          <FormInput
            id="el-h"
            label="Height"
            type="number"
            value={String(Math.round(element.height))}
            onChange={(e) => update("height", Number(e.target.value))}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-2 pt-2 border-t border-neutral-200">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Appearance
        </p>
        <FormInput
          id="el-opacity"
          label="Opacity (%)"
          type="number"
          value={String(element.opacity)}
          onChange={(e) =>
            update(
              "opacity",
              Math.min(100, Math.max(0, Number(e.target.value)))
            )
          }
        />
      </div>

      {/* Text-specific */}
      {(element.type === "text" || element.type === "cta_button") && (
        <div className="space-y-2 pt-2 border-t border-neutral-200">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Typography
          </p>
          <FormInput
            id="el-content"
            label="Content"
            value={element.content || ""}
            onChange={(e) => update("content", e.target.value)}
          />
          <FormInput
            id="el-font-size"
            label="Font Size"
            type="number"
            value={String(element.font_size || 16)}
            onChange={(e) => update("font_size", Number(e.target.value))}
          />
          <PopupColorPicker
            label="Font Color"
            value={element.font_color || element.text_color || "#000000"}
            onChange={(c) =>
              update(
                element.type === "cta_button" ? "text_color" : "font_color",
                c
              )
            }
          />
          <FormSelect
            id="el-font-weight"
            label="Font Weight"
            value={element.font_weight || "normal"}
            onChange={(e) => update("font_weight", e.target.value)}
            options={FONT_WEIGHT_OPTIONS}
          />
        </div>
      )}

      {/* CTA-specific */}
      {element.type === "cta_button" && (
        <div className="space-y-2 pt-2 border-t border-neutral-200">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Button Style
          </p>
          <PopupColorPicker
            label="Button Color"
            value={element.bg_color || "#d32f2f"}
            onChange={(c) => update("bg_color", c)}
          />
          <FormInput
            id="el-radius"
            label="Border Radius"
            type="number"
            value={String(element.border_radius || 8)}
            onChange={(e) => update("border_radius", Number(e.target.value))}
          />
          <FormInput
            id="el-action"
            label="Action (deeplink)"
            value={element.action || ""}
            onChange={(e) => update("action", e.target.value)}
            placeholder="lingkar://..."
          />
        </div>
      )}

      {/* Shape-specific */}
      {element.type === "shape" && (
        <div className="space-y-2 pt-2 border-t border-neutral-200">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Shape
          </p>
          <FormSelect
            id="el-shape"
            label="Shape"
            value={element.shape_type || "rectangle"}
            onChange={(e) => update("shape_type", e.target.value)}
            options={SHAPE_OPTIONS}
          />
          <PopupColorPicker
            label="Fill Color"
            value={element.fill_color || "#E0E0E0"}
            onChange={(c) => update("fill_color", c)}
            showOpacity
          />
        </div>
      )}

      {/* Image-specific */}
      {element.type === "image" && (
        <div className="space-y-2 pt-2 border-t border-neutral-200">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Image
          </p>
          <PopupImageInput
            label="Image URL"
            value={element.image_url || ""}
            onChange={(url) => update("image_url", url)}
          />
        </div>
      )}

      {/* Delete */}
      {onDelete && (
        <div className="pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={onDelete}
            className="w-full px-4 py-2 text-sm font-medium text-error-600 border border-error-200 rounded-xl hover:bg-error-50 transition-colors"
          >
            Delete Element
          </button>
        </div>
      )}
    </div>
  );
}
