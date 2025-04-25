// Базовый тип пользователя
export interface User {
  id: string;
  name: string;
  lastName?: string; // Добавим опциональную фамилию
  email: string;
  // Можно добавить другие поля, например, createdAt, updatedAt
}

// Тип для формы обновления профиля (пример)
export interface UserUpdateDto {
  name: string;
  lastName?: string;
  email: string;
  // Пароль обычно передается отдельно или в другом DTO для безопасности
}

// Тип для формы смены пароля (пример)
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
} 