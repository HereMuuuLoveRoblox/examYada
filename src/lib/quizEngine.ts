import { Question, QuizSession } from "@/types/quiz";

/** Create a new quiz session with shuffled question indices */
export function createSession(questions: Question[]): QuizSession {
  const indices = questions.map((_, i) => i);
  shuffle(indices);
  return {
    remaining: indices.slice(1),
    currentIndex: indices[0] ?? -1,
    totalQuestions: questions.length,
    correctCount: 0,
    answeredCount: 0,
  };
}

/** Advance to the next random question. Returns updated session or null if done. */
export function nextQuestion(session: QuizSession): QuizSession | null {
  if (session.remaining.length === 0) return null;
  const [next, ...rest] = session.remaining;
  return {
    ...session,
    currentIndex: next,
    remaining: rest,
  };
}

/** Check if the user's answer matches any accepted answer (case-insensitive, trimmed) */
export function checkAnswer(question: Question, userAnswer: string): boolean {
  const normalised = userAnswer.trim().toLowerCase();
  return question.answers.some((a) => a.trim().toLowerCase() === normalised);
}

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
