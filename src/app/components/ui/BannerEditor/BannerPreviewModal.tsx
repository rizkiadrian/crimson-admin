"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@lib/utils";
import { Button } from "@app/components/ui/Button";
import type {
  BannerType,
  IBackgroundConfig,
  ITextElement,
  ICtaConfig,
  FontWeight,
} from "@services/backoffice/banners/banners.types";

/** Duration in ms for the enter/exit animation. */
const ANIMATION_DURATION = 200;

/** Mobile viewport width for preview (CSS pixels). */
const MOBILE_WIDTH = 375;

/** Banner aspect ratio dimensions. */
const ASPECT_WIDTH = 1080;
const ASPECT_HEIGHT = 540;

interface BannerPreviewData {
  type: BannerType;
  image?: File | string | null;
  backgroundConfig?: IBackgroundConfig | null;
  textElements?: ITextElement[] | null;
  ctaConfig?: ICtaConfig | null;
}

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: BannerPreviewData;
}

/**
 * Build a CSS background value from a background config.
 */
function buildBackgroundStyle(config: IBackgroundConfig): React.CSSProperties {
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

/**
 * Map FontWeight to CSS font-weight value.
 */
function mapFontWeight(weight: FontWeight): number | string {
  switch (weight) {
    case "bold":
      return 700;
    case "semibold":
      return 600;
    case "normal":
    default:
      return 400;
  }
}

/**
 * Banner Preview Modal.
 *
 * Displays a banner at mobile viewport size (~375px CSS width) in a centered
 * modal overlay. Supports both image-type banners (File or URL) and
 * text-placement banners (background + positioned text elements).
 */
export default function BannerPreviewModal({
  isOpen,
  onClose,
  banner,
}: BannerPreviewModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Create object URL for File images and clean up on unmount/change
  const imageUrl = useMemo(() => {
    if (banner.type !== "image" || !banner.image) return null;
    if (typeof banner.image === "string") return banner.image;
    return URL.createObjectURL(banner.image);
  }, [banner.type, banner.image]);

  useEffect(() => {
    return () => {
      // Revoke object URL when component unmounts or image changes
      if (imageUrl && banner.image instanceof File) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl, banner.image]);

  // Phase 1: Mount/unmount
  useEffect(() => {
    if (isOpen) {
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
      setMounted(true);
    } else if (mounted) {
      setVisible(false);
      unmountTimerRef.current = setTimeout(() => {
        setMounted(false);
      }, ANIMATION_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Phase 2: Enter animation after mount
  useEffect(() => {
    if (!mounted) return;
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    return () => cancelAnimationFrame(raf1);
  }, [mounted]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  if (!mounted) return null;

  /** Computed banner height based on 16:9 aspect ratio at mobile width. */
  const bannerHeight = Math.round(
    MOBILE_WIDTH * (ASPECT_HEIGHT / ASPECT_WIDTH)
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity",
          visible ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
      />

      {/* Modal panel */}
      <div
        ref={panelRef}
        className={cn(
          "relative bg-bg-card rounded-2xl shadow-2xl border border-border-subtle mx-4 transition-all overflow-hidden",
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        )}
        style={{
          width: MOBILE_WIDTH + 48, // 24px padding each side
          maxWidth: "calc(100vw - 32px)",
          transitionDuration: `${ANIMATION_DURATION}ms`,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-lg font-bold text-text-main">Banner Preview</h3>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close preview"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>

        {/* Preview area */}
        <div className="px-6 pb-4">
          <div
            className="mx-auto rounded-lg overflow-hidden border border-border-subtle"
            style={{ width: MOBILE_WIDTH, maxWidth: "100%" }}
          >
            {banner.type === "image" && imageUrl ? (
              <Image
                src={imageUrl}
                alt="Banner preview"
                width={MOBILE_WIDTH}
                height={bannerHeight}
                className="block w-full h-auto object-cover"
                unoptimized={banner.image instanceof File}
              />
            ) : banner.type === "text_placement" && banner.backgroundConfig ? (
              <div
                className="relative"
                style={{
                  width: "100%",
                  paddingBottom: `${(ASPECT_HEIGHT / ASPECT_WIDTH) * 100}%`,
                  ...buildBackgroundStyle(banner.backgroundConfig),
                }}
              >
                {banner.textElements?.map((element) => (
                  <span
                    key={element.id}
                    className="absolute whitespace-pre-wrap"
                    style={{
                      left: `${element.position_x}%`,
                      top: `${element.position_y}%`,
                      transform: "translateY(-50%)",
                      fontSize: `${(element.font_size / ASPECT_WIDTH) * MOBILE_WIDTH}px`,
                      color: element.font_color,
                      fontWeight: mapFontWeight(element.font_weight),
                      lineHeight: 1.3,
                      maxWidth: `${100 - element.position_x}%`,
                      wordBreak: "break-word",
                    }}
                  >
                    {element.content}
                  </span>
                ))}
                {banner.ctaConfig && (
                  <span
                    className="absolute whitespace-nowrap"
                    style={{
                      left: `${banner.ctaConfig.position_x}%`,
                      top: `${banner.ctaConfig.position_y}%`,
                      transform: "translateY(-50%)",
                      backgroundColor: banner.ctaConfig.bg_color,
                      color: banner.ctaConfig.text_color,
                      borderRadius: `${(banner.ctaConfig.border_radius / ASPECT_WIDTH) * MOBILE_WIDTH}px`,
                      fontSize: `${(banner.ctaConfig.font_size / ASPECT_WIDTH) * MOBILE_WIDTH}px`,
                      paddingLeft: `${(banner.ctaConfig.padding_x / ASPECT_WIDTH) * MOBILE_WIDTH}px`,
                      paddingRight: `${(banner.ctaConfig.padding_x / ASPECT_WIDTH) * MOBILE_WIDTH}px`,
                      paddingTop: `${(banner.ctaConfig.padding_y / ASPECT_WIDTH) * MOBILE_WIDTH}px`,
                      paddingBottom: `${(banner.ctaConfig.padding_y / ASPECT_WIDTH) * MOBILE_WIDTH}px`,
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {banner.ctaConfig.text}
                  </span>
                )}
              </div>
            ) : (
              <div
                className="flex items-center justify-center bg-neutral-100 text-text-muted text-sm"
                style={{
                  width: "100%",
                  paddingBottom: `${(ASPECT_HEIGHT / ASPECT_WIDTH) * 100}%`,
                  position: "relative",
                }}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  No preview available
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <Button variant="outlined" onClick={onClose}>
            Back to Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
