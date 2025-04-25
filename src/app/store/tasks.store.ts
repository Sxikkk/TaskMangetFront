import { create } from 'zustand';
import { Task, TaskStatus } from '@/entities/task'; // Импортируем реальные типы
import { fetchTasks /*, createTask, updateTask, deleteTask */ } from '@/entities/task'; // Импортируем API

// Тип для параметров фильтрации, может быть вынесен в entities/task или features/tasks
interface TaskFilters {
  status?: TaskStatus;
  dueDate?: Date; // Используем Date для удобства в UI, конвертируем при запросе
  searchTerm?: string;
}

interface TasksState {
  tasks: Task[];
  filters: TaskFilters;
  sortBy: keyof Pick<Task, 'title' | 'createdAt' | 'status' | 'dueDate'>; // Ключи для сортировки
  isLoading: boolean;
  error: string | null;
  loadTasks: (userId: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSortBy: (sortBy: TasksState['sortBy']) => void;
  // TODO: Добавить методы для создания, обновления, удаления задач
}

// Начальные значения
const initialState: Pick<TasksState, 'tasks' | 'filters' | 'sortBy' | 'isLoading' | 'error'> = {
  tasks: [],
  filters: {},
  sortBy: 'createdAt',
  isLoading: false,
  error: null,
};

export const useTasksStore = create<TasksState>((set, get) => ({
  ...initialState,

  loadTasks: async (userId: string) => {
    if (!userId) return;
    set({ isLoading: true, error: null });
    try {
      // TODO: Передавать фильтры и сортировку в API
      console.log('Fetching tasks for user:', userId, 'Filters:', get().filters, 'SortBy:', get().sortBy);
      // const filters = get().filters;
      // const sortBy = get().sortBy;
      const tasksData = await fetchTasks(userId /*, filters, sortBy */);
      // Имитация загрузки
      // await new Promise(resolve => setTimeout(resolve, 700));
      // const tasksData: Task[] = [
      //   { id: '1', title: 'Fetched Task 1', status: TaskStatus.TODO, createdAt: new Date().toISOString(), userId: userId, dueDate: new Date(Date.now() + 86400000).toISOString() },
      //   { id: '2', title: 'Fetched Task 2', status: TaskStatus.IN_PROGRESS, createdAt: new Date(Date.now() - 86400000).toISOString(), userId: userId },
      // ];
      set({ tasks: tasksData, isLoading: false });
    } catch (err) {
      console.error('Failed to load tasks:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ isLoading: false, error: errorMessage, tasks: [] }); // Сбрасываем задачи при ошибке
    }
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    // Можно добавить автоматическую перезагрузку задач при смене фильтров
    // loadTasks(state.userId); // Потребует хранения userId в сторе или передачи его
  })),

  setSortBy: (sortBy) => set({ sortBy }),
}));

// Пример автоматической перезагрузки при смене фильтров или сортировки (требует userId)
// useTasksStore.subscribe(
//   (state, prevState) => {
//     if (state.filters !== prevState.filters || state.sortBy !== prevState.sortBy) {
//       // Нужен способ получить userId здесь, возможно, хранить его в сторе
//       // const userId = useAuthStore.getState().user?.id;
//       // if (userId) {
//       //   state.loadTasks(userId);
//       // }
//     }
//   }
// ); 