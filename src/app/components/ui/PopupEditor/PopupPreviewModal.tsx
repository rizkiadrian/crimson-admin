"use client";

import { X } from "lucide-react";
import { Button } from "@app/components/ui/Button";
import type { PopupContentType } from "@services/marketing/popup-promotions";

interface PopupPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: PopupContentType;
  contentConfig: Record<string, unknown> | null;
}

export default function PopupPreviewModal({
  isOpen,
  onClose,
  contentType,
  contentConfig,
}: PopupPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4">
        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 h-auto w-auto p-1"
          onClick={onClose}
        >
          <X size={20} />
        </Button>

        {/* Mobile Frame */}
        <div className="p-4">
          <div className="text-xs text-neutral-400 text-center mb-2">
            Mobile Preview ({contentType})
          </div>
          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 min-h-[400px] flex items-center justify-center">
            {contentType === "template" && contentConfig?.template_id ? (
              <div
                className="w-full p-6"
                style={{
                  background:
                    (contentConfig.theme_color as string) || "#667EEA",
                }}
              >
                {Boolean(contentConfig.image_url) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={contentConfig.image_url as string}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-xl font-bold text-white mb-2">
                  {String(contentConfig.headline || "Headline")}
                </h2>
                <p className="text-sm text-white/80 mb-4">
                  {String(contentConfig.subtext || "Subtext")}
                </p>
                {Boolean(contentConfig.cta_text) && (
                  <button
                    className="px-6 py-2.5 bg-white text-sm font-semibold rounded-lg"
                    style={{
                      color: (contentConfig.theme_color as string)?.startsWith(
                        "linear"
                      )
                        ? "#d32f2f"
                        : (contentConfig.theme_color as string) || "#667EEA",
                    }}
                  >
                    {String(contentConfig.cta_text)}
                  </button>
                )}
              </div>
            ) : contentType === "html" && contentConfig?.html ? (
              <iframe
                className="w-full min-h-[400px] border-0"
                sandbox="allow-same-origin"
                srcDoc={contentConfig.html as string}
                title="HTML Preview"
              />
            ) : contentType === "image" && contentConfig?.image_url ? (
              <div className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={contentConfig.image_url as string}
                  alt="Popup preview"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-sm text-neutral-500">
                  Preview for <strong>{contentType}</strong> mode
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  {contentConfig
                    ? `${Object.keys(contentConfig).length} config fields`
                    : "No content configured yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
