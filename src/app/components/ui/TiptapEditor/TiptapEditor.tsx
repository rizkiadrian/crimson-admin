"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Unlink,
  ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
} from "lucide-react";
import { cn } from "@lib/utils";

interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-primary-100 text-primary-700"
          : "text-neutral-600 hover:bg-neutral-100",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({
  value = "",
  onChange,
  onImageUpload,
  placeholder = "Write your content here...",
  error,
  label,
  required,
  disabled,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor || !onImageUpload) return;
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // Error handled by caller
      }
      e.target.value = "";
    },
    [editor, onImageUpload]
  );

  if (!editor) return null;

  const s = 16;

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          "border rounded-xl overflow-hidden",
          error ? "border-red-400" : "border-neutral-200",
          disabled && "opacity-60 pointer-events-none"
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200 bg-neutral-50">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={s} />
          </ToolbarButton>

          <div className="w-px h-5 bg-neutral-200 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline Code"
          >
            <Code size={s} />
          </ToolbarButton>

          <div className="w-px h-5 bg-neutral-200 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus size={s} />
          </ToolbarButton>

          <div className="w-px h-5 bg-neutral-200 mx-1" />

          <ToolbarButton
            onClick={addLink}
            active={editor.isActive("link")}
            title="Add Link"
          >
            <Link size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            title="Remove Link"
          >
            <Unlink size={s} />
          </ToolbarButton>

          {onImageUpload && (
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              title="Insert Image"
            >
              <ImageIcon size={s} />
            </ToolbarButton>
          )}

          <div className="w-px h-5 bg-neutral-200 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={s} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={s} />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-4 py-3 min-h-[200px] focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[180px] [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.is-editor-empty:first-child::before]:text-neutral-400 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
