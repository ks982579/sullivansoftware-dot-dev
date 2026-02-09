'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuizzes } from '@/lib/useQuizzes';
import { QuizTemplateData } from '@/lib/quizTypes';

interface QuizAppClientProps {
  templates: QuizTemplateData[];
}

export default function QuizAppClient({ templates }: QuizAppClientProps) {
  const router = useRouter();
  const { quizzes, deleteQuiz, exportQuiz, importQuiz } = useQuizzes();
  const [showJSONImport, setShowJSONImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleCreateQuiz = () => {
    router.push('/quiz-app/create');
  };

  const handleJSONImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      // Basic validation
      if (!parsed.title) {
        setJsonError('Quiz must have a title');
        return;
      }
      if (!parsed.questions) {
        setJsonError('Quiz must have a questions object');
        return;
      }

      // Validate question structure
      const mc = parsed.questions.multiplechoice || [];
      const sa = parsed.questions.shortanswer || [];
      const la = parsed.questions.longanswer || [];

      for (const q of mc) {
        if (!q.question || !q.choices?.correct || !Array.isArray(q.choices?.incorrect)) {
          setJsonError('Invalid multiple choice question format');
          return;
        }
      }

      for (const q of sa) {
        if (!q.question || !q.answer) {
          setJsonError('Invalid short answer question format');
          return;
        }
      }

      for (const q of la) {
        if (!q.question || !q.answer || typeof q.totalPoints !== 'number') {
          setJsonError('Invalid long answer question format');
          return;
        }
      }

      // Import the quiz
      importQuiz(parsed);

      setJsonInput('');
      setJsonError('');
      setShowJSONImport(false);
      alert('Quiz imported successfully!');
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  };

  const handleLoadTemplate = (template: QuizTemplateData) => {
    importQuiz(template);
    alert(`"${template.title}" loaded successfully!`);
  };

  const handleDeleteQuiz = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteQuiz(id);
    }
  };

  const handleExportQuiz = (id: string, title: string) => {
    try {
      const json = exportQuiz(id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export quiz');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-secondary mb-8">Quiz App</h1>

        {/* Create Quiz Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-4">Create a Quiz</h2>

          <div className="p-6 bg-paper rounded-lg border-2 border-primary/20">
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleCreateQuiz}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                Create New Quiz
              </button>
              <button
                onClick={() => setShowJSONImport(!showJSONImport)}
                className="px-6 py-3 bg-accent-orange text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
              >
                Import from JSON
              </button>
            </div>

            {/* Use a template */}
            {templates.length > 0 && (
              <div className="pt-4 border-t border-primary/10">
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Use a template</h3>
                <div className="flex flex-wrap gap-2">
                  {templates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadTemplate(template)}
                      className="px-4 py-2 bg-secondary text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showJSONImport && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Import Quiz JSON</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Paste your quiz JSON here. Format:
                </p>
                <pre className="text-xs bg-background p-3 rounded mb-4 overflow-x-auto">
{`{
  "title": "Quiz Title",
  "description": "Optional description",
  "questions": {
    "multiplechoice": [
      {
        "question": "Question text",
        "choices": {
          "correct": "Correct answer",
          "incorrect": ["Wrong 1", "Wrong 2"]
        }
      }
    ],
    "shortanswer": [
      {
        "question": "Question text",
        "answer": "Correct answer"
      }
    ],
    "longanswer": [
      {
        "question": "Question text",
        "answer": "Correct answer",
        "totalPoints": 10
      }
    ]
  }
}`}
                </pre>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError('');
                  }}
                  className="w-full h-48 p-3 border-2 border-primary/20 rounded-lg font-mono text-sm"
                  placeholder="Paste JSON here..."
                />
                {jsonError && (
                  <p className="text-red-600 mt-2 text-sm">{jsonError}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleJSONImport}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Import
                  </button>
                  <button
                    onClick={() => {
                      setShowJSONImport(false);
                      setJsonInput('');
                      setJsonError('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Take Quiz Section */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-4">Your Quizzes</h2>

          {quizzes.length === 0 ? (
            <p className="text-text-secondary">No quizzes yet. Create one to get started!</p>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => {
                const totalQuestions =
                  quiz.questions.multiplechoice.length +
                  quiz.questions.shortanswer.length +
                  quiz.questions.longanswer.length;

                return (
                  <div
                    key={quiz.id}
                    className="p-6 bg-paper rounded-lg border-2 border-primary/20 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-secondary">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-sm text-text-secondary mt-1">
                            {quiz.description}
                          </p>
                        )}
                        <p className="text-sm text-text-secondary mt-2">
                          {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => router.push(`/quiz-app/take/${quiz.id}`)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold"
                      >
                        Take Quiz
                      </button>
                      <button
                        onClick={() => router.push(`/quiz-app/edit/${quiz.id}`)}
                        className="px-4 py-2 bg-accent-orange text-white rounded-lg hover:bg-accent-orange/90"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleExportQuiz(quiz.id, quiz.title)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Export JSON
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
