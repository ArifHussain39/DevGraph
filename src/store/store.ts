'use client';

import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

interface AppState {
  // JSON data
  jsonString: string;
  parsedJson: unknown | null;
  jsonError: JsonError | null;

  // Theme
  theme: Theme;

  // UI state
  collapsedNodes: Set<string>;
  searchQuery: string;
  highlightedNode: string | null;

  // Actions
  setJsonString: (json: string) => void;
  setParsedJson: (data: unknown | null) => void;
  setJsonError: (error: JsonError | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  setSearchQuery: (query: string) => void;
  setHighlightedNode: (nodeId: string | null) => void;
  resetCollapsedNodes: () => void;
  collapseAll: (nodeIds: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  jsonString: '',
  parsedJson: null,
  jsonError: null,
  theme: 'dark',
  collapsedNodes: new Set<string>(),
  searchQuery: '',
  highlightedNode: null,

  setJsonString: (json) => set({ jsonString: json }),
  setParsedJson: (data) => set({ parsedJson: data }),
  setJsonError: (error) => set({ jsonError: error }),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setTheme: (theme) => set({ theme }),

  toggleNodeCollapse: (nodeId) =>
    set((state) => {
      const newSet = new Set(state.collapsedNodes);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return { collapsedNodes: newSet };
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setHighlightedNode: (nodeId) => set({ highlightedNode: nodeId }),
  resetCollapsedNodes: () => set({ collapsedNodes: new Set<string>() }),
  collapseAll: (nodeIds) => set({ collapsedNodes: new Set(nodeIds) }),
}));
