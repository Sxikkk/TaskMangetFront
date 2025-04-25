import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Базовая тема Material UI
// Вы можете настроить палитру, типографику и другие параметры здесь
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#556cd6', // Пример основного цвета
    },
    secondary: {
      main: '#19857b', // Пример вторичного цвета
    },
    error: {
      main: red.A400,
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Пример основного цвета для темной темы
    },
    secondary: {
      main: '#f48fb1', // Пример вторичного цвета для темной темы
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#303030',
      paper: '#424242',
    },
  },
}); 