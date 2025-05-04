import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Box, Alert, CircularProgress, Typography } from '@mui/material';
import { RegistrationRequestDto } from '../model/types';
import { Link } from 'react-router-dom';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationRequestDto) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationRequestDto>();

  const handleFormSubmit: SubmitHandler<RegistrationRequestDto> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="Имя"
            autoFocus
            {...register("firstName", {
                required: "Имя обязательно",
            })}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            disabled={isLoading}
        />
        <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Фамилия"
            {...register("lastName", {
            })}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            disabled={isLoading}
        />
        <TextField
            margin="normal"
            required
            fullWidth
            id="secondName"
            label="Отчество"
            {...register("secondName", {
            })}
            error={!!errors.secondName}
            helperText={errors.secondName?.message}
            disabled={isLoading}
        />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Эл. почта"
        autoComplete="email"
        {...register("email", {
            required: "Эл. почта обязательна",
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Неверный формат эл. почты"
            }
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Пароль"
        type="password"
        id="password"
        autoComplete="current-password"
        {...register("password", { required: "Пароль обязателен и должен быть не менее 6 символов", minLength: { message: "Минимум 6 символов", value: 6}})}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Войти'}
      </Button>
        <Typography variant='body1'>Уже есть аккаунт? <Link to={'/login'}>Войдите</Link></Typography>
    </Box>
  );
}; 