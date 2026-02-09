'use client';

import { useState, useEffect } from 'react';
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
  LongAnswerQuestion,
  QuestionType,
  MultipleChoiceFormData,
  ShortAnswerFormData,
  LongAnswerFormData,
} from '@/lib/quizTypes';

interface QuestionFormProps {
  type: QuestionType;
  existingQuestion?: MultipleChoiceQuestion | ShortAnswerQuestion | LongAnswerQuestion;
  onSave: (data: MultipleChoiceFormData | ShortAnswerFormData | LongAnswerFormData) => void;
  onCancel: () => void;
}

export default function QuestionForm({ type, existingQuestion, onSave, onCancel }: QuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState('');
  const [incorrectOptions, setIncorrectOptions] = useState<string[]>(['', '']);
  const [totalPoints, setTotalPoints] = useState(10);

  useEffect(() => {
    if (existingQuestion) {
      setQuestion(existingQuestion.question);
      if (type === 'multiplechoice' && 'choices' in existingQuestion) {
        setCorrect(existingQuestion.choices.correct);
        setIncorrectOptions(existingQuestion.choices.incorrect.length > 0
          ? existingQuestion.choices.incorrect
          : ['', '']);
      } else if (type === 'shortanswer' && 'answer' in existingQuestion) {
        setCorrect(existingQuestion.answer);
      } else if (type === 'longanswer' && 'answer' in existingQuestion && 'totalPoints' in existingQuestion) {
        setCorrect(existingQuestion.answer);
        setTotalPoints(existingQuestion.totalPoints);
      }
    }
  }, [existingQuestion, type]);

  const handleAddIncorrectOption = () => {
    setIncorrectOptions([...incorrectOptions, '']);
  };

  const handleRemoveIncorrectOption = (index: number) => {
    if (incorrectOptions.length > 2) {
      setIncorrectOptions(incorrectOptions.filter((_, i) => i !== index));
    }
  };

  const handleIncorrectChange = (index: number, value: string) => {
    const updated = [...incorrectOptions];
    updated[index] = value;
    setIncorrectOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('Question text is required');
      return;
    }

    if (!correct.trim()) {
      alert('Correct answer is required');
      return;
    }

    if (type === 'multiplechoice') {
      const validIncorrect = incorrectOptions.filter(opt => opt.trim() !== '');
      if (validIncorrect.length < 1) {
        alert('At least one incorrect answer is required');
        return;
      }
      onSave({
        question: question.trim(),
        correct: correct.trim(),
        incorrect: validIncorrect.map(opt => opt.trim()),
      });
    } else if (type === 'shortanswer') {
      onSave({
        question: question.trim(),
        answer: correct,
      });
    } else {
      if (totalPoints < 1) {
        alert('Total points must be at least 1');
        return;
      }
      onSave({
        question: question.trim(),
        answer: correct,
        totalPoints,
      });
    }

    // Reset form
    setQuestion('');
    setCorrect('');
    setIncorrectOptions(['', '']);
    setTotalPoints(10);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-paper rounded-lg border-2 border-primary/30 mb-4">
      <h3 className="text-lg font-semibold text-secondary mb-4">
        {existingQuestion ? 'Edit' : 'Add'} {type === 'multiplechoice' ? 'Multiple Choice' : type === 'shortanswer' ? 'Short Answer' : 'Long Answer'} Question
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
          rows={3}
          placeholder="Enter your question..."
          required
        />
      </div>

      {type === 'multiplechoice' ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-green-700">
              Correct Answer
            </label>
            <textarea
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none whitespace-pre-wrap"
              rows={2}
              placeholder="Enter the correct answer..."
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-red-700">
              Incorrect Answers (min 1 required)
            </label>
            {incorrectOptions.map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  value={option}
                  onChange={(e) => handleIncorrectChange(index, e.target.value)}
                  className="flex-1 p-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:outline-none whitespace-pre-wrap"
                  rows={2}
                  placeholder={`Incorrect option ${index + 1}...`}
                />
                {incorrectOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIncorrectOption(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIncorrectOption}
              className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Add Another Option
            </button>
          </div>
        </>
      ) : type === 'shortanswer' ? (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Correct Answer</label>
          <textarea
            value={correct}
            onChange={(e) => setCorrect(e.target.value)}
            className="w-full p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none whitespace-pre-wrap"
            rows={4}
            placeholder="Enter the correct answer..."
            required
          />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Correct Answer</label>
            <textarea
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="w-full p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none whitespace-pre-wrap"
              rows={6}
              placeholder="Enter the correct answer..."
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Total Points</label>
            <input
              type="number"
              min="1"
              value={totalPoints}
              onChange={(e) => setTotalPoints(parseInt(e.target.value) || 1)}
              className="w-32 p-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:outline-none"
              required
            />
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
