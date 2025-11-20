'use client';

import { TodoType } from '@/lib/useTodos';
import { useState } from 'react';

interface TodoFormProps {
  onAdd: (title: string, type: TodoType) => void;
  defaultType?: TodoType;
  showTypeSelector?: boolean;
}

export const TodoForm = ({
  onAdd,
  defaultType = 'task',
  showTypeSelector = true,
}: TodoFormProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TodoType>(defaultType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, type);
      setTitle('');
      if (defaultType) {
        setType(defaultType);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 bg-paper rounded-lg border-2 border-primary/20 hover:border-primary/30 transition-all duration-200 hover:shadow-md relative group shadow-sm"
    >
      {/* Subtle corner accent */}
      <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-primary/20 rounded-bl opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new item..."
        className="flex-1 px-4 py-2 bg-white border-2 border-primary/20 rounded focus:outline-none focus:border-primary transition-colors duration-200 shadow-sm"
      />

      {showTypeSelector && (
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TodoType)}
          className="px-4 py-2 bg-white border-2 border-primary/20 rounded focus:outline-none focus:border-primary transition-colors duration-200 text-text-primary font-medium shadow-sm"
        >
          <option value="project">Project</option>
          <option value="epic">Epic</option>
          <option value="story">Story</option>
          <option value="task">Task</option>
        </select>
      )}

      <button
        type="submit"
        disabled={!title.trim()}
        className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:translate-y-0 disabled:hover:scale-100 flex-shrink-0"
      >
        Add
      </button>
    </form>
  );
};
