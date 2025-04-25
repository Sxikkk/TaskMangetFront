import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material';
import { useAuthStore } from '@/app/store/auth.store';
import { UserUpdateDto, ChangePasswordDto } from '@/entities/user';
// import { userApi } from '@/entities/user'; // TODO: Импортировать и использовать реальное API

// Типы для форм, можно вынести в features/profile
type UpdateProfileFormValues = Omit<UserUpdateDto, 'email'> & { // Email обычно не меняют или требуют подтверждения
  confirmPassword?: string; // Пароль для подтверждения изменений (если требуется API)
};

type ChangePasswordFormValues = ChangePasswordDto & {
  confirmNewPassword?: string;
};

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore(); // Предполагаем, что user уже загружен (например, через checkAuth)
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);

  // Форма обновления профиля
  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
    reset: resetUpdateForm,
  } = useForm<UpdateProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
      lastName: user?.lastName || '',
    }
  });

  // Форма смены пароля
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
    reset: resetPasswordForm,
    watch: watchPassword, // Для проверки совпадения паролей
  } = useForm<ChangePasswordFormValues>();

  // Сброс форм при изменении пользователя (на случай, если он обновится)
  useEffect(() => {
    if (user) {
      resetUpdateForm({
        name: user.name,
        lastName: user.lastName || '',
      });
    }
  }, [user, resetUpdateForm]);

  const onUpdateSubmit: SubmitHandler<UpdateProfileFormValues> = async (data) => {
    console.log('Update profile data:', data);
    setUpdateError(null);
    setUpdateSuccess(false);
    if (!user) return;
    try {
      // TODO: Вызвать API обновления профиля
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API
      // await userApi.updateProfile(user.id, { name: data.name, lastName: data.lastName, email: user.email });
      setUpdateSuccess(true);
      // TODO: Обновить пользователя в сторе, если API не возвращает обновленные данные
      // useAuthStore.setState({ user: { ...user, name: data.name, lastName: data.lastName }});
    } catch (error) {
      console.error('Update profile failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setUpdateError(message);
    }
  };

  const onPasswordSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
    console.log('Change password data:', data);
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!user) return;
    if (data.newPassword !== data.confirmNewPassword) {
       setPasswordError('New passwords do not match');
       return;
    }
    try {
      // TODO: Вызвать API смены пароля
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API
      // await userApi.changePassword(user.id, { currentPassword: data.currentPassword, newPassword: data.newPassword });
      setPasswordSuccess(true);
      resetPasswordForm();
    } catch (error) {
      console.error('Change password failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to change password';
      setPasswordError(message);
    }
  };

  if (!user) {
    // Можно показать лоадер или сообщение
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Welcome, {user.name} ({user.email})
      </Typography>

      {/* Форма обновления */} 
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Update Profile</Typography>
        {updateError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUpdateError(null)}>{updateError}</Alert>}
        {updateSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUpdateSuccess(false)}>Profile updated successfully!</Alert>}
        <Box component="form" onSubmit={handleUpdateSubmit(onUpdateSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)'}, p: 1 }}>
              <TextField
                fullWidth
                label="Name"
                {...registerUpdate("name", { required: "Name is required" })}
                error={!!updateErrors.name}
                helperText={updateErrors.name?.message}
                disabled={isUpdating}
              />
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)'}, p: 1 }}>
              <TextField
                fullWidth
                label="Last Name (Optional)"
                {...registerUpdate("lastName")}
                disabled={isUpdating}
              />
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <Button type="submit" variant="contained" color="primary" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Форма смены пароля */} 
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Change Password</Typography>
        {passwordError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError(null)}>{passwordError}</Alert>}
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess(false)}>Password changed successfully!</Alert>}
        <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                {...registerPassword("currentPassword", { required: "Current password is required" })}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message}
                disabled={isChangingPassword}
              />
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                {...registerPassword("newPassword", { 
                    required: "New password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" } 
                })}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message}
                disabled={isChangingPassword}
              />
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                {...registerPassword("confirmNewPassword", { 
                    required: "Please confirm your new password",
                    validate: value => value === watchPassword("newPassword") || "Passwords do not match"
                })}
                error={!!passwordErrors.confirmNewPassword}
                helperText={passwordErrors.confirmNewPassword?.message}
                disabled={isChangingPassword}
              />
            </Box>
            <Box sx={{ width: '100%', p: 1 }}>
              <Button type="submit" variant="contained" color="secondary" disabled={isChangingPassword}>
                 {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage; 