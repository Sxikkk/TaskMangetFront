import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import TaskIcon from '@mui/icons-material/Task';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/app/store/theme.store';
import { useAuthStore } from '@/app/store/auth.store';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Перенаправляем на главную (логин) после выхода
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle} onKeyDown={handleDrawerToggle}>
      <List>
        {[ // Массив для элементов меню
          { text: 'Tasks', path: '/tasks', icon: <TaskIcon /> },
          { text: 'Profile', path: '/profile', icon: <AccountCircleIcon /> },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              {/* <ListItemIcon>{item.icon}</ListItemIcon> // Можно добавить иконки */}
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          TaskManager
        </Typography>

        <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>

        {user ? (
          <>
            <Tooltip title="Profile">
              <IconButton
                 color="inherit"
                 component={RouterLink}
                 to="/profile"
                 sx={{ ml: 1 }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                <ExitToAppIcon />
              </IconButton>
             </Tooltip>
          </>
        ) : (
          <Button color="inherit" component={RouterLink} to="/"> {/* TODO: Ссылка на страницу логина */} 
            Login
          </Button>
        )}
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header; 