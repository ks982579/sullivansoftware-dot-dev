'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuizzes } from '@/lib/useQuizzes';
import { MultipleChoiceQuestion, ShortAnswerQuestion, LongAnswerQuestion, QuizAnswer } from '@/lib/quizTypes';
import QuizOptions from '../../components/QuizOptions';
import Timer from '../../components/Timer';

type QuizQuestion = {
  question: MultipleChoiceQuestion | ShortAnswerQuestion | LongAnswerQuestion;
  type: 'multiplechoice' | 'shortanswer' | 'longanswer';
  displayChoices?: string[]; // For MC, shuffled choices (max 5)
};

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { getQuiz, isLoaded } = useQuizzes();

  const quiz = isLoaded ? getQuiz(quizId) : null;

  const [showOptions, setShowOptions] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [results, setResults] = useState<QuizAnswer[]>([]);
  const [shortAnswerGrades, setShortAnswerGrades] = useState<{ [questionId: string]: 0 | 1 | 2 }>({});
  const [longAnswerGrades, setLongAnswerGrades] = useState<{ [questionId: string]: { obtained: number; total: number } }>({});

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-secondary mb-8">Quiz Not Found</h1>
          <button
            onClick={() => router.push('/quiz-app')}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const handleStartQuiz = (options: {
    randomize: boolean;
    mcCount: number | 'all';
    saCount: number | 'all';
    laCount: number | 'all';
  }) => {
    // Prepare questions based on options
    let mcQuestions = [...quiz.questions.multiplechoice];
    let saQuestions = [...quiz.questions.shortanswer];
    let laQuestions = [...quiz.questions.longanswer];

    // Randomize if needed
    if (options.randomize) {
      mcQuestions = shuffleArray(mcQuestions);
      saQuestions = shuffleArray(saQuestions);
      laQuestions = shuffleArray(laQuestions);
    }

    // Limit count
    if (options.mcCount !== 'all') {
      mcQuestions = mcQuestions.slice(0, options.mcCount);
    }
    if (options.saCount !== 'all') {
      saQuestions = saQuestions.slice(0, options.saCount);
    }
    if (options.laCount !== 'all') {
      laQuestions = laQuestions.slice(0, options.laCount);
    }

    // Prepare quiz questions with shuffled choices for MC
    const preparedQuestions: QuizQuestion[] = [
      ...mcQuestions.map((q) => {
        const allChoices = [q.choices.correct, ...q.choices.incorrect];
        const shuffled = shuffleArray([...allChoices]);
        const limited = shuffled.slice(0, Math.min(5, shuffled.length));

        return {
          question: q,
          type: 'multiplechoice' as const,
          displayChoices: limited,
        };
      }),
      ...saQuestions.map((q) => ({
        question: q,
        type: 'shortanswer' as const,
      })),
      ...laQuestions.map((q) => ({
        question: q,
        type: 'longanswer' as const,
      })),
    ];

    setQuestions(preparedQuestions);
    setShowOptions(false);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleComplete = () => {
    // Grade the quiz
    const gradedResults: QuizAnswer[] = questions.map((q) => {
      const userAnswer = userAnswers[q.question.id] || '';

      if (q.type === 'multiplechoice' && 'choices' in q.question) {
        const correct = q.question.choices.correct;
        const isCorrect = userAnswer === correct;

        return {
          questionId: q.question.id,
          type: 'multiplechoice',
          question: q.question.question,
          userAnswer,
          correctAnswer: correct,
          isCorrect,
          choices: q.displayChoices,
        };
      } else if (q.type === 'shortanswer' && 'answer' in q.question && !('totalPoints' in q.question)) {
        return {
          questionId: q.question.id,
          type: 'shortanswer',
          question: q.question.question,
          userAnswer,
          correctAnswer: q.question.answer,
          isCorrect: undefined, // Manual grading needed
        };
      } else if (q.type === 'longanswer' && 'answer' in q.question && 'totalPoints' in q.question) {
        return {
          questionId: q.question.id,
          type: 'longanswer',
          question: q.question.question,
          userAnswer,
          correctAnswer: q.question.answer,
          isCorrect: undefined, // Manual grading needed
          totalPoints: q.question.totalPoints,
        };
      }

      // Fallback
      return {
        questionId: q.question.id,
        type: q.type,
        question: q.question.question,
        userAnswer,
        correctAnswer: '',
      };
    });

    setResults(gradedResults);
    setQuizCompleted(true);
  };

  const handleGradeShortAnswer = (questionId: string, grade: 0 | 1 | 2) => {
    setShortAnswerGrades((prev) => ({
      ...prev,
      [questionId]: grade,
    }));
  };

  const handleGradeLongAnswer = (questionId: string, obtained: number, total: number) => {
    setLongAnswerGrades((prev) => ({
      ...prev,
      [questionId]: { obtained, total },
    }));
  };

  // Helper function to shuffle array
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  if (showOptions) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <QuizOptions
          totalMultipleChoice={quiz.questions.multiplechoice.length}
          totalShortAnswer={quiz.questions.shortanswer.length}
          totalLongAnswer={quiz.questions.longanswer.length}
          onStart={handleStartQuiz}
          onCancel={() => router.push('/quiz-app')}
        />
      </div>
    );
  }

  if (quizCompleted) {
    // Results view
    const mcResults = results.filter((r) => r.type === 'multiplechoice');
    const saResults = results.filter((r) => r.type === 'shortanswer');
    const laResults = results.filter((r) => r.type === 'longanswer');
    const correctCount = mcResults.filter((r) => r.isCorrect).length;
    const totalMc = mcResults.length;

    // Calculate short answer score
    const totalSaPoints = saResults.length * 2;
    const earnedSaPoints = saResults.reduce((sum, result) => {
      const grade = shortAnswerGrades[result.questionId];
      return sum + (grade !== undefined ? grade : 0);
    }, 0);
    const gradedSaCount = Object.keys(shortAnswerGrades).length;

    // Calculate long answer score
    const totalLaPoints = laResults.reduce((sum, result) => sum + (result.totalPoints || 0), 0);
    const earnedLaPoints = laResults.reduce((sum, result) => {
      const grade = longAnswerGrades[result.questionId];
      return sum + (grade?.obtained || 0);
    }, 0);
    const gradedLaCount = Object.keys(longAnswerGrades).length;

    // Calculate final grade
    const totalPoints = totalMc + totalSaPoints + totalLaPoints;
    const earnedPoints = correctCount + earnedSaPoints + earnedLaPoints;

    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-secondary mb-4">{quiz.title} - Results</h1>
          <div className="mb-6 p-4 bg-paper rounded-lg border-2 border-primary/20">
            <p className="text-lg">
              <strong>Time:</strong> {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </p>
            {totalMc > 0 && (
              <p className="text-lg">
                <strong>Multiple Choice Score:</strong> {correctCount} / {totalMc} (
                {((correctCount / totalMc) * 100).toFixed(1)}%)
              </p>
            )}
            {saResults.length > 0 && (
              <p className="text-lg">
                <strong>Short Answer Score:</strong>{' '}
                {gradedSaCount === 0
                  ? 'Not Graded'
                  : `${earnedSaPoints} / ${totalSaPoints} (${((earnedSaPoints / totalSaPoints) * 100).toFixed(1)}%)`}
              </p>
            )}
            {laResults.length > 0 && (
              <p className="text-lg">
                <strong>Long Answer Score:</strong>{' '}
                {gradedLaCount === 0
                  ? 'Not Graded'
                  : `${earnedLaPoints} / ${totalLaPoints} (${((earnedLaPoints / totalLaPoints) * 100).toFixed(1)}%)`}
              </p>
            )}
            {totalPoints > 0 && (
              <p className="text-lg font-semibold mt-3 pt-3 border-t-2 border-primary/20">
                <strong>Final Grade:</strong> {earnedPoints} / {totalPoints} (
                {((earnedPoints / totalPoints) * 100).toFixed(1)}%)
              </p>
            )}
          </div>

          {/* Multiple Choice Results */}
          {mcResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Multiple Choice</h2>
              {mcResults.map((result, index) => (
                <div
                  key={result.questionId}
                  className="mb-4 p-4 bg-paper rounded-lg border-2 border-primary/20"
                >
                  <p className="font-semibold mb-3">
                    {index + 1}. {result.question}
                  </p>
                  <div className="space-y-2">
                    {result.choices?.map((choice, idx) => {
                      const isUserAnswer = choice === result.userAnswer;
                      const isCorrect = choice === result.correctAnswer;

                      let bgColor = 'bg-gray-100';
                      let icon = '';

                      if (isCorrect) {
                        bgColor = 'bg-green-100 border-2 border-green-500';
                        icon = '✓';
                      } else if (isUserAnswer && !isCorrect) {
                        bgColor = 'bg-red-100 border-2 border-red-500';
                        icon = '✗';
                      }

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded ${bgColor} flex items-center gap-2`}
                        >
                          <span className="font-bold text-lg w-6">{icon}</span>
                          <span>{choice}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Short Answer Results */}
          {saResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Short Answer</h2>
              {saResults.map((result, index) => {
                const currentGrade = shortAnswerGrades[result.questionId];
                return (
                  <div
                    key={result.questionId}
                    className="mb-4 p-4 bg-paper rounded-lg border-2 border-primary/20"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold mb-3">
                          {index + 1}. {result.question}
                        </p>
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-600">Your Answer:</p>
                          <p className="p-2 bg-gray-100 rounded whitespace-pre-wrap">
                            {result.userAnswer || '(No answer provided)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Correct Answer:</p>
                          <p className="p-2 bg-green-50 rounded border border-green-200 whitespace-pre-wrap">
                            {result.correctAnswer}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleGradeShortAnswer(result.questionId, 2)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentGrade === 2
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          Correct
                        </button>
                        <button
                          onClick={() => handleGradeShortAnswer(result.questionId, 1)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentGrade === 1
                              ? 'bg-yellow-600 text-white shadow-md'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          Partial
                        </button>
                        <button
                          onClick={() => handleGradeShortAnswer(result.questionId, 0)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            currentGrade === 0
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          Incorrect
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Long Answer Results */}
          {laResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">Long Answer</h2>
              {laResults.map((result, index) => {
                const currentGrade = longAnswerGrades[result.questionId];
                const totalPoints = result.totalPoints || 0;
                return (
                  <div
                    key={result.questionId}
                    className="mb-4 p-4 bg-paper rounded-lg border-2 border-primary/20"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold mb-3">
                          {index + 1}. {result.question}
                        </p>
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-600">Your Answer:</p>
                          <p className="p-2 bg-gray-100 rounded whitespace-pre-wrap">
                            {result.userAnswer || '(No answer provided)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Correct Answer:</p>
                          <p className="p-2 bg-green-50 rounded border border-green-200 whitespace-pre-wrap">
                            {result.correctAnswer}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Points Obtained:</label>
                          <input
                            type="number"
                            min="0"
                            max={totalPoints}
                            value={currentGrade?.obtained || 0}
                            onChange={(e) => {
                              const obtained = Math.min(totalPoints, Math.max(0, parseInt(e.target.value) || 0));
                              handleGradeLongAnswer(result.questionId, obtained, totalPoints);
                            }}
                            className="w-24 p-2 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Total Points:</label>
                          <input
                            type="number"
                            value={totalPoints}
                            disabled
                            className="w-24 p-2 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/quiz-app')}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => {
                setQuizCompleted(false);
                setShowOptions(true);
                setUserAnswers({});
                setTimeSpent(0);
                setShortAnswerGrades({});
                setLongAnswerGrades({});
              }}
              className="px-6 py-3 bg-accent-orange text-white font-semibold rounded-lg hover:bg-accent-orange/90"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  const mcQuestions = questions.filter((q) => q.type === 'multiplechoice');
  const saQuestions = questions.filter((q) => q.type === 'shortanswer');
  const laQuestions = questions.filter((q) => q.type === 'longanswer');

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-secondary">{quiz.title}</h1>
          <Timer onTimeUpdate={setTimeSpent} />
        </div>

        {/* Multiple Choice Questions */}
        {mcQuestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">Multiple Choice</h2>
            {mcQuestions.map((q, index) => {
              const mcq = q.question as MultipleChoiceQuestion;
              return (
                <div
                  key={mcq.id}
                  className="mb-6 p-6 bg-paper rounded-lg border-2 border-primary/20"
                >
                  <p className="font-semibold text-lg mb-4">
                    {index + 1}. {mcq.question}
                  </p>
                  <div className="space-y-2">
                    {q.displayChoices?.map((choice, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-background rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={mcq.id}
                          value={choice}
                          checked={userAnswers[mcq.id] === choice}
                          onChange={(e) => handleAnswerChange(mcq.id, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Short Answer Questions */}
        {saQuestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">Short Answer</h2>
            {saQuestions.map((q, index) => {
              const saq = q.question as ShortAnswerQuestion;
              return (
                <div
                  key={saq.id}
                  className="mb-6 p-6 bg-paper rounded-lg border-2 border-primary/20"
                >
                  <p className="font-semibold text-lg mb-4">
                    {index + 1}. {saq.question}
                  </p>
                  <textarea
                    value={userAnswers[saq.id] || ''}
                    onChange={(e) => handleAnswerChange(saq.id, e.target.value)}
                    className="w-full p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none whitespace-pre-wrap"
                    rows={4}
                    placeholder="Enter your answer..."
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Long Answer Questions */}
        {laQuestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">Long Answer</h2>
            {laQuestions.map((q, index) => {
              const laq = q.question as LongAnswerQuestion;
              return (
                <div
                  key={laq.id}
                  className="mb-6 p-6 bg-paper rounded-lg border-2 border-primary/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-semibold text-lg">
                      {index + 1}. {laq.question}
                    </p>
                    <span className="text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded">
                      {laq.totalPoints} points
                    </span>
                  </div>
                  <textarea
                    value={userAnswers[laq.id] || ''}
                    onChange={(e) => handleAnswerChange(laq.id, e.target.value)}
                    className="w-full p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none whitespace-pre-wrap"
                    rows={8}
                    placeholder="Enter your answer..."
                  />
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleComplete}
          className="px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 shadow-md"
        >
          Complete Quiz
        </button>
      </div>
    </div>
  );
}
