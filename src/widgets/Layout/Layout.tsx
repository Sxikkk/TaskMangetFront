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
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        pt: 4,
        pb: 4,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Box>
  );
}; 