"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function AnswerInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium">Your Answer</label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your answer…"
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800 text-lg focus:ring-2 focus:ring-blue-500
          focus:border-transparent outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold
          rounded-xl text-lg transition-colors disabled:opacity-50"
      >
        Submit
      </button>
    </form>
  );
}
