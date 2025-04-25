import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material'; // For loading indicator
import { useAuthStore } from '@/app/store/auth.store';
import ProfilePage from '@/pages/ProfilePage/ProfilePage';
import TasksPage from '@/pages/TasksPage/TasksPage';
import LoginPage from '@/pages/LoginPage'; // Import the actual Login Page
import Header from '@/widgets/header/Header';
import { Layout } from '@/widgets/Layout/Layout';

// Wrapper for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>; // Render children if authenticated
};

// Main App Router Component
export const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Check authentication status on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      {/* Header is rendered outside Routes to be persistent */} 
      <Header /> 
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/tasks" replace /> : <LoginPage />} />

        {/* Protected Routes wrapped in Layout */}
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
          {/* Default route for authenticated users */}
          <Route index element={<Navigate to="/tasks" replace />} /> 
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>

        {/* Catch-all for 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}; 