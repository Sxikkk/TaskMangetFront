import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProfilePage from '@/pages/ProfilePage/ProfilePage'; // Импортируем реальную страницу
import TasksPage from '@/pages/TasksPage/TasksPage'; // Импортируем реальную страницу
import Header from '@/widgets/header/Header'; // Импортируем Header
import { Layout } from '@/widgets/Layout'; // Импортируем наш новый Layout

// Удаляем старый локальный Layout
// const Layout = () => (
//   <div>
//     <Header />
//     <main style={{ padding: '20px' }}>
//       <Outlet />
//     </main>
//   </div>
// );

export const AppRouter: React.FC = () => {
  // TODO: Добавить логику проверки авторизации (например, из useAuthStore)
  const isAuthenticated = true; // Заглушка

  return (
    <BrowserRouter>
      <Routes>
         {/* Header рендерится для всех роутов */}
         {/* Layout оборачивает только контент, требующий центрирования */} 
        <Route 
          path="/"
          element={(
            <>
              <Header />
              <Layout>
                <Outlet />
              </Layout>
            </>
          )}
        >
          {isAuthenticated ? (
            <>
              <Route index element={<Navigate to="/tasks" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="tasks" element={<TasksPage />} />
            </>
          ) : (
            <>
              {/* TODO: Добавить роуты для неавторизованных пользователей (Login, Register) */}
              <Route index element={<div>Login Page Placeholder</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Route>
        <Route path="*" element={<div>404 Not Found</div>} /> {/* Обработка несуществующих роутов */}
      </Routes>
    </BrowserRouter>
  );
}; 