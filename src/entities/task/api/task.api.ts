import apiClient from '@/shared/api/axios';
// Import specific DTOs along with Task type
import { Task, TaskStatus, TaskCreateDto, TaskUpdateDto, TaskDeleteDto } from '../model/types';

// DTO definitions removed as they are now imported from model/types.ts

// Fetch tasks for a specific user
// Corresponds to GET /api/task/user/{userId}
export const fetchTasks = async (userId: string): Promise<Task[]> => {
  // TODO: Add parameters for server-side filtering/sorting if implemented based on backend endpoints
  // e.g., GET /api/task/user/{userId}/status/{status}, /sorted?sortBy=..., /search?searchTerm=...
  const response = await apiClient.get<Task[]>(`/task/user/${userId}`);
  return response.data;
};

// Create a new task
// Corresponds to POST /api/task/create
export const createTask = async (taskData: TaskCreateDto): Promise<Task> => {
  const response = await apiClient.post<Task>('/task/create', taskData);
  return response.data;
};

// Update an existing task
// Corresponds to PUT /api/task/update
export const updateTask = async (taskData: TaskUpdateDto): Promise<Task> => {
  // Backend expects TaskUpdateRequestDto in the body
  const response = await apiClient.put<Task>('/task/update', taskData);
  return response.data;
};

// Delete a task
// Corresponds to POST /api/task/delete
export const deleteTask = async (deleteData: TaskDeleteDto): Promise<Task> => {
  // Backend returns the deleted task
  const response = await apiClient.post<Task>('/task/delete', deleteData);
  return response.data; // Return deleted task as per backend controller
}; 