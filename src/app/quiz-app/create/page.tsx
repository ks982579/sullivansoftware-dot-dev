'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizzes } from '@/lib/useQuizzes';
import {
  QuestionType,
  MultipleChoiceFormData,
  ShortAnswerFormData,
} from '@/lib/quizTypes';
import QuestionForm from '../components/QuestionForm';
import QuestionItem from '../components/QuestionItem';

export default function CreateQuizPage() {
  const router = useRouter();
  const {
    createQuiz,
    addMultipleChoiceQuestion,
    addShortAnswerQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    getQuiz,
  } = useQuizzes();

  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addingQuestionType, setAddingQuestionType] = useState<QuestionType | null>(null);

  const quiz = currentQuizId ? getQuiz(currentQuizId) : null;

  const handleCreateQuiz = () => {
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }
    const newQuiz = createQuiz(title.trim(), description.trim() || undefined);
    setCurrentQuizId(newQuiz.id);
  };

  const handleAddQuestion = (data: MultipleChoiceFormData | ShortAnswerFormData) => {
    if (!currentQuizId) return;

    if (addingQuestionType === 'multiplechoice' && 'correct' in data && 'incorrect' in data) {
      addMultipleChoiceQuestion(currentQuizId, data.question, data.correct, data.incorrect);
    } else if (addingQuestionType === 'shortanswer' && 'answer' in data) {
      addShortAnswerQuestion(currentQuizId, data.question, data.answer);
    }

    setAddingQuestionType(null);
  };

  const handleUpdateQuestion = (questionId: string, type: QuestionType, data: MultipleChoiceFormData | ShortAnswerFormData) => {
    if (!currentQuizId) return;

    if (type === 'multiplechoice' && 'correct' in data && 'incorrect' in data) {
      updateQuestion(currentQuizId, questionId, type, {
        question: data.question,
        choices: {
          correct: data.correct,
          incorrect: data.incorrect,
        },
      });
    } else if (type === 'shortanswer' && 'answer' in data) {
      updateQuestion(currentQuizId, questionId, type, {
        question: data.question,
        answer: data.answer,
      });
    }
  };

  const handleDeleteQuestion = (questionId: string, type: QuestionType) => {
    if (!currentQuizId) return;
    deleteQuestion(currentQuizId, questionId, type);
  };

  const handleReorder = (questionId: string, type: QuestionType, direction: 'up' | 'down') => {
    if (!currentQuizId) return;
    reorderQuestions(currentQuizId, type, questionId, direction);
  };

  const handleFinish = () => {
    if (!quiz) return;

    const totalQuestions = quiz.questions.multiplechoice.length + quiz.questions.shortanswer.length;
    if (totalQuestions === 0) {
      alert('Please add at least one question before finishing');
      return;
    }

    router.push('/quiz-app');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-secondary mb-8">Create New Quiz</h1>

        {!currentQuizId ? (
          <div className="p-6 bg-paper rounded-lg border-2 border-primary/20">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Quiz Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                placeholder="Enter quiz title..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                rows={3}
                placeholder="Enter quiz description..."
              />
            </div>
            <button
              onClick={handleCreateQuiz}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
            >
              Continue to Add Questions
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 p-6 bg-paper rounded-lg border-2 border-primary/20">
              <h2 className="text-2xl font-bold text-secondary">{quiz?.title}</h2>
              {quiz?.description && (
                <p className="text-text-secondary mt-2">{quiz.description}</p>
              )}
              <p className="text-sm text-text-secondary mt-2">
                Total questions: {(quiz?.questions.multiplechoice.length || 0) + (quiz?.questions.shortanswer.length || 0)}
              </p>
            </div>

            {/* Add Question Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Add a Question:</h3>

              {!addingQuestionType ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => setAddingQuestionType('multiplechoice')}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
                  >
                    Multiple Choice
                  </button>
                  <button
                    onClick={() => setAddingQuestionType('shortanswer')}
                    className="px-6 py-3 bg-accent-orange text-white font-semibold rounded-lg hover:bg-accent-orange/90"
                  >
                    Short Answer
                  </button>
                </div>
              ) : (
                <QuestionForm
                  type={addingQuestionType}
                  onSave={handleAddQuestion}
                  onCancel={() => setAddingQuestionType(null)}
                />
              )}
            </div>

            {/* Multiple Choice Questions */}
            {quiz && quiz.questions.multiplechoice.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Multiple Choice Questions ({quiz.questions.multiplechoice.length})
                </h3>
                {quiz.questions.multiplechoice
                  .sort((a, b) => a.order - b.order)
                  .map((q, index) => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      type="multiplechoice"
                      index={index}
                      total={quiz.questions.multiplechoice.length}
                      onUpdate={(data) => handleUpdateQuestion(q.id, 'multiplechoice', data)}
                      onDelete={() => handleDeleteQuestion(q.id, 'multiplechoice')}
                      onMoveUp={() => handleReorder(q.id, 'multiplechoice', 'up')}
                      onMoveDown={() => handleReorder(q.id, 'multiplechoice', 'down')}
                    />
                  ))}
              </div>
            )}

            {/* Short Answer Questions */}
            {quiz && quiz.questions.shortanswer.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Short Answer Questions ({quiz.questions.shortanswer.length})
                </h3>
                {quiz.questions.shortanswer
                  .sort((a, b) => a.order - b.order)
                  .map((q, index) => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      type="shortanswer"
                      index={index}
                      total={quiz.questions.shortanswer.length}
                      onUpdate={(data) => handleUpdateQuestion(q.id, 'shortanswer', data)}
                      onDelete={() => handleDeleteQuestion(q.id, 'shortanswer')}
                      onMoveUp={() => handleReorder(q.id, 'shortanswer', 'up')}
                      onMoveDown={() => handleReorder(q.id, 'shortanswer', 'down')}
                    />
                  ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleFinish}
                className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
              >
                Finish Quiz
              </button>
              <button
                onClick={() => router.push('/quiz-app')}
                className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
