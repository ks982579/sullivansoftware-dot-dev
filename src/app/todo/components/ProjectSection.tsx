'use client';

import { Todo, TodoType } from '@/lib/useTodos';
import { TodoForm } from './TodoForm';
import { EpicSection } from './EpicSection';
import { useState, useRef } from 'react';

interface ProjectSectionProps {
  project: Todo;
  epics: Todo[];
  onToggleComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onAddTodo: (title: string, type: TodoType, parentId: string | null) => void;
  onReorderTodos: (parentId: string | null, fromIndex: number, toIndex: number) => void;
  getChildren: (parentId: string | null, includeArchived?: boolean) => Todo[];
  draggedItemId?: string | null;
  onDragItemChange?: (id: string | null) => void;
}

export const ProjectSection = ({
  project,
  epics,
  onToggleComplete,
  onArchive,
  onDelete,
  onEdit,
  onAddTodo,
  onReorderTodos,
  getChildren,
  draggedItemId,
  onDragItemChange,
}: ProjectSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{
    parentId: string | null;
    index: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const dragCounterRef = useRef(0);

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== project.title) {
      onEdit(project.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    const index = epics.findIndex((child) => child.id === itemId);
    setDraggedFrom({ parentId: project.id, index });
    onDragItemChange?.(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = () => {
    dragCounterRef.current += 1;
  };

  const handleDragLeave = () => {
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setDragOverIndex(null);

    if (!draggedFrom) return;

    if (draggedFrom.parentId === project.id && dropIndex !== undefined) {
      if (draggedFrom.index !== dropIndex) {
        onReorderTodos(project.id, draggedFrom.index, dropIndex);
      }
    }

    setDraggedFrom(null);
    onDragItemChange?.(null);
  };

  return (
    <div className="mb-8 border-l-4 border-primary/50 pl-4">
      {/* Project Header */}
      <div className="mb-6">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-start gap-3 w-full p-4 bg-primary/10 hover:bg-primary/15 border-2 border-primary/40 rounded-lg transition-all duration-200 hover:border-primary/60 cursor-pointer group"
        >
          <svg
            className={`w-7 h-7 text-primary flex-shrink-0 mt-0.5 transition-transform duration-200 ${
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

          <div className="text-left flex-1">
            {isEditing ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="w-full px-3 py-2 border-2 border-primary/30 rounded bg-white text-primary focus:outline-none focus:border-primary font-bold text-xl"
                placeholder="Project name..."
              />
            ) : (
              <h2 className="text-xl font-bold text-primary">{project.title}</h2>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="px-3 py-1 text-xs font-semibold rounded border-2 bg-primary/20 border-primary text-primary">
                Project
              </span>
              <span className="text-xs text-gray-500">
                {epics.length} epics
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-2 text-gray-500 hover:text-secondary hover:bg-secondary/10 rounded transition-colors duration-200"
              title="Rename project"
              aria-label="Rename"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(project.id);
              }}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
              title="Archive"
              aria-label="Archive project"
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
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to permanently delete this project and all its contents?')) {
                  onDelete(project.id);
                }
              }}
              className="p-2 text-gray-500 hover:text-accent hover:bg-accent/10 rounded transition-colors duration-200"
              title="Delete"
              aria-label="Delete project"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="pl-6 space-y-4">
          {/* Epics */}
          <div
            className="space-y-3"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e)}
          >
            {epics.map((epic, index) => (
              <div
                key={epic.id}
                onDrop={(e) => handleDrop(e, index)}
                className={`transition-all duration-150 ${
                  dragOverIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div
                  onDragStart={(e) => handleDragStart(e, epic.id)}
                  className={draggedItemId === epic.id ? 'opacity-50' : ''}
                >
                  <EpicSection
                    epic={epic}
                    stories={getChildren(epic.id)}
                    onToggleComplete={onToggleComplete}
                    onArchive={onArchive}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onAddTodo={onAddTodo}
                    onReorderTodos={onReorderTodos}
                    getChildren={getChildren}
                    draggedItemId={draggedItemId}
                    onDragItemChange={onDragItemChange}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Epic/Story/Task Form */}
          <TodoForm
            onAdd={(title, type) => onAddTodo(title, type, project.id)}
            defaultType="epic"
            showTypeSelector
          />
        </div>
      )}
    </div>
  );
};
