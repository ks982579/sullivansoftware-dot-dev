'use client';

import { useTodos } from '@/lib/useTodos';
import { useWorkspaces } from '@/lib/useWorkspaces';
import { TodoForm } from './components/TodoForm';
import { ProjectSection } from './components/ProjectSection';
import { EpicSection } from './components/EpicSection';
import { ArchiveSection } from './components/ArchiveSection';
import { WorkspaceTabs } from './components/WorkspaceTabs';
import { useEffect, useState } from 'react';

export default function TodoPage() {
  const {
    workspaces,
    activeWorkspaceId,
    isLoaded: workspacesLoaded,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    switchWorkspace,
  } = useWorkspaces();

  const {
    isLoaded: todosLoaded,
    addTodo,
    updateTodo,
    deleteTodo,
    archiveTodo,
    restoreTodo,
    toggleComplete,
    reorderTodos,
    getChildren,
    getArchived,
    getProjects,
    getEpics,
  } = useTodos(activeWorkspaceId);

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [projectDragOverIndex, setProjectDragOverIndex] = useState<number | null>(null);
  const [epicDragOverIndex, setEpicDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !workspacesLoaded || !todosLoaded) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-8 bg-paper rounded-lg border-2 border-primary/20">
            <p className="text-text-primary text-lg font-medium">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  const projects = getProjects(false);
  const epics = getEpics(false);
  const archivedTodos = getArchived();

  // Handlers for project drag and drop
  const handleProjectDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
    setDraggedItemId(projectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleProjectDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectDragOverIndex(null);

    if (!draggedItemId) return;
    const fromIndex = projects.findIndex((p) => p.id === draggedItemId);
    if (fromIndex !== -1 && fromIndex !== dropIndex) {
      reorderTodos(null, fromIndex, dropIndex);
    }

    setDraggedItemId(null);
  };

  const handleProjectDragEnd = () => {
    setDraggedItemId(null);
    setProjectDragOverIndex(null);
  };

  // Handlers for epic drag and drop
  const handleEpicDragStart = (e: React.DragEvent<HTMLDivElement>, epicId: string) => {
    setDraggedItemId(epicId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEpicDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEpicDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setEpicDragOverIndex(null);

    if (!draggedItemId) return;
    const fromIndex = epics.findIndex((ep) => ep.id === draggedItemId);
    if (fromIndex !== -1 && fromIndex !== dropIndex) {
      reorderTodos(null, fromIndex, dropIndex);
    }

    setDraggedItemId(null);
  };

  const handleEpicDragEnd = () => {
    setDraggedItemId(null);
    setEpicDragOverIndex(null);
  };

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
        <div className="mb-8 animate-fade-in relative">
          {/* Corner Accent - Top Left */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-primary opacity-40" />
          {/* Corner Accent - Top Right */}
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-primary opacity-40" />

          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            My Tasks
          </h1>
          <p className="text-lg text-text-secondary mb-4">
            Organize your work across multiple workspaces
          </p>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </div>

        {/* Workspace Tabs */}
        <WorkspaceTabs
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSwitchWorkspace={switchWorkspace}
          onCreateWorkspace={createWorkspace}
          onDeleteWorkspace={deleteWorkspace}
          onRenameWorkspace={renameWorkspace}
        />

        {/* Empty State */}
        {projects.length === 0 && epics.length === 0 && archivedTodos.length === 0 && (
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
              Start by creating your first Project, Epic, Story, or Task
            </p>
          </div>
        )}

        {/* Add New Project/Epic Form */}
        {projects.length > 0 || epics.length > 0 || archivedTodos.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Add to Backlog
            </h2>
            <TodoForm
              onAdd={(title, type) => addTodo(title, type, null)}
              defaultType="project"
              showTypeSelector
            />
          </div>
        ) : (
          <div className="mb-8">
            <TodoForm
              onAdd={(title, type) => addTodo(title, type, null)}
              defaultType="project"
              showTypeSelector
            />
          </div>
        )}

        {/* Main Content - Projects and Standalone Epics */}
        {(projects.length > 0 || epics.length > 0) && (
          <div className="space-y-8 animate-fade-in">
            {/* Projects Section */}
            {projects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-6">
                  Projects ({projects.length})
                </h2>

                <div className="space-y-8">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={(e) => handleProjectDragStart(e, project.id)}
                      onDragEnd={handleProjectDragEnd}
                      onDragOver={handleProjectDragOver}
                      onDrop={(e) => handleProjectDrop(e, index)}
                      onDragEnter={() => setProjectDragOverIndex(index)}
                      className={`transition-all duration-150 ${
                        draggedItemId === project.id ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
                      } ${
                        projectDragOverIndex === index && draggedItemId !== project.id
                          ? 'border-t-4 border-primary pt-4'
                          : ''
                      }`}
                    >
                      <ProjectSection
                        project={project}
                        epics={getChildren(project.id)}
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standalone Epics (not in a project) */}
            {epics.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-6">
                  Standalone Epics ({epics.length})
                </h2>

                <div className="space-y-8">
                  {epics.map((epic, index) => (
                    <div
                      key={epic.id}
                      draggable
                      onDragStart={(e) => handleEpicDragStart(e, epic.id)}
                      onDragEnd={handleEpicDragEnd}
                      onDragOver={handleEpicDragOver}
                      onDrop={(e) => handleEpicDrop(e, index)}
                      onDragEnter={() => setEpicDragOverIndex(index)}
                      className={`transition-all duration-150 ${
                        draggedItemId === epic.id ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
                      } ${
                        epicDragOverIndex === index && draggedItemId !== epic.id
                          ? 'border-t-4 border-primary pt-4'
                          : ''
                      }`}
                    >
                      <EpicSection
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
                    </div>
                  ))}
                </div>
              </div>
            )}
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
