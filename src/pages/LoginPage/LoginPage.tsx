import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper } from '@mui/material';
import { useAuthStore } from '@/app/store/auth.store';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { LoginRequestDto } from '@/features/auth/model/types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tasks', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    return () => {
        clearError();
    };
  }, [clearError]);

  const handleLoginSubmit = async (data: LoginRequestDto) => {
    try {
        await login(data);
    } catch (loginError) {
        console.error("Login attempt failed in component:", loginError);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 }}>
        <Typography component="h1" variant="h5">
          Вход
        </Typography>
        <LoginForm
          onSubmit={handleLoginSubmit}
          isLoading={isLoading}
          error={error}
        />
      </Paper>
    </Container>
  );
};

export default LoginPage;