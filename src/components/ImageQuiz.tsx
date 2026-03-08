"use client";

import { useState, useCallback } from "react";
import { Question, QuizSet, QuizSession } from "@/types/quiz";
import { createSession, nextQuestion, checkAnswer, pickRandomImage } from "@/lib/quizEngine";
import AnswerInput from "./AnswerInput";

interface Props {
  quizSet: QuizSet;
  questionCount: number;
  onExit: () => void;
}

type Feedback = "correct" | "wrong" | null;

export default function ImageQuiz({ quizSet, questionCount, onExit }: Props) {
  const [session, setSession] = useState<QuizSession>(() =>
    createSession(quizSet.questions, questionCount)
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  // Random image picked fresh for each question shown
  const [currentImage, setCurrentImage] = useState<string>(() => {
    const init = createSession(quizSet.questions, questionCount);
    const q = quizSet.questions[init.currentIndex];
    return q ? pickRandomImage(q) : "";
  });

  const currentQuestion: Question | undefined =
    quizSet.questions[session.currentIndex];

  const handleSubmit = useCallback(
    (answer: string) => {
      if (!currentQuestion) return;
      const correct = checkAnswer(currentQuestion, answer);
      if (correct) {
        setFeedback("correct");
        setSession((s) => ({
          ...s,
          correctCount: s.correctCount + 1,
          answeredCount: s.answeredCount + 1,
        }));
      } else {
        setFeedback("wrong");
      }
    },
    [currentQuestion]
  );

  const handleNext = useCallback(() => {
    const updated = nextQuestion(session);
    if (!updated) {
      setFinished(true);
      return;
    }
    // Pick a fresh random image for the next question
    const nextQ = quizSet.questions[updated.currentIndex];
    if (nextQ) setCurrentImage(pickRandomImage(nextQ));
    setSession(updated);
    setFeedback(null);
    setRevealed(false);
  }, [session, quizSet.questions]);

  const handleSkip = useCallback(() => {
    setSession((s) => ({ ...s, answeredCount: s.answeredCount + 1 }));
    handleNext();
  }, [handleNext]);

  const handleReveal = () => setRevealed(true);

  const progress = session.totalQuestions - session.remaining.length;

  // Finished screen
  if (finished || !currentQuestion) {
    return (
      <div className="text-center space-y-6 py-8">
        <h2 className="text-3xl font-bold">ทำข้อสอบเสร็จแล้ว!</h2>
        <p className="text-xl">
          คะแนน: {session.correctCount} / {session.totalQuestions}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              const newSession = createSession(quizSet.questions, questionCount);
              const firstQ = quizSet.questions[newSession.currentIndex];
              if (firstQ) setCurrentImage(pickRandomImage(firstQ));
              setSession(newSession);
              setFeedback(null);
              setRevealed(false);
              setFinished(false);
            }}
            className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-colors"
          >
            ทำใหม่อีกครั้ง
          </button>
          <button
            onClick={onExit}
            className="py-3 px-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
              font-semibold rounded-xl text-lg transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          ข้อที่ {progress} / {session.totalQuestions}
        </span>
        <span>ตอบถูก: {session.correctCount}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(progress / session.totalQuestions) * 100}%` }}
        />
      </div>

      {/* Image */}
      <div className="flex justify-center">
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 max-w-md w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Quiz question"
            className="w-full h-auto max-h-[50vh] object-contain bg-gray-100 dark:bg-gray-800"
            loading="lazy"
          />
        </div>
      </div>

      {/* Feedback */}
      {feedback === "correct" && (
        <div className="text-center py-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-xl font-semibold text-lg">
          ✓ ถูกต้อง!
        </div>
      )}
      {feedback === "wrong" && (
        <div className="text-center py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl font-semibold text-lg">
          ✗ คำตอบไม่ถูกต้อง — ลองใหม่อีกครั้ง
        </div>
      )}

      {/* Answer input — disabled once correct */}
      <AnswerInput onSubmit={handleSubmit} disabled={feedback === "correct"} />

      {/* Revealed answers */}
      {revealed && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <p className="font-semibold mb-1">คำตอบที่ถูกต้อง:</p>
          <ul className="list-disc list-inside">
            {currentQuestion.answers.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          onClick={handleReveal}
          disabled={revealed}
          className="py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold
            rounded-xl transition-colors disabled:opacity-50"
        >
          เฉลยคำตอบ
        </button>
        <button
          onClick={handleSkip}
          className="py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
            font-semibold rounded-xl transition-colors"
        >
          ข้ามข้อนี้
        </button>
        <button
          onClick={handleNext}
          className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold
            rounded-xl transition-colors col-span-2 sm:col-span-1"
        >
          ข้อถัดไป
        </button>
      </div>
    </div>
  );
}
