"use client";

import { useState, useCallback } from "react";

interface PopupHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const TEMPLATE_VARS = ["{{user_name}}", "{{voucher_code}}", "{{deeplink}}"];

const DEFAULT_HTML = `<div style="padding: 24px; text-align: center;">
  <h2 style="margin: 0 0 8px; font-size: 20px; color: #1a1a1a;">
    Welcome, {{user_name}}!
  </h2>
  <p style="margin: 0 0 16px; color: #666;">
    Here's a special offer just for you.
  </p>
  <a href="{{deeplink}}" style="display: inline-block; padding: 12px 24px; background: #667EEA; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Claim Now
  </a>
  <button onclick="window.close()" style="display: block; margin: 16px auto 0; background: none; border: none; color: #999; cursor: pointer; font-size: 12px;">
    Dismiss
  </button>
</div>`;

export default function PopupHtmlEditor({
  value,
  onChange,
}: PopupHtmlEditorProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  const insertTemplate = useCallback(() => {
    if (!value) onChange(DEFAULT_HTML);
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "code"
                ? "bg-primary-100 text-primary-700"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === "preview"
                ? "bg-primary-100 text-primary-700"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Variables:</span>
          {TEMPLATE_VARS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(value + v)}
              className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview */}
      {activeTab === "code" ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter HTML code..."
            className="w-full h-80 p-4 font-mono text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-neutral-50"
            spellCheck={false}
          />
          {!value && (
            <button
              type="button"
              onClick={insertTemplate}
              className="absolute top-3 right-3 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100"
            >
              Insert Template
            </button>
          )}
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-100 px-3 py-1.5 text-xs text-neutral-500 border-b border-neutral-200">
            Preview (template variables shown as-is)
          </div>
          <iframe
            className="w-full min-h-[320px] border-0 bg-white"
            sandbox="allow-same-origin"
            srcDoc={value}
            title="HTML Preview"
          />
        </div>
      )}
    </div>
  );
}
