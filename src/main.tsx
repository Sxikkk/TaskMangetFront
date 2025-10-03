import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import { AppRouter } from '@/app/router';
import { useThemeStore } from '@/app/store/theme.store';
import { lightTheme, darkTheme } from '@/app/styles/theme';

// Компонент-обертка для применения темы из Zustand
const ThemedApp = () => {
  const { isDark } = useThemeStore();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
        <Container>
            <CssBaseline /> //lol shpuk
            <AppRouter />
        </Container>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>,
);
