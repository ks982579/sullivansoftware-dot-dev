'use client';

import { Todo, TodoType } from '@/lib/useTodos';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { useState, useRef } from 'react';

interface EpicSectionProps {
  epic: Todo;
  stories: Todo[];
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

export const EpicSection = ({
  epic,
  stories,
  onToggleComplete,
  onArchive,
  onDelete,
  onEdit,
  onAddTodo,
  onReorderTodos,
  getChildren,
  draggedItemId,
  onDragItemChange,
}: EpicSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{
    parentId: string | null;
    index: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(epic.title);
  const dragCounterRef = useRef(0);

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== epic.title) {
      onEdit(epic.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    const index = stories.findIndex((child) => child.id === itemId);
    setDraggedFrom({ parentId: epic.id, index });
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

    // If same parent, reorder
    if (draggedFrom.parentId === epic.id && dropIndex !== undefined) {
      if (draggedFrom.index !== dropIndex) {
        onReorderTodos(epic.id, draggedFrom.index, dropIndex);
      }
    }

    setDraggedFrom(null);
    onDragItemChange?.(null);
  };

  const handleDragEnd = () => {
    dragCounterRef.current = 0;
    setDragOverIndex(null);
    setDraggedFrom(null);
    onDragItemChange?.(null);
  };

  return (
    <div className="mb-8">
      {/* Epic Header */}
      <div className="mb-4">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-start gap-3 w-full p-4 bg-primary/5 hover:bg-primary/10 border-2 border-primary/30 rounded-lg transition-all duration-200 hover:border-primary/50 cursor-pointer group"
        >
          <svg
            className={`w-6 h-6 text-primary flex-shrink-0 mt-0.5 transition-transform duration-200 ${
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
                className="w-full px-3 py-2 border-2 border-primary/30 rounded bg-white text-primary focus:outline-none focus:border-primary font-bold text-lg"
                placeholder="Epic name..."
              />
            ) : (
              <h3 className="text-lg font-bold text-primary">{epic.title}</h3>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="px-3 py-1 text-xs font-semibold rounded border-2 bg-primary/10 border-primary text-primary">
                Epic
              </span>
              <span className="text-xs text-gray-500">
                {stories.length} items
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
              title="Rename epic"
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
                onArchive(epic.id);
              }}
              className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition-colors duration-200"
              title="Archive"
              aria-label="Archive epic"
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
                if (confirm('Are you sure you want to permanently delete this epic and all its children?')) {
                  onDelete(epic.id);
                }
              }}
              className="p-2 text-gray-500 hover:text-accent hover:bg-accent/10 rounded transition-colors duration-200"
              title="Delete"
              aria-label="Delete epic"
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
          {/* Stories/Tasks */}
          <div
            className="space-y-3"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e)}
          >
            {stories.map((child, index) => (
              <div
                key={child.id}
                draggable
                onDragStart={(e) => handleDragStart(e, child.id)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnter={() => setDragOverIndex(index)}
                className={`transition-all duration-150 ${
                  draggedItemId === child.id ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
                } ${
                  dragOverIndex === index && draggedItemId !== child.id
                    ? 'border-t-4 border-secondary pt-2'
                    : ''
                }`}
              >
                {child.type === 'story' ? (
                  <StorySection
                    story={child}
                    tasks={getChildren(child.id)}
                    onToggleComplete={onToggleComplete}
                    onArchive={onArchive}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onAddTodo={onAddTodo}
                    onReorderTodos={onReorderTodos}
                    draggedItemId={draggedItemId}
                    onDragItemChange={onDragItemChange}
                  />
                ) : (
                  <TodoItem
                    todo={child}
                    onToggleComplete={onToggleComplete}
                    onArchive={onArchive}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    isDragging={draggedItemId === child.id}
                    onDragStart={(e) => handleDragStart(e, child.id)}
                    onDragOver={handleDragOver}
                    draggable
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add Story/Task Form */}
          <TodoForm
            onAdd={(title, type) => onAddTodo(title, type, epic.id)}
            defaultType="story"
            showTypeSelector
          />
        </div>
      )}
    </div>
  );
};

// Story Section Component (similar to Epic but for stories)
interface StorySectionProps {
  story: Todo;
  tasks: Todo[];
  onToggleComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onAddTodo: (title: string, type: TodoType, parentId: string | null) => void;
  onReorderTodos: (parentId: string | null, fromIndex: number, toIndex: number) => void;
  draggedItemId?: string | null;
  onDragItemChange?: (id: string | null) => void;
}

const StorySection = ({
  story,
  tasks,
  onToggleComplete,
  onArchive,
  onDelete,
  onEdit,
  onAddTodo,
  onReorderTodos,
  draggedItemId,
  onDragItemChange,
}: StorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<{
    parentId: string | null;
    index: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title);
  const dragCounterRef = useRef(0);

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== story.title) {
      onEdit(story.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    const index = tasks.findIndex((child) => child.id === itemId);
    setDraggedFrom({ parentId: story.id, index });
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

    if (draggedFrom.parentId === story.id && dropIndex !== undefined) {
      if (draggedFrom.index !== dropIndex) {
        onReorderTodos(story.id, draggedFrom.index, dropIndex);
      }
    }

    setDraggedFrom(null);
    onDragItemChange?.(null);
  };

  const handleDragEnd = () => {
    dragCounterRef.current = 0;
    setDragOverIndex(null);
    setDraggedFrom(null);
    onDragItemChange?.(null);
  };

  return (
    <div className="mb-4 border-l-4 border-secondary/30 pl-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-start gap-3 w-full p-3 bg-secondary/5 hover:bg-secondary/10 border-2 border-secondary/20 rounded transition-all duration-200 hover:border-secondary/40 cursor-pointer group"
      >
        <svg
          className={`w-5 h-5 text-secondary flex-shrink-0 mt-0.5 transition-transform duration-200 ${
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
              className="w-full px-3 py-2 border-2 border-secondary/30 rounded bg-white text-secondary focus:outline-none focus:border-secondary font-semibold"
              placeholder="Story name..."
            />
          ) : (
            <h4 className="font-semibold text-secondary">{story.title}</h4>
          )}
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-semibold rounded border bg-secondary/10 border-secondary text-secondary">
              Story
            </span>
            <span className="text-xs text-gray-500">{tasks.length} tasks</span>
          </div>
        </div>

        <div className="flex gap-1 ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 text-gray-500 hover:text-secondary hover:bg-secondary/10 rounded transition-colors duration-200"
            title="Rename story"
            aria-label="Rename"
            type="button"
          >
            <svg
              className="w-4 h-4"
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
              onArchive(story.id);
            }}
            className="p-1 text-gray-500 hover:text-secondary hover:bg-secondary/10 rounded transition-colors duration-200"
            title="Archive"
            aria-label="Archive story"
            type="button"
          >
            <svg
              className="w-4 h-4"
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
              if (confirm('Are you sure you want to permanently delete this story and all its tasks?')) {
                onDelete(story.id);
              }
            }}
            className="p-1 text-gray-500 hover:text-accent hover:bg-accent/10 rounded transition-colors duration-200"
            title="Delete"
            aria-label="Delete story"
            type="button"
          >
            <svg
              className="w-4 h-4"
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

      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div
            className="space-y-2"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e)}
          >
            {tasks.map((task, index) => (
              <div
                key={task.id}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnter={() => setDragOverIndex(index)}
                className={`transition-all duration-150 ${
                  dragOverIndex === index && draggedItemId !== task.id
                    ? 'border-t-4 border-accent pt-2'
                    : ''
                }`}
              >
                <TodoItem
                  todo={task}
                  onToggleComplete={onToggleComplete}
                  onArchive={onArchive}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  isDragging={draggedItemId === task.id}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  draggable
                />
              </div>
            ))}
          </div>

          <TodoForm
            onAdd={(title, type) => onAddTodo(title, type, story.id)}
            defaultType="task"
            showTypeSelector={false}
          />
        </div>
      )}
    </div>
  );
};
