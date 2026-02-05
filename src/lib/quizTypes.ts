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

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: {
    multiplechoice: MultipleChoiceQuestion[];
    shortanswer: ShortAnswerQuestion[];
  };
  createdAt: number;
}

export interface QuizAnswer {
  questionId: string;
  type: 'multiplechoice' | 'shortanswer';
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect?: boolean; // undefined for short answer (manual grading)
  choices?: string[]; // for multiple choice, to remember what was shown
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

export type QuestionType = 'multiplechoice' | 'shortanswer';

// Template data as stored on disk (no id or createdAt)
export interface QuizTemplateData {
  title: string;
  description?: string;
  questions: {
    multiplechoice: Array<{ question: string; choices: { correct: string; incorrect: string[] } }>;
    shortanswer: Array<{ question: string; answer: string }>;
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
