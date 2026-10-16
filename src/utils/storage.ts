import { NewsProject, SavedProjectItem } from '../types';
import { INITIAL_PROJECT } from '../data/defaultTemplates';

const PROJECTS_STORAGE_KEY = 'samachar_maker_saved_projects_v1';
const DRAFT_STORAGE_KEY = 'samachar_maker_draft_v1';

export function getSavedProjects(): SavedProjectItem[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved projects from localStorage:', e);
    return [];
  }
}

export function saveProjectToStorage(project: NewsProject, previewUrl?: string): SavedProjectItem[] {
  try {
    const projects = getSavedProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    
    const item: SavedProjectItem = {
      id: project.id === 'current-draft' ? `proj-${Date.now()}` : project.id,
      title: project.title || 'Untitled News Card',
      previewUrl: previewUrl || undefined,
      updatedAt: Date.now(),
      data: {
        ...project,
        id: project.id === 'current-draft' ? `proj-${Date.now()}` : project.id
      }
    };

    let updated: SavedProjectItem[];
    if (existingIndex >= 0) {
      updated = [...projects];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...projects];
    }

    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save project to localStorage:', e);
    return getSavedProjects();
  }
}

export function deleteProjectFromStorage(id: string): SavedProjectItem[] {
  try {
    const projects = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    return projects;
  } catch (e) {
    console.error('Failed to delete project:', e);
    return getSavedProjects();
  }
}

export function saveDraftToStorage(project: NewsProject): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(project));
  } catch (e) {
    // ignore quota errors
  }
}

export function loadDraftFromStorage(): NewsProject {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return INITIAL_PROJECT;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PROJECT;
  }
}
