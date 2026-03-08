"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadQuizData, resetAllData } from "@/lib/storage";
import { QuizSet } from "@/types/quiz";
import QuizSetSelector from "@/components/QuizSetSelector";
import ImageQuiz from "@/components/ImageQuiz";

export default function HomePage() {
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quizActive, setQuizActive] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setSets(loadQuizData().sets);
  }, []);

  const selectedSet = sets.find((s) => s.id === selectedId);

  const handleStartQuiz = () => {
    if (!selectedSet || selectedSet.questions.length === 0) return;
    setQuizActive(true);
  };

  const handleReset = () => {
    resetAllData();
    setSets([]);
    setSelectedId(null);
    setQuizActive(false);
    setConfirmReset(false);
  };

  // Active quiz view
  if (quizActive && selectedSet) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto">
        <ImageQuiz
          quizSet={selectedSet}
          onExit={() => {
            setQuizActive(false);
            setSets(loadQuizData().sets);
          }}
        />
      </div>
    );
  }

  // Home view
  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-8">
      <header className="text-center pt-6">
        <h1 className="text-4xl font-bold tracking-tight">ExamYada</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          สร้างและฝึกทดสอบความจำด้วยรูปภาพ
        </p>
      </header>

      {/* Quiz set selector */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">เลือกชุดข้อสอบ</h2>
        <QuizSetSelector
          sets={sets}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </section>

      {/* Action buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleStartQuiz}
          disabled={!selectedSet || selectedSet.questions.length === 0}
          className="py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold
            rounded-xl text-lg transition-colors disabled:opacity-50"
        >
          เริ่มทำข้อสอบ
        </button>
        <Link
          href="/manage"
          className="py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold
            rounded-xl text-lg transition-colors text-center"
        >
          จัดการชุดข้อสอบ
        </Link>
      </div>

      {/* Reset */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full py-3 px-6 bg-red-100 dark:bg-red-900/30 text-red-600
              dark:text-red-400 font-semibold rounded-xl transition-colors
              hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            ลบข้อมูลทั้งหมด
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium text-center">
              การดำเนินการนี้จะลบชุดข้อสอบและคำถามทั้งหมดอย่างถาวร
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleReset}
                className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                ยืนยันการลบ
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="py-3 px-6 bg-gray-200 dark:bg-gray-700 font-semibold rounded-xl transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
