"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadQuizData, createQuizSet, deleteQuizSet } from "@/lib/storage";
import { QuizSet } from "@/types/quiz";

export default function ManagePage() {
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setSets(loadQuizData().sets);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createQuizSet(newName);
    setSets(loadQuizData().sets);
    setNewName("");
  };

  const handleDelete = (id: string) => {
    deleteQuizSet(id);
    setSets(loadQuizData().sets);
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center justify-between pt-6">
        <h1 className="text-3xl font-bold">จัดการชุดข้อสอบ</h1>
        <Link
          href="/"
          className="py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium
            hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← หน้าหลัก
        </Link>
      </header>

      {/* Create new set */}
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ชื่อชุดข้อสอบใหม่…"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-blue-500
            focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold
            rounded-xl transition-colors disabled:opacity-50 shrink-0"
        >
          สร้าง
        </button>
      </form>

      {/* List of sets */}
      {sets.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          ยังไม่มีชุดข้อสอบ กรุณาสร้างใหม่ด้านบน
        </p>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => (
            <div
              key={set.id}
              className="flex items-center justify-between p-4 border border-gray-200
                dark:border-gray-700 rounded-xl"
            >
              <div>
                <p className="font-semibold text-lg">{set.name}</p>
                <p className="text-sm text-gray-500">
                  {set.questions.length} ข้อ
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/add-question?id=${set.id}`}
                  className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm
                    font-semibold rounded-lg transition-colors"
                >
                  เพิ่มคำถาม
                </Link>
                <button
                  onClick={() => handleDelete(set.id)}
                  className="py-2 px-4 bg-red-100 dark:bg-red-900/30 text-red-600
                    dark:text-red-400 text-sm font-semibold rounded-lg transition-colors
                    hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
