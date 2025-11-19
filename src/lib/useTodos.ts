'use client';

import { useState, useEffect, useCallback } from 'react';

export type TodoType = 'epic' | 'story' | 'task';

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

const STORAGE_KEY = 'todos_data';

// Helper to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        setTodos(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Failed to parse todos from localStorage:', error);
        setTodos([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever todos change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

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
      const itemsInParent = todos.filter(
        (t) => t.parentId === parentId && !t.archived
      );

      if (fromIndex < 0 || fromIndex >= itemsInParent.length) return;
      if (toIndex < 0 || toIndex >= itemsInParent.length) return;

      // Create new array with reordered items
      const reordered = [...itemsInParent];
      const [removed] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, removed);

      // Update all items' order values
      const idsToUpdate = reordered.map((t) => t.id);

      setTodos((prev) =>
        prev.map((todo) => {
          const newIndex = idsToUpdate.indexOf(todo.id);
          return newIndex !== -1 ? { ...todo, order: newIndex } : todo;
        })
      );
    },
    [todos]
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

  // Get all epics (top-level items)
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
    getEpics,
    getTodoById,
  };
};
