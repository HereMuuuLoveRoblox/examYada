"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const MAX_DIMENSION = 1200;
const MAX_RAW_BYTES = 10 * 1024 * 1024;

interface Props {
  onAdd: (images: string[], answers: string[]) => void;
}

export default function UploadForm({ onAdd }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [answers, setAnswers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const processImage = useCallback((file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_RAW_BYTES) {
        reject(new Error("ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด ~10 MB)"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => reject(new Error("ไม่สามารถอ่านรูปภาพได้"));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
      reader.readAsDataURL(file);
    });
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;
      setError(null);
      setLoading(true);
      try {
        const results = await Promise.all(imageFiles.map(processImage));
        setPreviews((prev) => [...prev, ...results]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [processImage]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addFiles(files);
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItems = items.filter((i) => i.type.startsWith("image/"));
      if (imageItems.length === 0) return;
      e.preventDefault();
      const blobs = imageItems.map((i) => i.getAsFile()).filter(Boolean) as File[];
      addFiles(blobs);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const removePreview = (idx: number) =>
    setPreviews((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previews.length === 0) {
      setError("กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป");
      return;
    }
    const parsed = answers
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (parsed.length === 0) {
      setError("กรุณากรอกคำตอบอย่างน้อย 1 คำ");
      return;
    }
    onAdd(previews, parsed);
    setPreviews([]);
    setAnswers("");
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl
          border-2 border-dashed cursor-pointer transition-colors
          ${dragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
      >
        <span className="text-3xl">🖼️</span>
        <p className="text-sm font-medium text-center">
          คลิกเพื่อเลือกรูป, ลากวางรูป หรือ{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">
            Ctrl+V
          </kbd>{" "}
          วางจาก Clipboard
        </p>
        <p className="text-xs text-gray-400">เพิ่มได้หลายรูปพร้อมกัน</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-500">กำลังประมวลผลรูปภาพ…</p>
      )}

      {previews.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            รูปที่เพิ่มแล้ว ({previews.length} รูป) — ระหว่างทำข้อสอบจะสุ่มรูปมา 1 รูป
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`รูปที่ ${i + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white
                    rounded-full text-xs flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <span className="absolute bottom-1 left-1 bg-black/50 text-white
                  text-xs rounded px-1">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          คำตอบที่ถูกต้อง (คั่นด้วยเครื่องหมายจุลภาค)
        </label>
        <input
          type="text"
          value={answers}
          onChange={(e) => setAnswers(e.target.value)}
          placeholder="เช่น Neutrophil, นิวโทรฟิล"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-blue-500
            focus:border-transparent outline-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold
          rounded-xl text-lg transition-colors disabled:opacity-50"
      >
        เพิ่มคำถาม
      </button>
    </form>
  );
}
