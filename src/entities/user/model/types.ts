// Based on UserResponseDto from backend
export interface User {
  id: string; // Guid maps to string
  firstName: string; // Changed from name
  secondName?: string; // Changed from lastName
  email: string;
  roleId: number;
  createdAt: string; // DateTime maps to string (ISO format expected)
  // NOTE: Backend User model might have more fields (e.g., PasswordHash, Token)
  // but these are typically not included in response DTOs sent to the frontend.
}

// Based on UserUpdateRequestDto from backend controller/service
export interface UserUpdateDto {
  userId: string; // Required by backend service/controller logic (though path might be implicit)
  firstName?: string;
  secondName?: string;
  email?: string; // Backend allows updating email
}

// Based on PasswordUpdateRequestDto used in UserController
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
} 