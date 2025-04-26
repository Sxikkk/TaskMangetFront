import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {TextField, Button, Box, Alert, CircularProgress, Typography} from '@mui/material';
import { LoginRequestDto } from '../model/types';
import {Link} from "react-router-dom";

interface LoginFormProps {
  onSubmit: (data: LoginRequestDto) => Promise<void>; // Expects the login action from the store
  isLoading: boolean;
  error: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequestDto>();

  const handleFormSubmit: SubmitHandler<LoginRequestDto> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Эл. почта"
        autoComplete="email"
        autoFocus
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
        {...register("password", { required: "Пароль обязателен" })}
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
        <Typography variant='body1'>Нет аккаунта? <Link to={'/registration'}>Зарегистрируйтесь</Link></Typography>
    </Box>
  );
}; 