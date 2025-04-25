import axiosInstance from '@/shared/api/axios.ts';
import axios, {AxiosRequestConfig} from "axios";

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    AccessToken: string;
    RefreshToken: string;
}

export const authLogin = async (loginData: AxiosRequestConfig<LoginData>): Promise<AuthResponse> => {
    try {
        const response = await axiosInstance.get('/login', loginData);
        if (response.status === 200) {
            if (response.data.AccessToken) {
                localStorage.setItem('accessToken', response.data.AccessToken);
            }
            if (response.data.RefreshToken) {
                localStorage.setItem('refreshToken', response.data.RefreshToken);
            }
        }

        return response.data;
    } catch (e) {
        if (axios.isAxiosError(e)) {
            throw new Error(e.response?.data?.message || 'Login failed');
        }
        throw new Error('Login failed');
    }
}