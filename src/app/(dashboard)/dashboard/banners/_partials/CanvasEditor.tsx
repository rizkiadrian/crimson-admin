"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { cn } from "@lib/utils";
import type {
  ITextElement,
  IBackgroundConfig,
  ICtaConfig,
  FontWeight,
} from "@services/backoffice/banners/banners.types";

/** Aspect ratio: 2:1 matching mobile banner card (280×140) */
const ASPECT_RATIO = 2 / 1;

/** Reference width for scaling font sizes (design is authored at 1080px) */
const REF_WIDTH = 1080;

/** Export dimensions for the rendered image */
const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = EXPORT_WIDTH / ASPECT_RATIO; // 540

/** Handle exposed by CanvasEditor via ref */
export interface CanvasEditorHandle {
  /** Capture the editor as a PNG Blob at export resolution (1080×540) */
  captureImage: () => Promise<Blob | null>;
}

interface CanvasEditorProps {
  textElements: ITextElement[];
  backgroundConfig: IBackgroundConfig;
  onTextElementsChange: (elements: ITextElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  ctaConfig?: ICtaConfig | null;
  onCtaConfigChange?: (config: ICtaConfig) => void;
}

/** Build CSS background from config */
function buildBg(config: IBackgroundConfig): React.CSSProperties {
  if (config.type === "gradient" && config.colors.length >= 2) {
    const dir =
      config.direction === "to-bottom"
        ? "to bottom"
        : config.direction === "to-bottom-right"
          ? "to bottom right"
          : "to right";
    return {
      background: `linear-gradient(${dir}, ${config.colors.join(", ")})`,
    };
  }
  return { backgroundColor: config.colors[0] || "#CCCCCC" };
}

/** Map FontWeight to CSS number */
function fw(weight: FontWeight): number {
  return weight === "bold" ? 700 : weight === "semibold" ? 600 : 400;
}

/**
 * DOM-based banner canvas editor (Canva-style).
 *
 * Uses absolutely-positioned HTML elements over a background div instead of
 * `<canvas>`. This gives us native text editing, drag-and-drop, and no
 * clipping issues.
 */
const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  function CanvasEditor(
    {
      textElements,
      backgroundConfig,
      onTextElementsChange,
      selectedElementId,
      onSelectElement,
      ctaConfig,
      onCtaConfigChange,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Track which element is being dragged (text id or "cta")
    const dragRef = useRef<{
      type: "text" | "cta";
      id: string;
      offsetX: number;
      offsetY: number;
    } | null>(null);

    // Track inline editing
    const [editingId, setEditingId] = useState<string | null>(null);

    // Keep latest props in refs for drag handlers (React 19 compliance)
    const textElementsRef = useRef(textElements);
    const onTextElementsChangeRef = useRef(onTextElementsChange);
    const ctaConfigRef = useRef(ctaConfig);
    const onCtaConfigChangeRef = useRef(onCtaConfigChange);

    useEffect(() => {
      textElementsRef.current = textElements;
      onTextElementsChangeRef.current = onTextElementsChange;
      ctaConfigRef.current = ctaConfig;
      onCtaConfigChangeRef.current = onCtaConfigChange;
    }, [textElements, onTextElementsChange, ctaConfig, onCtaConfigChange]);

    // Observe container width
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const obs = new ResizeObserver((entries) => {
        for (const e of entries) setContainerWidth(e.contentRect.width);
      });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    const canvasHeight = containerWidth / ASPECT_RATIO;
    const scale = containerWidth / REF_WIDTH;

    // Expose captureImage via ref — renders to a hidden <canvas> for reliable export
    useImperativeHandle(
      ref,
      () => ({
        captureImage: async (): Promise<Blob | null> => {
          const expScale = EXPORT_WIDTH / REF_WIDTH;
          const canvas = document.createElement("canvas");
          canvas.width = EXPORT_WIDTH;
          canvas.height = EXPORT_HEIGHT;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;

          // --- Background ---
          if (
            backgroundConfig.type === "gradient" &&
            backgroundConfig.colors.length >= 2
          ) {
            const dir = backgroundConfig.direction;
            const [x0, y0, x1, y1] =
              dir === "to-bottom"
                ? [0, 0, 0, EXPORT_HEIGHT]
                : dir === "to-bottom-right"
                  ? [0, 0, EXPORT_WIDTH, EXPORT_HEIGHT]
                  : [0, 0, EXPORT_WIDTH, 0];
            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            backgroundConfig.colors.forEach((c, i) => {
              grad.addColorStop(i / (backgroundConfig.colors.length - 1), c);
            });
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = backgroundConfig.colors[0] || "#CCCCCC";
          }
          ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

          // --- Text elements ---
          for (const el of textElements) {
            const fontSize = el.font_size * expScale;
            const weight =
              el.font_weight === "bold"
                ? "bold"
                : el.font_weight === "semibold"
                  ? "600"
                  : "normal";
            ctx.font = `${weight} ${fontSize}px sans-serif`;
            ctx.fillStyle = el.font_color;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            const px = (el.position_x / 100) * EXPORT_WIDTH;
            const py = (el.position_y / 100) * EXPORT_HEIGHT;
            ctx.fillText(el.content, px, py);
          }

          // --- CTA button ---
          if (ctaConfig) {
            const cfs = ctaConfig.font_size * expScale;
            const cpx = ctaConfig.padding_x * expScale;
            const cpy = ctaConfig.padding_y * expScale;
            const cbr = ctaConfig.border_radius * expScale;
            ctx.font = `600 ${cfs}px sans-serif`;
            const tm = ctx.measureText(ctaConfig.text);
            const bw = tm.width + cpx * 2;
            const bh = cfs + cpy * 2;
            const bx = (ctaConfig.position_x / 100) * EXPORT_WIDTH;
            const by = (ctaConfig.position_y / 100) * EXPORT_HEIGHT - bh / 2;
            ctx.beginPath();
            ctx.roundRect(bx, by, bw, bh, cbr);
            ctx.fillStyle = ctaConfig.bg_color;
            ctx.fill();
            ctx.fillStyle = ctaConfig.text_color;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(ctaConfig.text, bx + cpx, by + bh / 2);
          }

          return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png");
          });
        },
      }),
      [backgroundConfig, textElements, ctaConfig]
    );

    // ── Drag handlers (attached to the canvas container) ──────────────

    const handlePointerDown = useCallback(
      (e: React.PointerEvent, type: "text" | "cta", id: string) => {
        e.stopPropagation();
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        let elPxX: number, elPxY: number;
        if (type === "text") {
          const el = textElementsRef.current.find((t) => t.id === id);
          if (!el) return;
          elPxX = (el.position_x / 100) * containerWidth;
          elPxY = (el.position_y / 100) * canvasHeight;
        } else {
          const cta = ctaConfigRef.current;
          if (!cta) return;
          elPxX = (cta.position_x / 100) * containerWidth;
          elPxY = (cta.position_y / 100) * canvasHeight;
        }

        dragRef.current = {
          type,
          id,
          offsetX: mx - elPxX,
          offsetY: my - elPxY,
        };

        if (type === "text") onSelectElement(id);
      },
      [containerWidth, canvasHeight, onSelectElement]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        const d = dragRef.current;
        if (!d) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const newX = Math.min(
          100,
          Math.max(0, ((mx - d.offsetX) / containerWidth) * 100)
        );
        const newY = Math.min(
          100,
          Math.max(0, ((my - d.offsetY) / canvasHeight) * 100)
        );

        if (d.type === "text") {
          const updated = textElementsRef.current.map((el) =>
            el.id === d.id ? { ...el, position_x: newX, position_y: newY } : el
          );
          onTextElementsChangeRef.current(updated);
        } else if (
          d.type === "cta" &&
          ctaConfigRef.current &&
          onCtaConfigChangeRef.current
        ) {
          onCtaConfigChangeRef.current({
            ...ctaConfigRef.current,
            position_x: newX,
            position_y: newY,
          });
        }
      },
      [containerWidth, canvasHeight]
    );

    const handlePointerUp = useCallback(() => {
      dragRef.current = null;
    }, []);

    // Click on empty area → deselect
    const handleBgClick = useCallback(() => {
      onSelectElement(null);
      setEditingId(null);
    }, [onSelectElement]);

    // Double-click text → inline edit
    const handleDoubleClick = useCallback((id: string) => {
      setEditingId(id);
    }, []);

    // Commit inline edit
    const handleBlur = useCallback(
      (id: string, newContent: string) => {
        setEditingId(null);
        const trimmed = newContent.trim() || "Text";
        const updated = textElements.map((el) =>
          el.id === id ? { ...el, content: trimmed } : el
        );
        onTextElementsChange(updated);
      },
      [textElements, onTextElementsChange]
    );

    if (containerWidth === 0) {
      return (
        <div ref={containerRef} className="w-full" style={{ minHeight: 200 }} />
      );
    }

    return (
      <div ref={containerRef} className="w-full">
        <div
          className="relative rounded-lg border border-border-subtle overflow-hidden select-none"
          style={{
            width: containerWidth,
            height: canvasHeight,
            ...buildBg(backgroundConfig),
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleBgClick}
        >
          {/* ── Text elements ── */}
          {textElements.map((el) => {
            const isSelected = el.id === selectedElementId;
            const isEditing = el.id === editingId;
            const fontSize = el.font_size * scale;

            return (
              <div
                key={el.id}
                className={cn(
                  "absolute cursor-grab active:cursor-grabbing",
                  isSelected &&
                    "ring-2 ring-blue-500 ring-offset-1 ring-offset-transparent rounded"
                )}
                style={{
                  left: `${el.position_x}%`,
                  top: `${el.position_y}%`,
                  transform: "translateY(-50%)",
                  fontSize: `${fontSize}px`,
                  fontWeight: fw(el.font_weight),
                  color: el.font_color,
                  lineHeight: 1.3,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxWidth: `${100 - el.position_x}%`,
                  padding: "2px 4px",
                  userSelect: isEditing ? "text" : "none",
                  cursor: isEditing ? "text" : undefined,
                  zIndex: isSelected ? 10 : 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(el.id);
                }}
                onPointerDown={(e) => {
                  if (!isEditing) handlePointerDown(e, "text", el.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(el.id);
                }}
              >
                {isEditing ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none min-w-[20px] inline-block"
                    style={{ caretColor: el.font_color }}
                    onBlur={(e) =>
                      handleBlur(el.id, e.currentTarget.textContent ?? "")
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        (e.target as HTMLElement).blur();
                      }
                      if (e.key === "Escape") {
                        (e.target as HTMLElement).blur();
                      }
                    }}
                    ref={(node) => {
                      if (node && !node.textContent) {
                        node.textContent = el.content;
                      }
                      // Auto-focus when entering edit mode
                      if (node) {
                        requestAnimationFrame(() => {
                          node.focus();
                          const sel = window.getSelection();
                          if (sel) {
                            sel.selectAllChildren(node);
                            sel.collapseToEnd();
                          }
                        });
                      }
                    }}
                  />
                ) : (
                  el.content
                )}
              </div>
            );
          })}

          {/* ── CTA button ── */}
          {ctaConfig && (
            <div
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: `${ctaConfig.position_x}%`,
                top: `${ctaConfig.position_y}%`,
                transform: "translateY(-50%)",
                backgroundColor: ctaConfig.bg_color,
                color: ctaConfig.text_color,
                borderRadius: `${ctaConfig.border_radius * scale}px`,
                fontSize: `${ctaConfig.font_size * scale}px`,
                fontWeight: 600,
                paddingLeft: `${ctaConfig.padding_x * scale}px`,
                paddingRight: `${ctaConfig.padding_x * scale}px`,
                paddingTop: `${ctaConfig.padding_y * scale}px`,
                paddingBottom: `${ctaConfig.padding_y * scale}px`,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                userSelect: "none",
                zIndex: 5,
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => handlePointerDown(e, "cta", "cta")}
            >
              {ctaConfig.text}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default CanvasEditor;
