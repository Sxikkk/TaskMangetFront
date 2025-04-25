import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Центрирование по горизонтали
        justifyContent: 'flex-start', // Выравнивание по верху, можно изменить на 'center' для вертикального центрирования
        minHeight: 'calc(100vh - 64px)', // Занимаем всю высоту вьюпорта минус высота AppBar (если есть, стандартная высота MUI AppBar)
        width: '100%',
        pt: 4, // Добавим отступ сверху
        pb: 4, // Добавим отступ снизу
        boxSizing: 'border-box', // Учитываем padding в общей высоте/ширине
      }}
    >
      {/* Опционально: можно добавить контейнер с максимальной шириной */}
      {/* <Box sx={{ width: '100%', maxWidth: 'lg', px: 2 }}> */}
      {children}
      {/* </Box> */}
    </Box>
  );
}; 