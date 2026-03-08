import { QuizData, QuizSet, Question } from "@/types/quiz";

const STORAGE_KEY = "examYada_quizData";

/** Load quiz data from localStorage, returning default empty structure if none exists */
export function loadQuizData(): QuizData {
  if (typeof window === "undefined") return { sets: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sets: [] };
    return JSON.parse(raw) as QuizData;
  } catch {
    return { sets: [] };
  }
}

/** Persist quiz data to localStorage */
export function saveQuizData(data: QuizData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Clear all stored data */
export function resetAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Create a new quiz set and persist it */
export function createQuizSet(name: string): QuizSet {
  const data = loadQuizData();
  const newSet: QuizSet = {
    id: generateId(),
    name: name.trim(),
    questions: [],
  };
  data.sets.push(newSet);
  saveQuizData(data);
  return newSet;
}

/** Delete a quiz set by id */
export function deleteQuizSet(setId: string): void {
  const data = loadQuizData();
  data.sets = data.sets.filter((s) => s.id !== setId);
  saveQuizData(data);
}

/** Add a question to a quiz set (supports multiple images per question) */
export function addQuestion(
  setId: string,
  images: string[],
  answers: string[]
): Question {
  const data = loadQuizData();
  const set = data.sets.find((s) => s.id === setId);
  if (!set) throw new Error("Quiz set not found");

  const question: Question = {
    id: generateId(),
    images,
    answers: answers.map((a) => a.trim()).filter(Boolean),
  };
  set.questions.push(question);
  saveQuizData(data);
  return question;
}

/** Remove a question from a quiz set */
export function deleteQuestion(setId: string, questionId: string): void {
  const data = loadQuizData();
  const set = data.sets.find((s) => s.id === setId);
  if (!set) return;
  set.questions = set.questions.filter((q) => q.id !== questionId);
  saveQuizData(data);
}

/** Get a specific quiz set by id */
export function getQuizSet(setId: string): QuizSet | undefined {
  const data = loadQuizData();
  return data.sets.find((s) => s.id === setId);
}

/** Generate a simple unique id */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
