import apiClient from '@/shared/api/axios';
import { User, UserUpdateDto, ChangePasswordDto } from '../model/types'; 

// Get user details by ID
export const getUserById = async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/user/${userId}`);
    console.log(response.data)
    return response.data;
};

// Function to update the current user's profile
// Corresponds to PUT /api/user/update which expects UserUpdateRequestDto
export const updateProfile = async (profileData: UserUpdateDto): Promise<User> => {
    // The backend endpoint PUT /api/user/update expects the full DTO in the body
    const response = await apiClient.put<User>('/user/update', profileData);
    return response.data;
};

// Function to change the current user's password
// Corresponds to PUT /api/user/{userId}/password which expects PasswordUpdateRequestDto in body
export const changePassword = async (userId: string, passwordData: ChangePasswordDto): Promise<void> => {
    await apiClient.put(`/user/${userId}/password`, passwordData); 
}; 