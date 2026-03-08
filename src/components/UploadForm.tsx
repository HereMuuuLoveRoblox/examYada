"use client";

import { useState, useRef, useCallback } from "react";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_DIMENSION = 1200; // compress to this max width/height

interface Props {
  onAdd: (image: string, answers: string[]) => void;
}

export default function UploadForm({ onAdd }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [answers, setAnswers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /** Compress and convert image to base64 */
  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_IMAGE_SIZE * 5) {
        reject(new Error("Image file is too large (max ~10 MB raw)."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Scale down if needed
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG at 0.7 quality
          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(base64);
        };
        img.onerror = () => reject(new Error("Failed to read image."));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const base64 = await processImage(file);
      setPreview(base64);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      setError("Please upload an image.");
      return;
    }
    const parsed = answers
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (parsed.length === 0) {
      setError("Please enter at least one answer.");
      return;
    }
    onAdd(preview, parsed);
    // Reset form
    setPreview(null);
    setAnswers("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium mb-1">Upload Image</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg
            file:border-0 file:text-sm file:font-semibold file:bg-blue-50
            file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900
            dark:file:text-blue-200 cursor-pointer"
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Processing image…</p>}

      {/* Preview */}
      {preview && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-auto" loading="lazy" />
        </div>
      )}

      {/* Answers */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Answers (comma separated)
        </label>
        <input
          type="text"
          value={answers}
          onChange={(e) => setAnswers(e.target.value)}
          placeholder="e.g. dog, puppy"
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
        Add Question
      </button>
    </form>
  );
}
