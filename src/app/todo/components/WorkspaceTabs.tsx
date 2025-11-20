'use client';

import { Workspace } from '@/lib/useWorkspaces';
import { useState } from 'react';

interface WorkspaceTabsProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSwitchWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
}

export const WorkspaceTabs = ({
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
}: WorkspaceTabsProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
      setIsCreating(false);
    }
  };

  const handleRenameWorkspace = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim() && renameValue !== workspaces.find((w) => w.id === id)?.name) {
      onRenameWorkspace(id, renameValue);
    }
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <div className="flex items-center gap-3 mb-8 flex-wrap">
      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              activeWorkspaceId === workspace.id
                ? 'bg-primary/10 border-primary'
                : 'bg-paper border-primary/20 hover:border-primary/40'
            }`}
          >
            {renamingId === workspace.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleSaveRename(workspace.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(workspace.id);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                className="px-2 py-1 border border-primary/30 rounded text-sm focus:outline-none focus:border-primary"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <button
                  onClick={() => onSwitchWorkspace(workspace.id)}
                  className="font-medium text-text-primary hover:text-primary transition-colors"
                  type="button"
                >
                  {workspace.name}
                </button>

                {/* Actions Menu */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRenameWorkspace(workspace.id, workspace.name)}
                    className="p-1 text-gray-500 hover:text-secondary hover:bg-secondary/10 rounded transition-colors"
                    title="Rename workspace"
                    aria-label="Rename"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  {workspace.id !== 'default' && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete workspace "${workspace.name}" and all its contents?`)) {
                          onDeleteWorkspace(workspace.id);
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                      title="Delete workspace"
                      aria-label="Delete"
                      type="button"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Workspace Button */}
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-2 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary/50 rounded-lg text-primary font-medium transition-all duration-200"
          type="button"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </span>
        </button>
      ) : (
        <form onSubmit={handleCreateWorkspace} className="flex gap-2">
          <input
            autoFocus
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Workspace name..."
            className="px-3 py-2 border-2 border-primary/30 rounded bg-white text-text-primary focus:outline-none focus:border-primary"
            onBlur={() => {
              setIsCreating(false);
              setNewWorkspaceName('');
            }}
          />
          <button
            type="submit"
            className="px-3 py-2 bg-primary text-white font-semibold rounded hover:shadow-lg transition-shadow"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
};
