import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { TextField, Button, Box, Select, MenuItem, FormControl, InputLabel, FormHelperText, CircularProgress } from '@mui/material';
import DatePicker from 'react-datepicker'; // Reuse DatePicker
import 'react-datepicker/dist/react-datepicker.css';
import { Task, TaskStatus, TaskCreateDto, TaskUpdateDto } from '@/entities/task';
import { TaskFormData } from '../model/types'; // Import TaskFormData
import { mapTaskStatusFromBackend } from '@/entities/task/lib'; // Import mapper

// Function to convert Task entity to form data
const taskToFormData = (task: Task | null): TaskFormData => ({
  title: task?.title || '',
  description: task?.description || '',
  // Map number status from task (or default 0 for new tasks) to string enum for the form
  status: mapTaskStatusFromBackend(task ? task.status : 0), 
  dueDate: task?.dueDate ? new Date(task.dueDate) : null,
});

// Function formDataToDto removed - DTO creation logic moved to parent component

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>; // Now expects TaskFormData
  onCancel: () => void;
  initialData: Task | null; // Task object if editing, null if creating
  isLoading: boolean;
  error?: string | null; // Optional error from parent/store
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialData, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    control, // Needed for Controller components like DatePicker
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: taskToFormData(initialData),
  });

  // Reset form if initialData changes (e.g., opening modal for different task)
  useEffect(() => {
    reset(taskToFormData(initialData));
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<TaskFormData> = async (data) => {
    // Directly pass the form data to the parent onSubmit handler
    await onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Display general error if provided */}
      {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} */}
      <TextField
        margin="normal"
        required
        fullWidth
        id="title"
        label="Название задачи"
        autoFocus
        {...register("title", { required: "Название обязательно" })}
        error={!!errors.title}
        helperText={errors.title?.message}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        fullWidth
        multiline
        rows={3}
        id="description"
        label="Описание (обязательно)"
        {...register("description")}
        disabled={isLoading}
      />
       <FormControl fullWidth margin="normal" error={!!errors.status} disabled={isLoading}>
        <InputLabel id="status-label">Статус</InputLabel>
        <Controller
          name="status"
          control={control}
          rules={{ required: 'Статус обязателен' }}
          render={({ field }) => (
            <Select
              labelId="status-label"
              id="status"
              label="Статус"
              {...field}
            >
              <MenuItem value={TaskStatus.TODO}>К выполнению</MenuItem>
              <MenuItem value={TaskStatus.IN_PROGRESS}>В процессе</MenuItem>
              <MenuItem value={TaskStatus.DONE}>Выполнено</MenuItem>
              <MenuItem value={TaskStatus.ARCHIVED}>Архивировано</MenuItem>
            </Select>
          )}
        />
         {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
      </FormControl>

       <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Срок выполнения (необязательно)"
              isClearable
              customInput={
                 <TextField
                   label="Срок выполнения (необязательно)"
                   fullWidth
                   margin="normal"
                   error={!!errors.dueDate}
                   helperText={errors.dueDate?.message}
                   disabled={isLoading}
                 />
               }
            />
          )}
       />

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel} disabled={isLoading} color="inherit">
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : (initialData ? 'Сохранить' : 'Создать задачу')}
        </Button>
      </Box>
    </Box>
  );
}; 