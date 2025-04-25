import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Paper } from '@mui/material';
import { useAuthStore } from '@/app/store/auth.store';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { LoginRequestDto } from '@/features/auth/model/types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tasks', { replace: true }); // Or to the intended page after login
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => {
        clearError();
    };
  }, [clearError]);

  const handleLoginSubmit = async (data: LoginRequestDto) => {
    try {
        await login(data);
        // Navigation is handled by the useEffect hook above
    } catch (loginError) {
        // Error is already set in the store by the login action
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

export default LoginPage; // Default export for lazy loading 