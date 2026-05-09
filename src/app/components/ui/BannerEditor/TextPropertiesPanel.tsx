"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Button } from "@app/components/ui/Button";
import type {
  ITextElement,
  FontWeight,
} from "@services/marketing/banners/banners.types";

const FONT_WEIGHT_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Bold", value: "bold" },
  { label: "Semibold", value: "semibold" },
];

interface TextPropertiesPanelProps {
  selectedElement: ITextElement | null;
  onUpdate: (element: ITextElement) => void;
  onRemove: (id: string) => void;
}

/**
 * Properties panel for editing a selected text element on the canvas.
 * Displays fields for content, font size, font color, and font weight.
 * Only renders when an element is selected.
 */
export default function TextPropertiesPanel({
  selectedElement,
  onUpdate,
  onRemove,
}: TextPropertiesPanelProps) {
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      if (!selectedElement) return;

      const { id: fieldId, value } = e.target;

      const updated: ITextElement = { ...selectedElement };

      switch (fieldId) {
        case "text-content":
          updated.content = value;
          break;
        case "text-font-size":
          updated.font_size = Math.min(72, Math.max(12, Number(value) || 12));
          break;
        case "text-font-color":
          updated.font_color = value;
          break;
        case "text-font-weight":
          updated.font_weight = value as FontWeight;
          break;
      }

      onUpdate(updated);
    },
    [selectedElement, onUpdate]
  );

  if (!selectedElement) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-secondary-800">
          Text Properties
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove text element"
          onClick={() => onRemove(selectedElement.id)}
          className="text-error-500 hover:text-error-600 hover:bg-error-50"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <FormInput
        id="text-content"
        label="Content"
        value={selectedElement.content}
        onChange={handleChange}
        placeholder="Enter text content"
      />

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          id="text-font-size"
          label="Font Size"
          type="number"
          value={String(selectedElement.font_size)}
          onChange={handleChange}
          min={12}
          max={72}
          placeholder="12-72"
        />

        <FormInput
          id="text-font-color"
          label="Font Color"
          value={selectedElement.font_color}
          onChange={handleChange}
          placeholder="#FFFFFF"
        />
      </div>

      <FormSelect
        id="text-font-weight"
        label="Font Weight"
        value={selectedElement.font_weight}
        onChange={handleChange}
        options={FONT_WEIGHT_OPTIONS}
      />
    </div>
  );
}
