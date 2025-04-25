import { TaskStatus } from '@/entities/task';

// Data structure used internally by TaskForm
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: Date | null;
} 