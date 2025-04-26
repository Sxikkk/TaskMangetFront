import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/app/store/auth.store';
import ProfilePage from '@/pages/ProfilePage/ProfilePage';
import TasksPage from '@/pages/TasksPage/TasksPage';
import LoginPage from '@/pages/LoginPage';
import Header from '@/widgets/header/Header';
import { Layout } from '@/widgets/Layout/Layout';
import RegistrationPage from "@/pages/RegistrationPage/RegistrationPage.tsx";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <Routes>

        <Route path="/login" element={isAuthenticated ? <Navigate to="/tasks" replace /> : <LoginPage />} />
        <Route path="/registration" element={isAuthenticated ? <Navigate to="/tasks" replace /> : <RegistrationPage />} />

        <Route
          path="/"
          element={(
            <ProtectedRoute>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          )}
        >

          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}; 