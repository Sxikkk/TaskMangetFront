// Статусы задач (Matches Domain.Enums.Status - assuming 0, 1, 2 mapping? Check backend enum definition)
// For now, keeping string enum for frontend consistency, ensure backend handles mapping if needed.
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  ARCHIVED = 'archived'
}

// Based on TaskResponseDto from backend
export interface Task {
  id: string; // Guid
  userId: string; // Guid
  title: string;
  description?: string;
  status: number; // Changed to number to match backend integer enum
  createdAt: string; // DateTime
  updatedAt?: string; // DateTime - Added based on backend DTO
  dueDate?: string | null; // DateTime?
}

// Based on TaskCreateRequestDto from backend
export interface TaskCreateDto {
  userId: string;
  title: string;
  description?: string;
  status: number; // Changed to number
  dueDate?: string | null;
}

// Based on TaskUpdateRequestDto from backend
export interface TaskUpdateDto {
  taskId: string; // Added: Required by backend DTO
  title?: string;
  description?: string;
  status?: number; // Changed to number
  dueDate?: string | null;
}

// Based on TaskDeleteRequestDto from backend
export interface TaskDeleteDto {
    taskId: string;
} 