import { Question, QuizSession } from "@/types/quiz";

/** Create a new quiz session with shuffled question indices.
 *  @param count - how many questions to include (defaults to all) */
export function createSession(questions: Question[], count?: number): QuizSession {
  const total = Math.min(count ?? questions.length, questions.length);
  const indices = questions.map((_, i) => i);
  shuffle(indices);
  const selected = indices.slice(0, total);
  return {
    remaining: selected.slice(1),
    currentIndex: selected[0] ?? -1,
    totalQuestions: total,
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

/** Pick a random image from a question's images array */
export function pickRandomImage(question: Question): string {
  const idx = Math.floor(Math.random() * question.images.length);
  return question.images[idx];
}

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
