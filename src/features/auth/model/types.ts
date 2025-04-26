
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequestDto {
  email: string;
  refreshToken: string;
} 

export interface RegistrationRequestDto{
  firstName: string;
  secondName?: string;
  lastName: string;
  email: string;
  password: string;
}