import apiClient from '@/shared/api/axios';
import { LoginRequestDto, LoginResponseDto, RefreshRequestDto, RegistrationRequestDto } from '../model/types';

export const loginUser = async (credentials: LoginRequestDto): Promise<LoginResponseDto> => {
  const response = await apiClient.post<LoginResponseDto>('/login', credentials);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  // Optional: Call backend invalidate endpoint if it exists
  // await apiClient.post('/logout');
  return Promise.resolve();
};

export const refreshTokenApiCall = async (refreshData: RefreshRequestDto): Promise<LoginResponseDto> => {
  const response = await apiClient.post<LoginResponseDto>('/refresh', refreshData);
  return response.data;
}; 

export const registerUser = async (credentials: RegistrationRequestDto): Promise<LoginResponseDto> => {
  console.log(credentials);
  const response = await apiClient.post<LoginResponseDto>('/registration', credentials);
  return response.data;
}