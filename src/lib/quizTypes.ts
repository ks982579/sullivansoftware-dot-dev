// Quiz application type definitions

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  choices: {
    correct: string;
    incorrect: string[];
  };
  order: number;
}

export interface ShortAnswerQuestion {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface LongAnswerQuestion {
  id: string;
  question: string;
  answer: string;
  totalPoints: number;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: {
    multiplechoice: MultipleChoiceQuestion[];
    shortanswer: ShortAnswerQuestion[];
    longanswer: LongAnswerQuestion[];
  };
  createdAt: number;
}

export interface QuizAnswer {
  questionId: string;
  type: 'multiplechoice' | 'shortanswer' | 'longanswer';
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect?: boolean; // undefined for short/long answer (manual grading)
  choices?: string[]; // for multiple choice, to remember what was shown
  totalPoints?: number; // for long answer questions
}

export interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  startedAt: number;
  completedAt?: number;
  timeSpent: number; // in seconds
  answers: QuizAnswer[];
  settings: {
    randomize: boolean;
    questionCount: number | 'all';
  };
}

export type QuestionType = 'multiplechoice' | 'shortanswer' | 'longanswer';

// Template data as stored on disk (no id or createdAt)
export interface QuizTemplateData {
  title: string;
  description?: string;
  questions: {
    multiplechoice: Array<{ question: string; choices: { correct: string; incorrect: string[] } }>;
    shortanswer: Array<{ question: string; answer: string }>;
    longanswer: Array<{ question: string; answer: string; totalPoints: number }>;
  };
}

// Form data types for creating/editing questions
export interface MultipleChoiceFormData {
  question: string;
  correct: string;
  incorrect: string[];
}

export interface ShortAnswerFormData {
  question: string;
  answer: string;
}

export interface LongAnswerFormData {
  question: string;
  answer: string;
  totalPoints: number;
}
