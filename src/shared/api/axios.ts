import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Замените на URL вашего бэкенда

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  },
});

// Пример интерцептора для добавления токена авторизации
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('authToken'); // Или из Zustand стора
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Пример интерцептора для обработки ошибок
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Например, перенаправить на страницу логина
//       console.error('Unauthorized access - redirecting to login');
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance; 