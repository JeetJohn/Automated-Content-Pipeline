import { create } from 'zustand';
import { Source } from '@contentpipe/types';
import { api } from '@/lib/api';

interface SourceState {
  sources: Source[];
  isLoading: boolean;
  error: string | null;
  
  fetchSources: (projectId: string) => Promise<void>;
  uploadFile: (projectId: string, file: File) => Promise<void>;
  addUrl: (projectId: string, url: string) => Promise<void>;
  addNote: (projectId: string, note: string) => Promise<void>;
  deleteSource: (sourceId: string) => Promise<void>;
}

export const useSourceStore = create<SourceState>((set, get) => ({
  sources: [],
  isLoading: false,
  error: null,

  fetchSources: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const sources = await api.get<Source[]>(`/projects/${projectId}/sources`);
      set({ sources, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  uploadFile: async (projectId: string, file: File) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post(`/projects/${projectId}/sources`, formData);
      await get().fetchSources(projectId);
      set({ isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addUrl: async (projectId: string, url: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/projects/${projectId}/sources`, { url });
      await get().fetchSources(projectId);
      set({ isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addNote: async (projectId: string, note: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/projects/${projectId}/sources`, { note });
      await get().fetchSources(projectId);
      set({ isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteSource: async (sourceId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/sources/${sourceId}`);
      set({
        sources: get().sources.filter(s => s.id !== sourceId),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
