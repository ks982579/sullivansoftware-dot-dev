'use client';

import { Todo } from '@/lib/useTodos';
import { TodoItem } from './TodoItem';
import { useState } from 'react';

interface ArchiveSectionProps {
  archivedTodos: Todo[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onToggleComplete: (id: string) => void;
}

export const ArchiveSection = ({
  archivedTodos,
  onRestore,
  onDelete,
  onEdit,
  onToggleComplete,
}: ArchiveSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (archivedTodos.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t-4 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xl font-bold text-text-primary hover:text-primary transition-colors duration-200"
          type="button"
        >
          <svg
            className={`w-6 h-6 transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span>Archive</span>
        </button>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {archivedTodos.length}
        </span>
      </div>

      {isExpanded && (
        <div className="space-y-3 bg-gray-50 rounded-lg p-4 border-2 border-gray-200/50">
          {archivedTodos.map((todo) => (
            <div key={todo.id} className="flex items-start gap-3">
              <div className="flex-1">
                <TodoItem
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                  onArchive={onRestore}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  draggable={false}
                />
              </div>
              <button
                onClick={() => onRestore(todo.id)}
                className="mt-1 p-2 text-gray-500 hover:text-secondary hover:bg-secondary/10 rounded transition-colors duration-200 flex-shrink-0"
                title="Restore from archive"
                aria-label="Restore"
                type="button"
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
                    d="M9 11l3 3L23 4M11 15H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2z"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
