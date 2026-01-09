'use client';

import { useState } from 'react';
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
  QuestionType,
  MultipleChoiceFormData,
  ShortAnswerFormData,
} from '@/lib/quizTypes';
import QuestionForm from './QuestionForm';

interface QuestionItemProps {
  question: MultipleChoiceQuestion | ShortAnswerQuestion;
  type: QuestionType;
  index: number;
  total: number;
  onUpdate: (data: MultipleChoiceFormData | ShortAnswerFormData) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function QuestionItem({
  question,
  type,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuestionItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this question?')) {
      onDelete();
    }
  };

  const handleSave = (data: MultipleChoiceFormData | ShortAnswerFormData) => {
    onUpdate(data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <QuestionForm
        type={type}
        existingQuestion={question}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const isMultipleChoice = type === 'multiplechoice' && 'choices' in question;
  const isShortAnswer = type === 'shortanswer' && 'answer' in question;

  return (
    <div className="p-4 bg-paper rounded-lg border-2 border-primary/20 mb-3">
      <div className="flex gap-3">
        {/* Reorder buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
            title="Move up"
          >
            ▲
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
            title="Move down"
          >
            ▼
          </button>
        </div>

        {/* Question content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-secondary">
              {index + 1}. {question.question}
            </p>
            <span className="text-xs px-2 py-1 bg-accent-orange/20 text-accent-orange rounded">
              {type === 'multiplechoice' ? 'Multiple Choice' : 'Short Answer'}
            </span>
          </div>

          {isMultipleChoice && (
            <div className="mt-2 text-sm">
              <p className="text-green-700 font-medium">✓ {question.choices.correct}</p>
              {question.choices.incorrect.map((option, idx) => (
                <p key={idx} className="text-red-700">✗ {option}</p>
              ))}
            </div>
          )}

          {isShortAnswer && (
            <div className="mt-2 text-sm">
              <p className="text-green-700 font-medium">Answer: {question.answer}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
