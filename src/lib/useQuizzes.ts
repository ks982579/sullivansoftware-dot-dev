'use client';

import { useState, useEffect } from 'react';
import { Quiz, MultipleChoiceQuestion, ShortAnswerQuestion, QuizTemplateData } from './quizTypes';

const STORAGE_KEY = 'quizzes';

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load quizzes from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setQuizzes(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse quizzes from localStorage:', error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save quizzes to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
    }
  }, [quizzes, isLoaded]);

  // Create a new quiz
  const createQuiz = (title: string, description?: string): Quiz => {
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      questions: {
        multiplechoice: [],
        shortanswer: [],
      },
      createdAt: Date.now(),
    };
    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  };

  // Get a quiz by ID
  const getQuiz = (id: string): Quiz | undefined => {
    return quizzes.find(q => q.id === id);
  };

  // Update a quiz
  const updateQuiz = (id: string, updates: Partial<Quiz>): void => {
    setQuizzes(prev =>
      prev.map(quiz => (quiz.id === id ? { ...quiz, ...updates } : quiz))
    );
  };

  // Delete a quiz
  const deleteQuiz = (id: string): void => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  // Import quiz from JSON or template
  const importQuiz = (quizData: QuizTemplateData): Quiz => {
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: quizData.title || 'Untitled Quiz',
      description: quizData.description,
      questions: {
        multiplechoice: (quizData.questions?.multiplechoice || []).map((q, idx) => ({
          id: `mc-${Date.now()}-${idx}`,
          question: q.question,
          choices: q.choices,
          order: idx,
        })),
        shortanswer: (quizData.questions?.shortanswer || []).map((q, idx) => ({
          id: `sa-${Date.now()}-${idx}`,
          question: q.question,
          answer: q.answer,
          order: idx,
        })),
      },
      createdAt: Date.now(),
    };
    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  };

  // Export quiz to JSON format
  const exportQuiz = (id: string): string => {
    const quiz = getQuiz(id);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    return JSON.stringify(quiz, null, 2);
  };

  // Add a multiple choice question
  const addMultipleChoiceQuestion = (
    quizId: string,
    question: string,
    correct: string,
    incorrect: string[]
  ): void => {
    const quiz = getQuiz(quizId);
    if (!quiz) return;

    const newQuestion: MultipleChoiceQuestion = {
      id: `mc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question,
      choices: { correct, incorrect },
      order: quiz.questions.multiplechoice.length,
    };

    updateQuiz(quizId, {
      questions: {
        ...quiz.questions,
        multiplechoice: [...quiz.questions.multiplechoice, newQuestion],
      },
    });
  };

  // Add a short answer question
  const addShortAnswerQuestion = (
    quizId: string,
    question: string,
    answer: string
  ): void => {
    const quiz = getQuiz(quizId);
    if (!quiz) return;

    const newQuestion: ShortAnswerQuestion = {
      id: `sa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question,
      answer,
      order: quiz.questions.shortanswer.length,
    };

    updateQuiz(quizId, {
      questions: {
        ...quiz.questions,
        shortanswer: [...quiz.questions.shortanswer, newQuestion],
      },
    });
  };

  // Update a question
  const updateQuestion = (
    quizId: string,
    questionId: string,
    type: 'multiplechoice' | 'shortanswer',
    updates: Partial<MultipleChoiceQuestion | ShortAnswerQuestion>
  ): void => {
    const quiz = getQuiz(quizId);
    if (!quiz) return;

    if (type === 'multiplechoice') {
      updateQuiz(quizId, {
        questions: {
          ...quiz.questions,
          multiplechoice: quiz.questions.multiplechoice.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        },
      });
    } else {
      updateQuiz(quizId, {
        questions: {
          ...quiz.questions,
          shortanswer: quiz.questions.shortanswer.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        },
      });
    }
  };

  // Delete a question
  const deleteQuestion = (
    quizId: string,
    questionId: string,
    type: 'multiplechoice' | 'shortanswer'
  ): void => {
    const quiz = getQuiz(quizId);
    if (!quiz) return;

    if (type === 'multiplechoice') {
      const filtered = quiz.questions.multiplechoice.filter(q => q.id !== questionId);
      // Reorder remaining questions
      const reordered = filtered.map((q, idx) => ({ ...q, order: idx }));
      updateQuiz(quizId, {
        questions: {
          ...quiz.questions,
          multiplechoice: reordered,
        },
      });
    } else {
      const filtered = quiz.questions.shortanswer.filter(q => q.id !== questionId);
      const reordered = filtered.map((q, idx) => ({ ...q, order: idx }));
      updateQuiz(quizId, {
        questions: {
          ...quiz.questions,
          shortanswer: reordered,
        },
      });
    }
  };

  // Reorder questions within a type
  const reorderQuestions = (
    quizId: string,
    type: 'multiplechoice' | 'shortanswer',
    questionId: string,
    direction: 'up' | 'down'
  ): void => {
    const quiz = getQuiz(quizId);
    if (!quiz) return;

    const questions = type === 'multiplechoice'
      ? quiz.questions.multiplechoice
      : quiz.questions.shortanswer;

    const index = questions.findIndex(q => q.id === questionId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const reordered = [...questions];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    // Update order property
    const final = reordered.map((q, idx) => ({ ...q, order: idx }));

    if (type === 'multiplechoice') {
      updateQuiz(quizId, {
        questions: {
          ...quiz.questions,
          multiplechoice: final as MultipleChoiceQuestion[],
        },
      });
    } else {
      updateQuiz(quizId, {
        questions: {
          ...quiz.questions,
          shortanswer: final as ShortAnswerQuestion[],
        },
      });
    }
  };

  return {
    quizzes,
    isLoaded,
    createQuiz,
    getQuiz,
    updateQuiz,
    deleteQuiz,
    importQuiz,
    exportQuiz,
    addMultipleChoiceQuestion,
    addShortAnswerQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  };
}
