"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import { popupPromotionsService } from "@services/marketing/popup-promotions";

interface PopupImageInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}

export default function PopupImageInput({
  label = "Image",
  value,
  onChange,
}: PopupImageInputProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const resp = await popupPromotionsService.uploadImage(file);
      onChange(resp.data.url);
    } catch {
      // silently fail
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <FormInput
        id="img-url"
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="text-xs gap-1.5"
          isLoading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={14} /> Upload
        </Button>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="preview"
            className="w-10 h-10 rounded object-cover border border-neutral-200"
          />
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
    </div>
  );
}
