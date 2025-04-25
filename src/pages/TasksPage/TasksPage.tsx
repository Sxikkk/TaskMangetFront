import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Select, MenuItem, TextField, Card, CardContent, CardActions, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Box, Typography, CircularProgress, Alert, InputLabel, FormControl, SelectChangeEvent, Paper, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import { debounce } from 'lodash';
import { useTasksStore } from '@/app/store/tasks.store';
import { useAuthStore } from '@/app/store/auth.store';
import { Task, TaskStatus, TaskCreateDto, TaskUpdateDto } from '@/entities/task';
import { TaskForm } from '@/features/tasks/ui/TaskForm';
import { ModalDialog } from '@/shared/ui/ModalDialog';
import { TaskFormData } from '@/features/tasks/model/types';
import { mapTaskStatusFromBackend } from '@/entities/task/lib';

// Helper to get Russian status text from number
const getStatusText = (statusNumber: number): string => {
    const statusEnum = mapTaskStatusFromBackend(statusNumber);
    switch (statusEnum) {
        case TaskStatus.TODO: return 'К выполнению';
        case TaskStatus.IN_PROGRESS: return 'В процессе';
        case TaskStatus.DONE: return 'Выполнено';
        case TaskStatus.ARCHIVED: return 'Архивировано';
        default: return 'Неизвестно';
    }
};

export const TasksPage: React.FC = () => {
    const { 
        tasks, filters, sortBy, isLoading, error, 
        loadTasks, setFilters, setSortBy, 
        addTask, editTask, removeTask, clearError
    } = useTasksStore();
    const { user } = useAuthStore();
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');

    // State for Add/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    // State for Delete Confirmation Dialog
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    // Load tasks on mount or when user changes
    useEffect(() => {
        if (user?.id) { // Check if user exists before loading
            clearError(); 
            loadTasks(); // loadTasks now gets userId from authStore internally
        }
      // Depend on user.id to reload tasks if user changes
    }, [user?.id, loadTasks, clearError]); 

    // Debounced search filter update
    const debouncedSetSearchFilter = useCallback(
      debounce((term: string) => {
        setFilters({ searchTerm: term || undefined });
      }, 300),
      [setFilters]
    );

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const term = event.target.value;
      setLocalSearchTerm(term);
      debouncedSetSearchFilter(term);
    };

    // Filter and sort handlers
    const handleSortChange = (event: SelectChangeEvent<typeof sortBy>) => {
      setSortBy(event.target.value as typeof sortBy);
    };

    const handleStatusFilterChange = (event: SelectChangeEvent<TaskStatus | '' >) => {
      setFilters({ status: event.target.value as TaskStatus || undefined });
    };

    const handleDateFilterChange = (date: Date | null) => {
      setFilters({ dueDate: date }); 
    };

    // --- Modal Handling --- 
    const handleOpenAddTaskModal = () => {
        setEditingTask(null);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleOpenEditTaskModal = (task: Task) => {
        setEditingTask(task);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
        setModalError(null);
    };

    // Form submission handler - receives TaskFormData, calls store actions
    const handleFormSubmit = async (formData: TaskFormData) => { // Expect TaskFormData now
        setModalError(null); 
        try {
            if (editingTask) {
                // Pass taskId and the TaskFormData to the store action
                await editTask(editingTask.id, formData);
            } else {
                // Pass TaskFormData to the store action
                await addTask(formData);
            }
            handleCloseModal();
        } catch (err: any) {
            console.error("Form submission error:", err.message);
            setModalError(err.message || "Failed to save task");
        }
    };

     // --- Delete Confirmation Handling --- 
    const handleOpenConfirmDialog = (taskId: string) => {
        setTaskToDelete(taskId);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setTaskToDelete(null);
        setIsConfirmOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (taskToDelete) {
            try {
                await removeTask(taskToDelete);
                handleCloseConfirmDialog();
            } catch (err: any) {
                console.error("Delete task error:", err.message);
                alert(`Error deleting task: ${err.message}`);
                handleCloseConfirmDialog();
            }
        }
    };
    
    // Client-side filtering and sorting
    const filteredAndSortedTasks = useMemo(() => { 
        let result = [...tasks]; // tasks now have status as number
        
        // Filter by status (string filter vs number task status)
        if (filters.status) {
            // Map task status number back to string enum for comparison
            result = result.filter(task => mapTaskStatusFromBackend(task.status) === filters.status);
        }
        // Filter by due date (remains the same)
        if (filters.dueDate) {
            const filterDateStr = filters.dueDate.toISOString().split('T')[0];
            result = result.filter(task => task.dueDate && task.dueDate.startsWith(filterDateStr));
        }
        // Filter by search term (remains the same)
        if (filters.searchTerm) {
            const searchTermLower = filters.searchTerm.toLowerCase();
            result = result.filter(task => 
                task.title.toLowerCase().includes(searchTermLower) ||
                (task.description && task.description.toLowerCase().includes(searchTermLower))
            );
        }
        // Sorting (remains the same, sorts by number status directly if chosen)
        result.sort((a, b) => {
            const valA = a[sortBy];
            const valB = b[sortBy];
            if (valA === undefined && valB === undefined) return 0;
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            // Handle numbers (for status) or strings
            if (typeof valA === 'number' && typeof valB === 'number') {
                return valA - valB;
            }
            if (typeof valA === 'string' && typeof valB === 'string') {
                return valA.localeCompare(valB);
            }
            return 0;
        });
        return result;
    }, [tasks, filters, sortBy]);

    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>Задачи</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddTaskModal}>Добавить Задачу</Button>
        </Box>

        {/* Filter Panel */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: "center" }}>
            <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)'}, p: 1 }}> 
              <TextField fullWidth label="Поиск задач..." variant="outlined" value={localSearchTerm} onChange={handleSearchChange} size="small" />
            </Box>
            <Box sx={{ flexBasis: { xs: '50%', md: 'calc(16.66% - 16px)'}, p: 1 }}> 
              <FormControl fullWidth size="small">
                <InputLabel>Сортировать по</InputLabel>
                <Select value={sortBy} label="Сортировать по" onChange={handleSortChange}>
                  <MenuItem value="createdAt">Дата создания</MenuItem>
                  <MenuItem value="title">Название</MenuItem>
                  <MenuItem value="status">Статус</MenuItem>
                  <MenuItem value="dueDate">Срок выполнения</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flexBasis: { xs: '50%', md: 'calc(25% - 16px)'}, p: 1 }}> 
              <FormControl fullWidth size="small">
                <InputLabel>Фильтр по статусу</InputLabel>
                <Select value={filters.status || ''} label="Фильтр по статусу" onChange={handleStatusFilterChange}>
                  <MenuItem value="">Все статусы</MenuItem>
                  <MenuItem value={TaskStatus.TODO}>К выполнению</MenuItem>
                  <MenuItem value={TaskStatus.IN_PROGRESS}>В процессе</MenuItem>
                  <MenuItem value={TaskStatus.DONE}>Выполнено</MenuItem>
                  <MenuItem value={TaskStatus.ARCHIVED}>Архивировано</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', md: 'calc(25% - 16px)'}, p: 1 }}> 
               <DatePicker selected={filters.dueDate} onChange={handleDateFilterChange} dateFormat="yyyy-MM-dd" placeholderText="Фильтр по сроку" isClearable
                 customInput={<TextField fullWidth size="small" label="Фильтр по сроку" />} />
            </Box>
          </Box>
        </Paper>

        {/* Loading/Error State */}
        {isLoading && tasks.length === 0 && !isModalOpen && !isConfirmOpen && 
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
        {error && !isLoading && <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>Ошибка обработки задач: {error}</Alert>}

        {/* Task List */}
        {tasks.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, opacity: isLoading ? 0.7 : 1 }}>
            {filteredAndSortedTasks.map((task) => (
              <Box key={task.id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)'}, p: 1 }}>
                <Card variant="outlined" sx={{ height: '100%', display:'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>{task.title}</Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">Статус: {getStatusText(task.status)}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Создана: {format(parseISO(task.createdAt), 'Pp')}</Typography>
                    {task.dueDate && (
                      <Typography variant="body2" color={new Date(task.dueDate) < new Date() && task.status !== 2 && task.status !== 3 ? 'error' : 'text.secondary'}>
                        Срок: {format(parseISO(task.dueDate), 'P')}
                      </Typography>
                    )}
                    {task.description && (
                      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{task.description}</Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton size="small" onClick={() => handleOpenEditTaskModal(task)} aria-label={`Редактировать задачу ${task.title}`}>
                      <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenConfirmDialog(task.id)} color="error" aria-label={`Удалить задачу ${task.title}`}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {/* No Tasks / No Matching Tasks Messages */}
        {!isLoading && tasks.length === 0 && (
             <Typography sx={{ textAlign: 'center', mt: 5 }}>Вы еще не создали ни одной задачи.</Typography>
        )}
         {!isLoading && tasks.length > 0 && filteredAndSortedTasks.length === 0 && (
             <Typography sx={{ textAlign: 'center', mt: 5 }}>Не найдено задач, соответствующих вашим фильтрам.</Typography>
        )}

        {/* Add/Edit Task Modal */}
        <ModalDialog
            open={isModalOpen}
            onClose={handleCloseModal}
            title={editingTask ? 'Редактировать Задачу' : 'Добавить Задачу'}
            maxWidth="sm"
        >
            <TaskForm 
                onSubmit={handleFormSubmit} 
                onCancel={handleCloseModal} 
                initialData={editingTask}
                isLoading={isLoading && isModalOpen} 
                error={modalError} 
            />
        </ModalDialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
            open={isConfirmOpen}
            onClose={handleCloseConfirmDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Подтвердите удаление</DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Вы уверены, что хотите удалить эту задачу? Это действие нельзя будет отменить.
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleCloseConfirmDialog} color="inherit">Отмена</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus disabled={isLoading && isConfirmOpen}>
                {isLoading && isConfirmOpen ? <CircularProgress size={20}/> : 'Удалить'}
            </Button>
            </DialogActions>
      </Dialog>

      </Box>
    );
};

export default TasksPage; 