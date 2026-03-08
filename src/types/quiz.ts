/** Represents a single quiz question with an image and accepted answers */
export interface Question {
  id: string;
  /** Base64-encoded image data */
  image: string;
  /** List of accepted answers (case-insensitive comparison) */
  answers: string[];
}

/** A named collection of quiz questions */
export interface QuizSet {
  id: string;
  name: string;
  questions: Question[];
}

/** Root data structure persisted to storage */
export interface QuizData {
  sets: QuizSet[];
}

/** Quiz session state for tracking progress */
export interface QuizSession {
  /** Indices of remaining questions (shuffled) */
  remaining: number[];
  /** Index of the current question in the set's questions array */
  currentIndex: number;
  totalQuestions: number;
  correctCount: number;
  answeredCount: number;
}
