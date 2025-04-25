import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Select, MenuItem, TextField, Card, CardContent, CardActions,
    Box, Typography, CircularProgress, Alert, InputLabel, FormControl, SelectChangeEvent, Paper, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DatePicker from "react-datepicker"; // Используем react-datepicker, как указано
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns'; // Для форматирования дат
import { debounce } from 'lodash'; // Оставляем свою заглушку debounce
import { useTasksStore } from '@/app/store/tasks.store';
import { useAuthStore } from '@/app/store/auth.store';
import { TaskStatus } from '@/entities/task';

// Заглушка debounce
// const debounce = <T extends unknown[]>(
//     func: (...args: T) => void,
//     wait: number
// ) => {
//     let timeout: NodeJS.Timeout;
//
//     return function executedFunction(...args: T): void {
//         const later = () => {
//             clearTimeout(timeout);
//             func(...args);
//         };
//
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//     };
// };

export const TasksPage: React.FC = () => {
    const { 
        tasks, filters, sortBy, isLoading, error, 
        loadTasks, setFilters, setSortBy 
    } = useTasksStore();
    const { user } = useAuthStore();
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');

    // Загрузка задач при монтировании или изменении пользователя
    useEffect(() => {
      if (user?.id) {
         loadTasks(user.id);
      }
      // Не добавляем loadTasks в зависимости, чтобы избежать лишних перезагрузок при обновлении самого loadTasks
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // Debounced функция для обновления фильтра поиска в сторе
    const debouncedSetSearchFilter = useCallback(
      debounce((term: string) => {
        setFilters({ searchTerm: term || undefined });
        // TODO: Возможно, стоит триггерить loadTasks здесь, если API поддерживает поиск на бэке
        // if (user?.id) loadTasks(user.id); 
      }, 300),
      [setFilters /*, user?.id, loadTasks */] // Добавить зависимости, если loadTasks вызывается здесь
    );

    // Обработчик изменения поля поиска
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const term = event.target.value;
      setLocalSearchTerm(term);
      debouncedSetSearchFilter(term);
    };

    // Обработчики изменения фильтров и сортировки
    const handleSortChange = (event: SelectChangeEvent<typeof sortBy>) => {
      setSortBy(event.target.value as typeof sortBy);
       // TODO: Перезагрузка, если сортировка на бэке
       // if (user?.id) loadTasks(user.id);
    };

    const handleStatusFilterChange = (event: SelectChangeEvent<TaskStatus | '' >) => {
      setFilters({ status: event.target.value as TaskStatus || undefined });
       // TODO: Перезагрузка, если фильтрация на бэке
       // if (user?.id) loadTasks(user.id);
    };

    const handleDateFilterChange = (date: Date | null) => {
      setFilters({ dueDate: date || undefined });
       // TODO: Перезагрузка, если фильтрация на бэке
       // if (user?.id) loadTasks(user.id);
    };
    
    // Фильтрация и сортировка на клиенте (если API не поддерживает)
    const filteredAndSortedTasks = useMemo(() => {
        let result = [...tasks];

        // Фильтрация
        if (filters.status) {
            result = result.filter(task => task.status === filters.status);
        }
        if (filters.dueDate) {
            const filterDate = filters.dueDate.toISOString().split('T')[0];
            result = result.filter(task => task.dueDate && task.dueDate.startsWith(filterDate));
        }
        if (filters.searchTerm) {
            const searchTermLower = filters.searchTerm.toLowerCase();
            result = result.filter(task => 
                task.title.toLowerCase().includes(searchTermLower) ||
                task.description?.toLowerCase().includes(searchTermLower)
            );
        }

        // Сортировка
        result.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];

            if (valA === undefined && valB === undefined) return 0;
            if (valA === undefined) return 1; // undefined/null в конец
            if (valB === undefined) return -1;

            if (typeof valA === 'string' && typeof valB === 'string') {
                // Для дат (строки ISO) или строк (title, status)
                return valA.localeCompare(valB);
            }
            // Можно добавить обработку других типов, если sortBy будет расширен
            return 0;
        });

        return result;
    }, [tasks, filters, sortBy]);

    // TODO: Функции для редактирования/удаления
    const handleEditTask = (taskId: string) => {
      console.log('Edit task:', taskId);
      // Открыть модальное окно/форму редактирования
    };

    const handleDeleteTask = (taskId: string) => {
      console.log('Delete task:', taskId);
      // Показать подтверждение и вызвать API удаления
      // deleteTask(taskId).then(() => loadTasks(user.id));
      alert(`Simulating delete task ${taskId}`);
    };

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tasks
        </Typography>

        {/* Панель фильтров и сортировки */} 
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: "center" }}>
            <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)'}, p: 1 }}> {/* md={4} -> 1/3 width, adjust for gap */} 
              <TextField
                fullWidth
                label="Search tasks..."
                variant="outlined"
                value={localSearchTerm}
                onChange={handleSearchChange}
                size="small"
              />
            </Box>
            <Box sx={{ flexBasis: { xs: '50%', md: 'calc(16.66% - 16px)'}, p: 1 }}> {/* md={2} -> 1/6 width, adjust for gap */} 
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  <MenuItem value="createdAt">Date Created</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="dueDate">Due Date</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flexBasis: { xs: '50%', md: 'calc(25% - 16px)'}, p: 1 }}> {/* md={3} -> 1/4 width, adjust for gap */} 
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Status Filter"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(TaskStatus).map(status => (
                     <MenuItem key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', md: 'calc(25% - 16px)'}, p: 1 }}> {/* md={3} -> 1/4 width, adjust for gap */} 
               {/* Используем DatePicker */}
               <DatePicker
                 selected={filters.dueDate}
                 onChange={handleDateFilterChange}
                 dateFormat="yyyy-MM-dd"
                 placeholderText="Filter by Due Date"
                 isClearable
                 customInput={<TextField fullWidth size="small" label="Due Date Filter" />}
               />
            </Box>
             {/* TODO: Добавить кнопку создания задачи */}
             {/* <Box sx={{ flexBasis: '100%', p: 1 }}><Button variant="contained">Add Task</Button></Box> */}
          </Box>
        </Paper>

        {/* Отображение состояния загрузки и ошибок */} 
        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load tasks: {error}</Alert>}

        {/* Список задач */} 
        {!isLoading && !error && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task) => (
                <Box key={task.id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)'}, p: 1 }}> {/* xs=12, sm=6, md=4, adjust for gap */} 
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {task.title}
                      </Typography>
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Status: {task.status?.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Created: {format(parseISO(task.createdAt), 'yyyy-MM-dd HH:mm')}
                      </Typography>
                      {task.dueDate && (
                        <Typography variant="body2" color={new Date(task.dueDate) < new Date() ? 'error' : 'text.secondary'}>
                          Due: {format(parseISO(task.dueDate), 'yyyy-MM-dd')}
                        </Typography>
                      )}
                      {task.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {task.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => handleEditTask(task.id)}>
                        <EditIcon fontSize="small"/>
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteTask(task.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Box>
              ))
            ) : (
              <Box sx={{ width: '100%', p: 1 }}> {/* xs=12 */} 
                 <Typography sx={{ textAlign: 'center', mt: 3 }}>No tasks found matching your criteria.</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
};

export default TasksPage; 