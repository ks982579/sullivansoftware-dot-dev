'use client';

import { useState, useEffect, useCallback } from 'react';

export type TodoType = 'project' | 'epic' | 'story' | 'task';

export interface Todo {
  id: string;
  title: string;
  type: TodoType;
  completed: boolean;
  archived: boolean;
  createdAt: number;
  parentId: string | null;
  order: number;
}

// Get storage key for a specific workspace
const getStorageKey = (workspaceId: string) => `todos_workspace_${workspaceId}`;

// Helper to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useTodos = (workspaceId: string) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount or when workspace changes
  useEffect(() => {
    const storageKey = getStorageKey(workspaceId);
    const savedTodos = localStorage.getItem(storageKey);
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        setTodos(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse todos from localStorage:', error);
        setTodos([]);
      }
    } else {
      setTodos([]);
    }
    setIsLoaded(true);
  }, [workspaceId]);

  // Save to localStorage whenever todos change
  useEffect(() => {
    if (isLoaded) {
      const storageKey = getStorageKey(workspaceId);
      localStorage.setItem(storageKey, JSON.stringify(todos));
    }
  }, [todos, isLoaded, workspaceId]);

  // Add a new todo
  const addTodo = useCallback(
    (title: string, type: TodoType, parentId: string | null = null) => {
      const newTodo: Todo = {
        id: generateId(),
        title,
        type,
        completed: false,
        archived: false,
        createdAt: Date.now(),
        parentId,
        order: todos.filter((t) => t.parentId === parentId && !t.archived).length,
      };
      setTodos((prev) => [...prev, newTodo]);
      return newTodo;
    },
    [todos]
  );

  // Update todo
  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    );
  }, []);

  // Delete todo permanently
  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  // Archive todo (soft delete)
  const archiveTodo = useCallback((id: string) => {
    updateTodo(id, { archived: true });
  }, [updateTodo]);

  // Restore todo from archive
  const restoreTodo = useCallback((id: string) => {
    updateTodo(id, { archived: false });
  }, [updateTodo]);

  // Toggle completion status
  const toggleComplete = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  // Move todo to new parent
  const moveTodo = useCallback((id: string, newParentId: string | null) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, parentId: newParentId } : todo))
    );
  }, []);

  // Reorder todos (for drag and drop)
  const reorderTodos = useCallback(
    (parentId: string | null, fromIndex: number, toIndex: number) => {
      setTodos((prev) => {
        // Get items in parent using current state and sort by order
        const itemsInParent = prev
          .filter((t) => t.parentId === parentId && !t.archived)
          .sort((a, b) => a.order - b.order);

        if (fromIndex < 0 || fromIndex >= itemsInParent.length) return prev;
        if (toIndex < 0 || toIndex >= itemsInParent.length) return prev;
        if (fromIndex === toIndex) return prev;

        // Create new array with reordered items
        const reordered = [...itemsInParent];
        const [removed] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, removed);

        // Update all items' order values
        const idsToUpdate = reordered.map((t) => t.id);

        return prev.map((todo) => {
          const newIndex = idsToUpdate.indexOf(todo.id);
          return newIndex !== -1 ? { ...todo, order: newIndex } : todo;
        });
      });
    },
    []
  );

  // Get children of a todo
  const getChildren = useCallback(
    (parentId: string | null, includeArchived = false) => {
      return todos
        .filter((t) => t.parentId === parentId && (includeArchived || !t.archived))
        .sort((a, b) => a.order - b.order);
    },
    [todos]
  );

  // Get all archived items
  const getArchived = useCallback(() => {
    return todos.filter((t) => t.archived).sort((a, b) => b.createdAt - a.createdAt);
  }, [todos]);

  // Get all projects (top-level items)
  const getProjects = useCallback((includeArchived = false) => {
    return todos
      .filter((t) => t.type === 'project' && t.parentId === null && (includeArchived || !t.archived))
      .sort((a, b) => a.order - b.order);
  }, [todos]);

  // Get all epics (can be top-level or within projects)
  const getEpics = useCallback((includeArchived = false) => {
    return todos
      .filter((t) => t.type === 'epic' && t.parentId === null && (includeArchived || !t.archived))
      .sort((a, b) => a.order - b.order);
  }, [todos]);

  // Get a specific todo by ID
  const getTodoById = useCallback(
    (id: string) => {
      return todos.find((t) => t.id === id);
    },
    [todos]
  );

  return {
    todos,
    isLoaded,
    addTodo,
    updateTodo,
    deleteTodo,
    archiveTodo,
    restoreTodo,
    toggleComplete,
    moveTodo,
    reorderTodos,
    getChildren,
    getArchived,
    getProjects,
    getEpics,
    getTodoById,
  };
};
