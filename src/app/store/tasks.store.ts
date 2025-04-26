import { create } from 'zustand';
import { Task, TaskStatus, TaskCreateDto, TaskUpdateDto, TaskDeleteDto } from '@/entities/task';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@/entities/task/api/task.api.ts'; // Import corrected API functions
import { useAuthStore } from './auth.store'; // Import auth store to get userId
import { TaskFormData } from '@/features/tasks/model/types'; // Import TaskFormData
import { mapTaskStatusToBackend, mapTaskStatusFromBackend } from '@/entities/task/lib'; // Import mappers

// Тип для параметров фильтрации, может быть вынесен в entities/task или features/tasks
interface TaskFilters {
  status?: TaskStatus;
  dueDate?: Date | null; // Используем Date для удобства в UI, конвертируем при запросе
  searchTerm?: string;
}

interface TasksState {
  tasks: Task[];
  filters: TaskFilters;
  sortBy: keyof Pick<Task, 'title' | 'createdAt' | 'status' | 'dueDate'>; // Ключи для сортировки
  isLoading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>; // Requires userId from authStore
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSortBy: (sortBy: TasksState['sortBy']) => void;
  addTask: (formData: TaskFormData) => Promise<void>; // Form data without userId
  editTask: (taskId: string, formData: TaskFormData) => Promise<void>; // Form data without taskId
  removeTask: (taskId: string) => Promise<void>;
  clearError: () => void;
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

  loadTasks: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
        console.warn('loadTasks called without authenticated user.');
        set({ tasks: [], isLoading: false, error: 'User not authenticated' });
        return; 
    }
    set({ isLoading: true, error: null });
    try {
      console.log(`Fetching tasks for user: ${userId}`, 'Filters:', get().filters, 'SortBy:', get().sortBy);
      // Tasks received from API will have status as number
      const tasksData = await fetchTasks(userId);
      // Store tasks with status as number
      set({ tasks: tasksData, isLoading: false });
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load tasks';
      set({ isLoading: false, error: errorMessage, tasks: [] });
    }
  },

  setFilters: (newFilters) => {
      const updatedFilters = { ...get().filters, ...newFilters };
      if (newFilters.dueDate === null) {
          updatedFilters.dueDate = null;
      }
      set({ filters: updatedFilters });
      // TODO: Trigger loadTasks if server-side filtering
  },

  setSortBy: (sortBy) => {
      set({ sortBy });
      // TODO: Trigger loadTasks if server-side sorting
  },

  addTask: async (formData) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Cannot add task: User not authenticated');

    // Map status string to number and convert dueDate
    const taskData: TaskCreateDto = { 
        userId,
        title: formData.title,
        description: formData.description,
        status: mapTaskStatusToBackend(formData.status), // Map status
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null 
    };
    set({ isLoading: true, error: null });
    try {
      const newTask = await createTask(taskData); 
      // newTask from API has status as number, store directly
      set((state) => ({ 
        tasks: [...state.tasks, newTask],
        isLoading: false 
      }));
    } catch (err: any) {
      console.error('Failed to add task:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add task';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  editTask: async (taskId, formData) => {
     // Map status string to number and convert dueDate
    const taskData: TaskUpdateDto = { 
        taskId, 
        title: formData.title || undefined,
        description: formData.description || undefined,
        status: mapTaskStatusToBackend(formData.status), // Map status
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null 
    };
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await updateTask(taskData);
      // updatedTask from API has status as number, store directly
      set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === taskId ? updatedTask : task
        ),
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('Failed to edit task:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to edit task';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  removeTask: async (taskId) => {
    const deleteData: TaskDeleteDto = { taskId };
    set({ isLoading: true, error: null });
    try {
      await deleteTask(deleteData); // Calls POST /task/delete
       set((state) => ({
         tasks: state.tasks.filter((task) => task.id !== taskId),
         isLoading: false,
       }));
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete task';
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage); // Re-throw for component handling
    }
  },

  clearError: () => set({ error: null }),

}));

// Remove old subscription logic
// useTasksStore.subscribe(...) 