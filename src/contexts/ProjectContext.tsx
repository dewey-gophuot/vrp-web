import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { ProjectResponse } from '../api/types';

interface ProjectContextType {
  projects: ProjectResponse[];
  activeProjectId: string | null;
  activeProject: ProjectResponse | null;
  isLoading: boolean;
  setActiveProject: (projectId: string | null) => void;
  reloadProjects: () => Promise<ProjectResponse[]>;
}

const STORAGE_KEY = 'active_project_id';
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);

  const setActiveProject = useCallback((projectId: string | null) => {
    setActiveProjectId(projectId);
    if (projectId) localStorage.setItem(STORAGE_KEY, projectId);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const reloadProjects = useCallback(async () => {
    try {
      const list = await api.listProjects();
      setProjects(list || []);
      return list || [];
    } catch (e) {
      console.error('Load projects failed:', e);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải project khi đã đăng nhập (có token)
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      reloadProjects();
    } else {
      setIsLoading(false);
    }
  }, [reloadProjects]);

  // Nếu project đang chọn không còn tồn tại -> bỏ chọn
  useEffect(() => {
    if (!isLoading && activeProjectId && !projects.some((p) => p.id === activeProjectId)) {
      setActiveProject(null);
    }
  }, [isLoading, projects, activeProjectId, setActiveProject]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{ projects, activeProjectId, activeProject, isLoading, setActiveProject, reloadProjects }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
