import { User } from '@/entities/user'; // Assuming User type exists

export interface LoginRequestDto {
  email: string;
  password: string;
}

// Based on backend AuthResponseDto
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  // user object is NOT returned directly from login based on backend code
}

// GetMeResponseDto removed as backend doesn't have /users/me
// We will fetch user details using getUserById after login/token check

// No specific DTOs needed for logout request/response based on assumptions 

export interface RefreshRequestDto {
  email: string;
  refreshToken: string;
} 