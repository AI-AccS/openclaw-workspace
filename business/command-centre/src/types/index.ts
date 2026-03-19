// Core data types for Command Centre

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type Status = 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'review' | 'done';

export type Assignee = 'dawn' | 'human' | 'both';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  completedDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  phaseId?: string;
  priority: Priority;
  status: Status;
  assignee: Assignee;
  estimate?: number; // minutes
  actualTime?: number;
  dependencies: string[]; // Task IDs
  checklist: ChecklistItem[];
  progress: number; // 0-100
  createdAt: string;
  dueDate?: string;
  completedDate?: string;
  updatedAt: string;
  attachments?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: 'dawn' | 'human';
  text: string;
  createdAt: string;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  status: 'pending' | 'in-progress' | 'completed';
  taskIds: string[];
  progress: number;
  completedDate?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  goalId?: string;
  phases: Phase[];
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  progress: number;
  startDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  okrs: OKR[];
  projectIds: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface OKR {
  id: string;
  title: string;
  target: number;
  actual: number;
  progress: number;
}
