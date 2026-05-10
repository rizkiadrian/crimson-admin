"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@lib/utils";
import type { PopupBackgroundConfig } from "./PopupBackgroundSelector";

/** Canvas size presets */
const CANVAS_PRESETS = [
  { label: "Square (1:1)", ratio: 1 },
  { label: "Portrait (3:4)", ratio: 3 / 4 },
  { label: "Tall (9:16)", ratio: 9 / 16 },
  { label: "Wide (4:3)", ratio: 4 / 3 },
];

const REF_WIDTH = 320;

export type PopupElementType =
  | "text"
  | "image"
  | "cta_button"
  | "shape"
  | "close_button";

export interface PopupElement {
  id: string;
  type: PopupElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  // Text props
  content?: string;
  font_size?: number;
  font_color?: string;
  font_weight?: string;
  // CTA props
  bg_color?: string;
  text_color?: string;
  border_radius?: number;
  action?: string;
  // Shape props
  shape_type?: "rectangle" | "circle";
  fill_color?: string;
  // Image props
  image_url?: string;
}

interface PopupCanvasEditorProps {
  elements: PopupElement[];
  background: PopupBackgroundConfig;
  onElementsChange: (elements: PopupElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  aspectRatio?: number;
  onAspectRatioChange?: (ratio: number) => void;
}

function buildBackgroundCSS(bg: PopupBackgroundConfig): React.CSSProperties {
  if (bg.mode === "gradient" && bg.gradient) {
    const { stops, type, angle } = bg.gradient;
    const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    const css =
      type === "radial"
        ? `radial-gradient(circle, ${stopsStr})`
        : `linear-gradient(${angle}deg, ${stopsStr})`;
    return { background: css };
  }
  if (bg.mode === "image" && bg.image_url) {
    return {
      backgroundImage: `url(${bg.image_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (bg.mode === "pattern" && bg.pattern) {
    const color = bg.pattern_color || "#000000";
    const patterns: Record<string, { bg: string; size: string }> = {
      dots: {
        bg: `radial-gradient(${color} 1px, transparent 1px)`,
        size: "12px 12px",
      },
      lines: {
        bg: `repeating-linear-gradient(0deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 12px)`,
        size: "100% 100%",
      },
      geometric: {
        bg: `repeating-linear-gradient(45deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, ${color} 0px, ${color} 1px, transparent 1px, transparent 10px)`,
        size: "100% 100%",
      },
      waves: {
        bg: `repeating-radial-gradient(circle at 50% 50%, transparent 0px, transparent 8px, ${color}20 8px, ${color}20 9px)`,
        size: "100% 100%",
      },
    };
    const p = patterns[bg.pattern] || patterns.dots;
    return {
      backgroundImage: p.bg,
      backgroundSize: p.size,
      backgroundColor: "#FFFFFF",
    };
  }
  return { backgroundColor: bg.color || "#FFFFFF" };
}

export default function PopupCanvasEditor({
  elements,
  background,
  onElementsChange,
  selectedElementId,
  onSelectElement,
  aspectRatio: externalRatio,
  onAspectRatioChange,
}: PopupCanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [aspectRatio, setAspectRatioInternal] = useState(externalRatio || 1);

  const setAspectRatio = (ratio: number) => {
    setAspectRatioInternal(ratio);
    onAspectRatioChange?.(ratio);
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const resizeRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(e.contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        isEditable
      )
        return;
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementId &&
        !editingId
      ) {
        e.preventDefault();
        onElementsChange(elements.filter((el) => el.id !== selectedElementId));
        onSelectElement(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElementId,
    editingId,
    elements,
    onElementsChange,
    onSelectElement,
  ]);

  const canvasHeight = containerWidth / aspectRatio;
  const scale = containerWidth / REF_WIDTH;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      onSelectElement(elementId);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const el = elements.find((el) => el.id === elementId);
      if (!el) return;
      dragRef.current = {
        id: elementId,
        offsetX: e.clientX - rect.left - el.x * scale,
        offsetY: e.clientY - rect.top - el.y * scale,
      };
    },
    [elements, scale, onSelectElement]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (resizeRef.current && containerRef.current) {
        const dx = (e.clientX - resizeRef.current.startX) / scale;
        const dy = (e.clientY - resizeRef.current.startY) / scale;
        const updated = elements.map((el) =>
          el.id === resizeRef.current!.id
            ? {
                ...el,
                width: Math.max(20, resizeRef.current!.startW + dx),
                height: Math.max(20, resizeRef.current!.startH + dy),
              }
            : el
        );
        onElementsChange(updated);
        return;
      }
      if (!dragRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - dragRef.current.offsetX) / scale;
      const newY = (e.clientY - rect.top - dragRef.current.offsetY) / scale;
      const updated = elements.map((el) =>
        el.id === dragRef.current!.id
          ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
          : el
      );
      onElementsChange(updated);
    },
    [elements, scale, onElementsChange]
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    resizeRef.current = null;
  }, []);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      const el = elements.find((el) => el.id === elementId);
      if (!el) return;
      resizeRef.current = {
        id: elementId,
        startX: e.clientX,
        startY: e.clientY,
        startW: el.width,
        startH: el.height,
      };
    },
    [elements]
  );

  const renderElement = (el: PopupElement) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: el.x * scale,
      top: el.y * scale,
      width: el.width * scale,
      height: el.height * scale,
      opacity: el.opacity / 100,
      cursor: "move",
    };

    const isSelected = selectedElementId === el.id;
    const selectedClass = isSelected
      ? "ring-2 ring-primary-500 ring-offset-1"
      : "";

    switch (el.type) {
      case "text":
        return (
          <div
            key={el.id}
            style={{
              ...style,
              fontSize: (el.font_size || 16) * scale,
              color: el.font_color || "#000",
              fontWeight: el.font_weight || "normal",
            }}
            className={cn(
              "whitespace-pre-wrap",
              selectedClass,
              editingId === el.id ? "cursor-text" : "select-none"
            )}
            onMouseDown={(e) => {
              if (editingId !== el.id) handleMouseDown(e, el.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onSelectElement(el.id);
              setEditingId(el.id);
            }}
            contentEditable={editingId === el.id}
            suppressContentEditableWarning
            onBlur={(e) => {
              onElementsChange(
                elements.map((item) =>
                  item.id === el.id
                    ? { ...item, content: e.currentTarget.textContent || "" }
                    : item
                )
              );
              setEditingId(null);
            }}
          >
            {el.content || "Text"}
            {isSelected && editingId !== el.id && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500 cursor-se-resize rounded-sm"
                onMouseDown={(e) => handleResizeStart(e, el.id)}
              />
            )}
          </div>
        );
      case "cta_button":
        return (
          <div
            key={el.id}
            style={{
              ...style,
              backgroundColor: el.bg_color || "#d32f2f",
              color: el.text_color || "#FFF",
              borderRadius: (el.border_radius || 8) * scale,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: (el.font_size || 14) * scale,
              fontWeight: 600,
            }}
            className={cn(
              selectedClass,
              editingId === el.id ? "cursor-text" : "select-none"
            )}
            onMouseDown={(e) => {
              if (editingId !== el.id) handleMouseDown(e, el.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onSelectElement(el.id);
              setEditingId(el.id);
            }}
            contentEditable={editingId === el.id}
            suppressContentEditableWarning
            onBlur={(e) => {
              onElementsChange(
                elements.map((item) =>
                  item.id === el.id
                    ? { ...item, content: e.currentTarget.textContent || "" }
                    : item
                )
              );
              setEditingId(null);
            }}
          >
            {el.content || "Button"}
            {isSelected && editingId !== el.id && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500 cursor-se-resize rounded-sm"
                onMouseDown={(e) => handleResizeStart(e, el.id)}
              />
            )}
          </div>
        );
      case "shape":
        return (
          <div
            key={el.id}
            style={{
              ...style,
              backgroundColor: el.fill_color || "#E0E0E0",
              borderRadius: el.shape_type === "circle" ? "50%" : 0,
            }}
            className={cn(selectedClass)}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
          >
            {isSelected && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500 cursor-se-resize rounded-sm"
                onMouseDown={(e) => handleResizeStart(e, el.id)}
              />
            )}
          </div>
        );
      case "close_button":
        return (
          <div
            key={el.id}
            style={{
              ...style,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18 * scale,
            }}
            className={cn("select-none text-neutral-500", selectedClass)}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
          >
            ✕
          </div>
        );
      case "image":
        return (
          <div
            key={el.id}
            style={{
              ...style,
              backgroundImage: el.image_url
                ? `url(${el.image_url})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: el.image_url ? undefined : "#E5E5E5",
            }}
            className={cn("rounded", selectedClass)}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
          >
            {!el.image_url && (
              <span className="text-xs text-neutral-400 flex items-center justify-center h-full">
                Image
              </span>
            )}
            {isSelected && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500 cursor-se-resize rounded-sm"
                onMouseDown={(e) => handleResizeStart(e, el.id)}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Canvas size presets */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs font-medium text-neutral-500 self-center mr-1">
          Size:
        </span>
        {CANVAS_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={cn(
              "px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors",
              aspectRatio === preset.ratio
                ? "bg-primary-50 border-primary-500 text-primary-700"
                : "border-neutral-200 hover:bg-neutral-50"
            )}
            onClick={() => setAspectRatio(preset.ratio)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {/* Add element toolbar */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            "text",
            "cta_button",
            "image",
            "shape",
            "close_button",
          ] as PopupElementType[]
        ).map((type) => (
          <button
            key={type}
            type="button"
            className="px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors capitalize"
            onClick={() => {
              const newEl: PopupElement = {
                id: `el-${Date.now()}`,
                type,
                x: 20,
                y: 20 + elements.length * 40,
                width:
                  type === "text"
                    ? 200
                    : type === "cta_button"
                      ? 160
                      : type === "close_button"
                        ? 28
                        : 80,
                height:
                  type === "text"
                    ? 30
                    : type === "cta_button"
                      ? 40
                      : type === "close_button"
                        ? 28
                        : 80,
                opacity: 100,
                content:
                  type === "text"
                    ? "New Text"
                    : type === "cta_button"
                      ? "Click Me"
                      : undefined,
              };
              onElementsChange([...elements, newEl]);
            }}
          >
            + {type.replace("_", " ")}
          </button>
        ))}
      </div>
      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative mx-auto border border-neutral-200 rounded-xl overflow-hidden select-none"
        style={{
          ...buildBackgroundCSS(background),
          height: canvasHeight || 400,
          maxWidth: 320,
          width: "100%",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={(e) => {
          if (e.target === containerRef.current) onSelectElement(null);
        }}
      >
        {elements.map(renderElement)}
      </div>
    </div>
  );
}
