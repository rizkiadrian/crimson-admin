import { FileText, File, FileSpreadsheet, ImageIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── File Icon Config ───────────────────────────────────────────────────────────

export interface FileIconConfig {
  icon: LucideIcon;
  label: string;
  bgColor: string;
  iconColor: string;
}

/**
 * Return icon config for a file attachment based on its URL extension.
 *
 * Mapping:
 * - `.pdf`          → FileText  (red)   label "PDF"
 * - `.doc` / `.docx` → FileText  (blue)  label "DOC"
 * - `.xls` / `.xlsx` → FileSpreadsheet (green) label "XLS"
 * - `.jpg`/`.jpeg`/`.png`/`.gif`/`.webp` → ImageIcon (tertiary) label "IMG"
 * - other / missing → File      (gray)  label "FILE"
 */
export function getFileIconConfig(attachmentUrl: string): FileIconConfig {
  // Extract extension: strip query/hash, grab last dot-segment
  const pathPart = attachmentUrl.split("?")[0].split("#")[0];
  const lastDot = pathPart.lastIndexOf(".");
  const ext = lastDot !== -1 ? pathPart.slice(lastDot + 1).toLowerCase() : "";

  switch (ext) {
    case "pdf":
      return {
        icon: FileText,
        label: "PDF",
        bgColor: "bg-red-50",
        iconColor: "text-red-600",
      };
    case "doc":
    case "docx":
      return {
        icon: FileText,
        label: "DOC",
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      };
    case "xls":
    case "xlsx":
      return {
        icon: FileSpreadsheet,
        label: "XLS",
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      };
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return {
        icon: ImageIcon,
        label: "IMG",
        bgColor: "bg-tertiary-50",
        iconColor: "text-tertiary-600",
      };
    default:
      return {
        icon: File,
        label: "FILE",
        bgColor: "bg-gray-50",
        iconColor: "text-gray-600",
      };
  }
}
