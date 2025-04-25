// Статусы задач
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

// Базовый тип задачи
export interface Task {
  id: string;
  title: string;
  description?: string; // Опциональное описание
  status: TaskStatus;
  createdAt: string; // Используем строку для ISO дат из API
  dueDate?: string; // Используем строку для ISO дат из API
  userId: string; // Ссылка на пользователя
}

// Тип для создания новой задачи (пример)
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus; // Статус может быть опциональным при создании
  dueDate?: string;
  userId: string;
}

// Тип для обновления задачи (пример)
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
} 