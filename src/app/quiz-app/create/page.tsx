'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizzes } from '@/lib/useQuizzes';
import {
  QuestionType,
  MultipleChoiceFormData,
  ShortAnswerFormData,
  LongAnswerFormData,
} from '@/lib/quizTypes';
import QuestionForm from '../components/QuestionForm';
import QuestionItem from '../components/QuestionItem';
import QuestionImportModal from '../components/QuestionImportModal';

export default function CreateQuizPage() {
  const router = useRouter();
  const {
    createQuiz,
    addMultipleChoiceQuestion,
    addShortAnswerQuestion,
    addLongAnswerQuestion,
    updateQuestion,
    updateQuiz,
    deleteQuestion,
    reorderQuestions,
    getQuiz,
    isLoaded,
  } = useQuizzes();

  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addingQuestionType, setAddingQuestionType] = useState<QuestionType | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const quiz = currentQuizId && isLoaded ? getQuiz(currentQuizId) : null;

  const handleCreateQuiz = () => {
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }
    const newQuiz = createQuiz(title.trim(), description.trim() || undefined);
    setCurrentQuizId(newQuiz.id);
  };

  const handleAddQuestion = (data: MultipleChoiceFormData | ShortAnswerFormData | LongAnswerFormData) => {
    if (!currentQuizId) return;

    if (addingQuestionType === 'multiplechoice' && 'correct' in data && 'incorrect' in data) {
      addMultipleChoiceQuestion(currentQuizId, data.question, data.correct, data.incorrect);
    } else if (addingQuestionType === 'shortanswer' && 'answer' in data && !('totalPoints' in data)) {
      addShortAnswerQuestion(currentQuizId, data.question, data.answer);
    } else if (addingQuestionType === 'longanswer' && 'answer' in data && 'totalPoints' in data) {
      addLongAnswerQuestion(currentQuizId, data.question, data.answer, data.totalPoints);
    }

    setAddingQuestionType(null);
  };

  const handleUpdateQuestion = (questionId: string, type: QuestionType, data: MultipleChoiceFormData | ShortAnswerFormData | LongAnswerFormData) => {
    if (!currentQuizId) return;

    if (type === 'multiplechoice' && 'correct' in data && 'incorrect' in data) {
      updateQuestion(currentQuizId, questionId, type, {
        question: data.question,
        choices: {
          correct: data.correct,
          incorrect: data.incorrect,
        },
      });
    } else if (type === 'shortanswer' && 'answer' in data && !('totalPoints' in data)) {
      updateQuestion(currentQuizId, questionId, type, {
        question: data.question,
        answer: data.answer,
      });
    } else if (type === 'longanswer' && 'answer' in data && 'totalPoints' in data) {
      updateQuestion(currentQuizId, questionId, type, {
        question: data.question,
        answer: data.answer,
        totalPoints: data.totalPoints,
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

  const handleImportQuestions = (data: {
    multiplechoice?: Array<{ question: string; choices: { correct: string; incorrect: string[] } }>;
    shortanswer?: Array<{ question: string; answer: string }>;
    longanswer?: Array<{ question: string; answer: string; totalPoints: number }>;
  }) => {
    if (!currentQuizId) return;

    // Get current quiz state
    const currentQuiz = getQuiz(currentQuizId);
    if (!currentQuiz) return;

    // Build new question arrays by appending imported questions
    const newMultipleChoice = [...currentQuiz.questions.multiplechoice];
    const newShortAnswer = [...currentQuiz.questions.shortanswer];
    const newLongAnswer = [...currentQuiz.questions.longanswer];

    let importedCount = 0;

    // Import multiple choice questions
    if (data.multiplechoice) {
      for (const q of data.multiplechoice) {
        newMultipleChoice.push({
          id: `mc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${importedCount}`,
          question: q.question,
          choices: q.choices,
          order: newMultipleChoice.length,
        });
        importedCount++;
      }
    }

    // Import short answer questions
    if (data.shortanswer) {
      for (const q of data.shortanswer) {
        newShortAnswer.push({
          id: `sa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${importedCount}`,
          question: q.question,
          answer: q.answer,
          order: newShortAnswer.length,
        });
        importedCount++;
      }
    }

    // Import long answer questions
    if (data.longanswer) {
      for (const q of data.longanswer) {
        newLongAnswer.push({
          id: `la-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${importedCount}`,
          question: q.question,
          answer: q.answer,
          totalPoints: q.totalPoints,
          order: newLongAnswer.length,
        });
        importedCount++;
      }
    }

    // Single state update with all imported questions
    updateQuiz(currentQuizId, {
      questions: {
        multiplechoice: newMultipleChoice,
        shortanswer: newShortAnswer,
        longanswer: newLongAnswer,
      },
    });

    setShowImportModal(false);
    alert(`Successfully imported ${importedCount} question${importedCount !== 1 ? 's' : ''}!`);
  };

  const handleFinish = () => {
    if (!quiz) return;

    const totalQuestions = quiz.questions.multiplechoice.length + quiz.questions.shortanswer.length + quiz.questions.longanswer.length;
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
                Total questions: {(quiz?.questions.multiplechoice.length || 0) + (quiz?.questions.shortanswer.length || 0) + (quiz?.questions.longanswer.length || 0)}
              </p>
            </div>

            {/* Add Question Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Add a Question:</h3>

              {!addingQuestionType ? (
                <>
                  <div className="flex gap-4 mb-4">
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
                    <button
                      onClick={() => setAddingQuestionType('longanswer')}
                      className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90"
                    >
                      Long Answer
                    </button>
                  </div>
                  <div className="pt-4 border-t border-primary/10">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                    >
                      Import JSON
                    </button>
                  </div>
                </>
              ) : (
                <QuestionForm
                  type={addingQuestionType}
                  onSave={handleAddQuestion}
                  onCancel={() => setAddingQuestionType(null)}
                />
              )}
            </div>

            {/* Import Modal */}
            {showImportModal && (
              <QuestionImportModal
                onImport={handleImportQuestions}
                onCancel={() => setShowImportModal(false)}
              />
            )}

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

            {/* Long Answer Questions */}
            {quiz && quiz.questions.longanswer.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Long Answer Questions ({quiz.questions.longanswer.length})
                </h3>
                {quiz.questions.longanswer
                  .sort((a, b) => a.order - b.order)
                  .map((q, index) => (
                    <QuestionItem
                      key={q.id}
                      question={q}
                      type="longanswer"
                      index={index}
                      total={quiz.questions.longanswer.length}
                      onUpdate={(data) => handleUpdateQuestion(q.id, 'longanswer', data)}
                      onDelete={() => handleDeleteQuestion(q.id, 'longanswer')}
                      onMoveUp={() => handleReorder(q.id, 'longanswer', 'up')}
                      onMoveDown={() => handleReorder(q.id, 'longanswer', 'down')}
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
