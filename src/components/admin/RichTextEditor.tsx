"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef } from "react";
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent editor blur
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-1" />;
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url, target: "_blank", rel: "noopener noreferrer" }).run();
    }
  }, [editor]);

  const insertImage = useCallback(
    async (file: File) => {
      // Upload via /api/admin/upload, insert returned URL
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!res.ok) {
        alert("Image upload failed");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    },
    [editor],
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-t-lg">
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline code"
      >
        <Code size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered list"
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
      >
        <Minus size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Set link">
        <LinkIcon size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        title="Insert image"
      >
        <ImageIcon size={14} />
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void insertImage(file);
          e.target.value = ""; // reset so same file can be re-selected
        }}
      />
    </div>
  );
}

// ─── Editor ──────────────────────────────────────────────────────────────────

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false, HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Write your article…" }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
