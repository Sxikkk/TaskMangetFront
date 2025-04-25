import { create } from 'zustand';
import { User } from '@/entities/user'; // Импортируем реальный тип
// import { authApi } from '@/features/auth'; // TODO: Импортировать реальное API авторизации

interface AuthState {
  user: User | null;
  // TODO: Добавить isLoading, error состояния
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>; // Сделаем logout асинхронным на всякий случай
  checkAuth: () => Promise<void>; // Метод для проверки авторизации при загрузке
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (email, password) => {
    console.log('Attempting login with:', email, password);
    try {
      // TODO: Заменить на реальный вызов API
      // const userData = await authApi.login(email, password);
      // set({ user: userData });
      // Имитация успешного входа
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ user: { id: 'mock-user-1', name: 'Test User', email: email } });
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      // TODO: Обработать ошибку (например, установить error в state)
    }
  },
  logout: async () => {
    console.log('Attempting logout');
    try {
      // TODO: Заменить на реальный вызов API
      // await authApi.logout();
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ user: null });
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // TODO: Обработать ошибку
    }
  },
  checkAuth: async () => {
    console.log('Checking auth status...');
    try {
      // TODO: Заменить на реальный вызов API для проверки токена/сессии
      // const userData = await authApi.refresh(); // или getMe()
      // set({ user: userData });
      // Имитация проверки (например, токен в localStorage)
      await new Promise(resolve => setTimeout(resolve, 500));
      const maybeUser = localStorage.getItem('mockUser'); // Пример
      if (maybeUser) {
        set({ user: JSON.parse(maybeUser) });
        console.log('Auth check successful');
      } else {
        console.log('No active session found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null }); // Гарантированно сбрасываем пользователя при ошибке
    }
  },
}));

// Пример сохранения/удаления мокового пользователя в localStorage для checkAuth
useAuthStore.subscribe((state, prevState) => {
  if (state.user && !prevState.user) {
    localStorage.setItem('mockUser', JSON.stringify(state.user));
  }
  if (!state.user && prevState.user) {
    localStorage.removeItem('mockUser');
  }
}); 