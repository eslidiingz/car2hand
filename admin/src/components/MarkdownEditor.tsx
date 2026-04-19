"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Props {
    value: string;
    onChange: (value: string) => void;
    height?: number;
    placeholder?: string;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024;

async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiFetch("/admin/posts/upload", { method: "POST", body: fd });
    if (!res?.url) throw new Error("ไม่ได้รับ URL จาก server");
    return res.url as string;
}

function validateFile(file: File): string | null {
    if (!ACCEPTED.includes(file.type)) return "รองรับเฉพาะ JPEG, PNG, WebP, GIF";
    if (file.size > MAX_BYTES) return "ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)";
    return null;
}

function insertAtCursor(textarea: HTMLTextAreaElement, snippet: string): { value: string; cursor: number } {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const value = textarea.value.slice(0, start) + snippet + textarea.value.slice(end);
    return { value, cursor: start + snippet.length };
}

export default function MarkdownEditor({ value, onChange, height = 500, placeholder }: Props) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef(value);

    useEffect(() => { valueRef.current = value; }, [value]);
    useEffect(() => setMounted(true), []);

    const colorMode = mounted && resolvedTheme === "dark" ? "dark" : "light";

    const findTextarea = (): HTMLTextAreaElement | null =>
        wrapperRef.current?.querySelector("textarea.w-md-editor-text-input") ?? null;

    const handleUpload = async (file: File) => {
        const err = validateFile(file);
        if (err) { toast.error(err); return; }

        const placeholderTag = `![กำลังอัพโหลด...](uploading)`;
        const textarea = findTextarea();

        // Optimistic placeholder
        let baseValue = valueRef.current;
        let placeholderInserted = false;
        if (textarea) {
            const { value: next } = insertAtCursor(textarea, placeholderTag);
            baseValue = next;
            placeholderInserted = true;
            onChange(next);
        }

        try {
            const url = await uploadImage(file);
            const finalTag = `![${file.name.replace(/\.[^.]+$/, "")}](${url})`;
            const next = placeholderInserted
                ? baseValue.replace(placeholderTag, finalTag)
                : valueRef.current + (valueRef.current.endsWith("\n") ? "" : "\n") + finalTag + "\n";
            onChange(next);
        } catch (e) {
            const message = e instanceof Error ? e.message : "อัพโหลดล้มเหลว";
            toast.error(message);
            if (placeholderInserted) {
                onChange(baseValue.replace(placeholderTag, ""));
            }
        }
    };

    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData?.items ?? []);
        const file = items.find((it) => it.kind === "file" && it.type.startsWith("image/"))?.getAsFile();
        if (!file) return;
        e.preventDefault();
        await handleUpload(file);
    };

    const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
        const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return;
        e.preventDefault();
        for (const f of files) await handleUpload(f);
    };

    const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        for (const f of files) await handleUpload(f);
        e.target.value = "";
    };

    return (
        <div data-color-mode={colorMode} className="markdown-editor-wrapper" ref={wrapperRef}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilePick}
                className="hidden"
            />
            <div className="flex items-center justify-end mb-2 gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition font-medium"
                >
                    📷 อัพโหลดรูป
                </button>
                <span className="text-[11px] text-muted-foreground">หรือลาก/วางรูปลงในเอดิเตอร์</span>
            </div>
            <MDEditor
                value={value}
                onChange={(v) => onChange(v ?? "")}
                height={height}
                preview="edit"
                visibleDragbar={false}
                textareaProps={{
                    placeholder,
                    onPaste: handlePaste,
                    onDrop: handleDrop,
                }}
            />
        </div>
    );
}
