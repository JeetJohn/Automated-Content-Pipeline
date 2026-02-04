import { create } from 'zustand';
import { Project } from '@contentpipe/types';
import { api } from '@/lib/api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<void>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

interface CreateProjectData {
  title: string;
  contentType: 'blog' | 'article' | 'report' | 'summary';
  tonePreference: 'formal' | 'casual' | 'technical' | 'persuasive';
  targetLength: number;
}

interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: string;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await api.get<Project[]>('/projects');
      set({ projects, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.get<Project>(`/projects/${id}`);
      set({ currentProject: project, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createProject: async (data: CreateProjectData) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.post<Project>('/projects', data);
      set({ 
        projects: [...get().projects, project], 
        isLoading: false 
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  updateProject: async (id: string, data: UpdateProjectData) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.put<Project>(`/projects/${id}`, data);
      set({
        projects: get().projects.map(p => p.id === id ? project : p),
        currentProject: project,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      set({
        projects: get().projects.filter(p => p.id !== id),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
