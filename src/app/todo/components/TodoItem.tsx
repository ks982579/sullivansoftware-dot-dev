'use client';

import { Todo } from '@/lib/useTodos';
import { useState } from 'react';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  draggable?: boolean;
}

const typeColors = {
  project: 'bg-primary/20 border-primary text-primary font-bold',
  epic: 'bg-primary/10 border-primary text-primary',
  story: 'bg-secondary/10 border-secondary text-secondary',
  task: 'bg-accent/10 border-accent text-accent',
};

const typeLabels = {
  project: 'Project',
  epic: 'Epic',
  story: 'Story',
  task: 'Task',
};

export const TodoItem = ({
  todo,
  onToggleComplete,
  onArchive,
  onDelete,
  onEdit,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggable = true,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEdit(todo.id, editTitle);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Only save if Shift is NOT pressed (Shift+Enter adds newline)
      if (!e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      }
      // If Shift is pressed, allow default behavior (newline will be added)
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setEditTitle(todo.title);
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`
        p-4 rounded-lg border-2 transition-all duration-200 select-none relative shadow-sm
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${todo.completed ? 'bg-gray-100 border-gray-300 shadow-sm' : 'bg-paper border-primary/20 hover:border-primary/40 hover:shadow-md'}
        ${draggable ? 'cursor-move' : 'cursor-default'}
      `}
    >
      {/* Subtle corner accent for non-completed items */}
      {!todo.completed && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-primary/20 rounded-tr opacity-60" />
      )}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo.id)}
          className="mt-1 w-5 h-5 accent-primary cursor-pointer rounded"
          aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            todo.type === 'task' ? (
              <textarea
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border-2 border-primary/30 rounded bg-white text-text-primary focus:outline-none focus:border-primary resize-none"
                placeholder="Enter task description..."
                rows={4}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              />
            ) : (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border-2 border-primary/30 rounded bg-white text-text-primary focus:outline-none focus:border-primary"
                placeholder="Enter name..."
              />
            )
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="cursor-text"
            >
              <p
                className={`text-base font-medium break-words whitespace-pre-wrap ${
                  todo.completed
                    ? 'line-through text-gray-500'
                    : 'text-text-primary'
                }`}
              >
                {todo.title}
              </p>
            </div>
          )}

          {/* Type Badge */}
          <div className="mt-2">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded border-2 ${typeColors[todo.type]}`}
            >
              {typeLabels[todo.type]}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {/* Archive Button */}
          <button
            onClick={() => onArchive(todo.id)}
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
            title={todo.completed ? 'Remove to archive' : 'Complete and archive'}
            aria-label="Archive"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4"
              />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete this item?')) {
                onDelete(todo.id);
              }
            }}
            className="p-2 text-gray-500 hover:text-accent hover:bg-accent/10 rounded transition-colors duration-200"
            title="Delete permanently"
            aria-label="Delete"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
