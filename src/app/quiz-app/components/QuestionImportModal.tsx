'use client';

import { useState } from 'react';

interface QuestionImportModalProps {
  onImport: (data: {
    multiplechoice?: Array<{ question: string; choices: { correct: string; incorrect: string[] } }>;
    shortanswer?: Array<{ question: string; answer: string }>;
    longanswer?: Array<{ question: string; answer: string; totalPoints: number }>;
  }) => void;
  onCancel: () => void;
}

export default function QuestionImportModal({ onImport, onCancel }: QuestionImportModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonInput(text);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const validateAndImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      // Check if questions object exists
      if (!parsed.questions || typeof parsed.questions !== 'object') {
        setError('JSON must contain a "questions" object');
        return;
      }

      const { questions } = parsed;
      const result: {
        multiplechoice?: Array<{ question: string; choices: { correct: string; incorrect: string[] } }>;
        shortanswer?: Array<{ question: string; answer: string }>;
        longanswer?: Array<{ question: string; answer: string; totalPoints: number }>;
      } = {};

      // Validate and extract multiple choice questions
      if (questions.multiplechoice && Array.isArray(questions.multiplechoice)) {
        result.multiplechoice = [];
        for (const q of questions.multiplechoice) {
          if (!q.question || !q.choices?.correct || !Array.isArray(q.choices?.incorrect)) {
            setError('Invalid multiple choice question format. Each question must have: question, choices.correct, choices.incorrect[]');
            return;
          }
          // Only extract the fields we need, ignore order and extra fields
          result.multiplechoice.push({
            question: q.question,
            choices: {
              correct: q.choices.correct,
              incorrect: q.choices.incorrect,
            },
          });
        }
      }

      // Validate and extract short answer questions
      if (questions.shortanswer && Array.isArray(questions.shortanswer)) {
        result.shortanswer = [];
        for (const q of questions.shortanswer) {
          if (!q.question || !q.answer) {
            setError('Invalid short answer question format. Each question must have: question, answer');
            return;
          }
          // Only extract the fields we need, ignore order and extra fields
          result.shortanswer.push({
            question: q.question,
            answer: q.answer,
          });
        }
      }

      // Validate and extract long answer questions
      if (questions.longanswer && Array.isArray(questions.longanswer)) {
        result.longanswer = [];
        for (const q of questions.longanswer) {
          if (!q.question || !q.answer || typeof q.totalPoints !== 'number') {
            setError('Invalid long answer question format. Each question must have: question, answer, totalPoints (number)');
            return;
          }
          // Only extract the fields we need, ignore order and extra fields
          result.longanswer.push({
            question: q.question,
            answer: q.answer,
            totalPoints: q.totalPoints,
          });
        }
      }

      // Check if at least one question type was provided
      const totalQuestions = (result.multiplechoice?.length || 0) +
                            (result.shortanswer?.length || 0) +
                            (result.longanswer?.length || 0);

      if (totalQuestions === 0) {
        setError('No valid questions found. JSON must contain at least one question in multiplechoice, shortanswer, or longanswer arrays.');
        return;
      }

      // Import successful
      onImport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-primary/30 p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-secondary mb-4">Import Questions from JSON</h2>

        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-2">
            Upload a JSON file or paste JSON below. Expected format:
          </p>
          <pre className="text-xs bg-background p-3 rounded mb-4 overflow-x-auto">
{`{
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
          <p className="text-xs text-text-secondary mb-4">
            Extra fields (like &quot;title&quot;, &quot;description&quot;) and &quot;order&quot; fields will be ignored. Questions will be appended to existing questions.
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Upload JSON File</label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="w-full p-2 border-2 border-primary/20 rounded-lg"
          />
        </div>

        {/* Text Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Or Paste JSON</label>
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setError('');
            }}
            className="w-full h-64 p-3 border-2 border-primary/20 rounded-lg font-mono text-sm focus:border-primary focus:outline-none"
            placeholder="Paste JSON here..."
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={validateAndImport}
            disabled={!jsonInput.trim()}
            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Questions
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
