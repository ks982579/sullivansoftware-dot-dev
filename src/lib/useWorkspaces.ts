'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}

const WORKSPACES_KEY = 'workspaces';
const ACTIVE_WORKSPACE_KEY = 'active_workspace';
const DEFAULT_WORKSPACE_ID = 'default';
const DEFAULT_WORKSPACE_NAME = 'Personal';

export const useWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(DEFAULT_WORKSPACE_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize workspaces from localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem(WORKSPACES_KEY);
    const savedActiveId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);

    let initialWorkspaces: Workspace[] = [];

    if (savedWorkspaces) {
      try {
        initialWorkspaces = JSON.parse(savedWorkspaces);
      } catch (error) {
        console.error('Failed to parse workspaces from localStorage:', error);
      }
    }

    // Ensure default workspace exists (backward compatibility)
    if (initialWorkspaces.length === 0 || !initialWorkspaces.find((w) => w.id === DEFAULT_WORKSPACE_ID)) {
      const defaultWorkspace: Workspace = {
        id: DEFAULT_WORKSPACE_ID,
        name: DEFAULT_WORKSPACE_NAME,
        createdAt: Date.now(),
      };
      initialWorkspaces = [defaultWorkspace, ...initialWorkspaces];
    }

    setWorkspaces(initialWorkspaces);
    setActiveWorkspaceId(savedActiveId || DEFAULT_WORKSPACE_ID);
    setIsLoaded(true);
  }, []);

  // Save workspaces to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    }
  }, [workspaces, isLoaded]);

  // Save active workspace to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeWorkspaceId);
    }
  }, [activeWorkspaceId, isLoaded]);

  // Create a new workspace
  const createWorkspace = useCallback((name: string) => {
    const newWorkspace: Workspace = {
      id: `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: Date.now(),
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    return newWorkspace;
  }, []);

  // Rename a workspace
  const renameWorkspace = useCallback((id: string, newName: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, name: newName } : ws))
    );
  }, []);

  // Delete a workspace
  const deleteWorkspace = useCallback((id: string) => {
    if (id === DEFAULT_WORKSPACE_ID) {
      console.error('Cannot delete default workspace');
      return;
    }

    setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));

    // Switch to default workspace if the active one is deleted
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(DEFAULT_WORKSPACE_ID);
    }
  }, [activeWorkspaceId]);

  // Switch to a workspace
  const switchWorkspace = useCallback((id: string) => {
    if (workspaces.find((ws) => ws.id === id)) {
      setActiveWorkspaceId(id);
    }
  }, [workspaces]);

  // Get the active workspace
  const getActiveWorkspace = useCallback(() => {
    return workspaces.find((ws) => ws.id === activeWorkspaceId);
  }, [workspaces, activeWorkspaceId]);

  return {
    workspaces,
    activeWorkspaceId,
    isLoaded,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    switchWorkspace,
    getActiveWorkspace,
  };
};
