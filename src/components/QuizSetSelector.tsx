"use client";

import { QuizSet } from "@/types/quiz";

interface Props {
  sets: QuizSet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function QuizSetSelector({ sets, selectedId, onSelect }: Props) {
  if (sets.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        ยังไม่มีชุดข้อสอบ กรุณาสร้างใหม่ในหน้า &quot;จัดการชุดข้อสอบ&quot;
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {sets.map((set) => (
        <button
          key={set.id}
          onClick={() => onSelect(set.id)}
          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all
            ${
              selectedId === set.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
            }`}
        >
          <span className="font-semibold text-lg">{set.name}</span>
          <span className="ml-2 text-sm text-gray-500">
            ({set.questions.length} ข้อ)
          </span>
        </button>
      ))}
    </div>
  );
}
