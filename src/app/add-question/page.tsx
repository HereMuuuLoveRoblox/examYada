"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getQuizSet, addQuestion, deleteQuestion } from "@/lib/storage";
import { QuizSet } from "@/types/quiz";
import UploadForm from "@/components/UploadForm";

function AddQuestionContent() {
  const searchParams = useSearchParams();
  const setId = searchParams.get("id") ?? "";
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);

  const reload = () => {
    const set = getQuizSet(setId);
    setQuizSet(set ?? null);
  };

  useEffect(() => {
    if (setId) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId]);

  const handleAdd = (image: string, answers: string[]) => {
    addQuestion(setId, image, answers);
    reload();
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(setId, questionId);
    reload();
  };

  if (!setId || !quizSet) {
    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto pt-12 text-center">
        <p className="text-gray-500">ไม่พบชุดข้อสอบนี้</p>
        <Link href="/manage" className="text-blue-600 underline mt-4 inline-block">
          กลับไปจัดการชุดข้อสอบ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold">{quizSet.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {quizSet.questions.length} ข้อ
          </p>
        </div>
        <Link
          href="/manage"
          className="py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium
            hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← กลับ
        </Link>
      </header>

      {/* Upload form */}
      <section className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">เพิ่มคำถามใหม่</h2>
        <UploadForm onAdd={handleAdd} />
      </section>

      {/* Existing questions */}
      {quizSet.questions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">คำถามทั้งหมด</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quizSet.questions.map((q, i) => (
              <div
                key={q.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.image}
                  alt={`Question ${i + 1}`}
                  className="w-full h-40 object-cover bg-gray-100 dark:bg-gray-800"
                  loading="lazy"
                />
                <div className="p-3 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">คำตอบ: </span>
                    {q.answers.join(", ")}
                  </p>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function AddQuestionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-4 max-w-2xl mx-auto pt-12 text-center text-gray-500">กำลังโหลด…</div>}>
      <AddQuestionContent />
    </Suspense>
  );
}
