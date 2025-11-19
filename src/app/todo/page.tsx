'use client';

import { useTodos } from '@/lib/useTodos';
import { TodoForm } from './components/TodoForm';
import { EpicSection } from './components/EpicSection';
import { ArchiveSection } from './components/ArchiveSection';
import { useEffect, useState } from 'react';

export default function TodoPage() {
  const {
    isLoaded,
    addTodo,
    updateTodo,
    deleteTodo,
    archiveTodo,
    restoreTodo,
    toggleComplete,
    reorderTodos,
    getChildren,
    getArchived,
    getEpics,
  } = useTodos();

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-8 bg-paper rounded-lg border-2 border-primary/20">
            <p className="text-text-primary text-lg font-medium">Loading your todos...</p>
          </div>
        </div>
      </div>
    );
  }

  const epics = getEpics(false);
  const archivedTodos = getArchived();

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: `
        linear-gradient(rgba(139, 69, 19, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 69, 19, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: "50px 50px",
      backgroundAttachment: "fixed",
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in relative">
          {/* Corner Accent - Top Left */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-primary opacity-40" />
          {/* Corner Accent - Top Right */}
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-primary opacity-40" />

          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            My Tasks
          </h1>
          <p className="text-lg text-text-secondary mb-4">
            Organize your work with Epics, Stories, and Tasks
          </p>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </div>

        {/* Empty State */}
        {epics.length === 0 && archivedTodos.length === 0 && (
          <div className="text-center py-16 px-6 bg-paper rounded-lg border-4 border-primary/20 animate-fade-in">
            <svg
              className="w-20 h-20 text-primary/40 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h2 className="text-3xl font-bold text-primary mb-3">
              No tasks yet
            </h2>
            <p className="text-text-secondary mb-8 text-lg">
              Start by creating your first Epic, Story, or Task
            </p>
          </div>
        )}

        {/* Add New Epic Form */}
        {epics.length > 0 || archivedTodos.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Add to Backlog
            </h2>
            <TodoForm
              onAdd={(title, type) => addTodo(title, type, null)}
              defaultType="epic"
              showTypeSelector
            />
          </div>
        ) : (
          <div className="mb-8">
            <TodoForm
              onAdd={(title, type) => addTodo(title, type, null)}
              defaultType="epic"
              showTypeSelector
            />
          </div>
        )}

        {/* Main Content */}
        {epics.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-6">
                Backlog ({epics.length})
              </h2>

              {epics.map((epic) => (
                <EpicSection
                  key={epic.id}
                  epic={epic}
                  stories={getChildren(epic.id)}
                  onToggleComplete={toggleComplete}
                  onArchive={archiveTodo}
                  onDelete={deleteTodo}
                  onEdit={(id, title) => updateTodo(id, { title })}
                  onAddTodo={addTodo}
                  onReorderTodos={reorderTodos}
                  getChildren={getChildren}
                  draggedItemId={draggedItemId}
                  onDragItemChange={setDraggedItemId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archive Section */}
        {archivedTodos.length > 0 && (
          <ArchiveSection
            archivedTodos={archivedTodos}
            onRestore={restoreTodo}
            onDelete={deleteTodo}
            onEdit={(id, title) => updateTodo(id, { title })}
            onToggleComplete={toggleComplete}
          />
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
