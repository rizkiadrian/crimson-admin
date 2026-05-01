"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";

// ─── Standalone MetadataPopover for showcase ─────────────────────────────────

function truncateJson(
  metadata: Record<string, unknown> | null,
  maxLength = 50
): string {
  if (!metadata) return "—";
  const json = JSON.stringify(metadata);
  if (json.length <= maxLength) return json;
  return json.slice(0, maxLength) + "…";
}

function MetadataPopover({
  metadata,
}: {
  metadata: Record<string, unknown> | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    queueMicrotask(() => {
      setOpenAbove(spaceBelow < 280 && spaceAbove > spaceBelow);
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  if (!metadata) {
    return <span className="text-xs text-text-muted font-mono">—</span>;
  }

  const fullJson = JSON.stringify(metadata, null, 2);
  const truncated = truncateJson(metadata);
  const isLong = JSON.stringify(metadata).length > 50;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-xs font-mono text-left max-w-xs truncate block transition-colors ${
          isLong
            ? "text-primary-600 hover:text-primary-700 cursor-pointer underline decoration-dotted underline-offset-2"
            : "text-text-muted cursor-pointer hover:text-text-main"
        }`}
      >
        {truncated}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 right-0 w-80 max-w-[90vw] bg-bg-card rounded-xl border border-border-subtle shadow-xl ${
            openAbove ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
            <span className="text-xs font-semibold text-text-main uppercase tracking-wide">
              Metadata
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-neutral-100 transition-colors"
                title="Copy JSON"
              >
                {copied ? (
                  <Check size={14} className="text-success-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-neutral-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="p-4 max-h-64 overflow-auto">
            <pre className="text-xs font-mono text-text-main whitespace-pre-wrap break-words leading-relaxed">
              {fullJson}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Showcase ────────────────────────────────────────────────────────────────

const SAMPLE_SHORT = { platform: "android", version: "2.0.0" };
const SAMPLE_LONG = {
  service_category: "cleaning",
  source: "banner",
  banner_id: "banner-7",
  position: 3,
  session_id: "abc123def456",
};
const SAMPLE_NULL = null;

export function MetadataPopoverShowcase() {
  return (
    <div className="bg-bg-card rounded-2xl border border-border-subtle p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-1">
          MetadataPopover
        </h3>
        <p className="text-sm text-text-muted">
          Inline popover for displaying truncated JSON metadata. Used in the
          Event Log table. Click to open the full JSON view with
          copy-to-clipboard.
        </p>
      </div>

      <div className="space-y-6">
        {/* Short metadata */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Short metadata (≤50 chars) — plain text, clickable
          </p>
          <div className="bg-neutral-50 rounded-lg p-4">
            <MetadataPopover metadata={SAMPLE_SHORT} />
          </div>
        </div>

        {/* Long metadata */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Long metadata (&gt;50 chars) — truncated with primary link styling
          </p>
          <div className="bg-neutral-50 rounded-lg p-4">
            <MetadataPopover metadata={SAMPLE_LONG} />
          </div>
        </div>

        {/* Null metadata */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Null metadata — em dash placeholder
          </p>
          <div className="bg-neutral-50 rounded-lg p-4">
            <MetadataPopover metadata={SAMPLE_NULL} />
          </div>
        </div>
      </div>

      <div className="border-t border-border-subtle pt-4">
        <p className="text-xs text-text-muted">
          <strong>Features:</strong> Smart positioning (above/below based on
          viewport), copy-to-clipboard with checkmark feedback, close on click
          outside or Escape key, formatted JSON display with scrollable body.
        </p>
      </div>
    </div>
  );
}
