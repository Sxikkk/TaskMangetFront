import axiosInstance from '@/shared/api/axios';
import { Task } from '../model/types';

// TODO: Добавить обработку параметров фильтрации и сортировки
export const fetchTasks = async (userId: string): Promise<Task[]> => {
  // При необходимости можно передавать параметры фильтрации/сортировки
  // const params = { status: filters.status, dueDate: filters.dueDate, sortBy: sortBy };
  const response = await axiosInstance.get<Task[]>(`/tasks/user/${userId}`/* , { params } */);
  // Важно: API путь `/api/task/user/{userId}` из ТЗ изменен на `/tasks/user/{userId}`
  // Уточните реальный эндпоинт у бэкенда.
  // Также путь /api/ убран, т.к. он уже есть в baseURL axiosInstance
  return response.data;
};

// TODO: Реализовать остальные методы API (create, update, delete)
// export const createTask = async (taskData: CreateTaskDto): Promise<Task> => { ... };
// export const updateTask = async (taskId: string, taskData: UpdateTaskDto): Promise<Task> => { ... };
// export const deleteTask = async (taskId: string): Promise<void> => { ... }; 