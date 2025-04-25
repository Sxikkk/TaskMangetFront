import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/app/store/auth.store';
import { UserUpdateDto, ChangePasswordDto } from '@/entities/user';
import { updateProfile, changePassword } from '@/entities/user/api/user.api.ts';

// Form value types should align with User entity fields used in form
type UpdateProfileFormValues = {
  firstName: string;
  secondName?: string;
};

type ChangePasswordFormValues = ChangePasswordDto & {
  confirmNewPassword?: string;
};

export const ProfilePage: React.FC = () => {
  // Get user, token setter, and the *token* itself for updating state
  const { user, token } = useAuthStore(); 

  // State for loading, success, error messages for each form
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);

  // Profile Update Form - Register with firstName, secondName
  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    formState: { errors: updateErrors },
    reset: resetUpdateForm,
  } = useForm<UpdateProfileFormValues>({
    defaultValues: { firstName: '', secondName: '' },
  });

  // Password Change Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch: watchPassword, 
  } = useForm<ChangePasswordFormValues>();

  // Effect to populate form with firstName, secondName
  useEffect(() => {
    if (user) {
      resetUpdateForm({
        firstName: user.firstName,
        secondName: user.secondName || '',
      });
    }
  }, [user, resetUpdateForm]);

  // --- Handlers --- 

  const onUpdateSubmit: SubmitHandler<UpdateProfileFormValues> = async (data) => {
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsUpdatingProfile(true);
    if (!user) {
        setIsUpdatingProfile(false);
        setUpdateError("User data not found");
        return;
    }
    try {
      // Construct the DTO required by the backend API (PUT /user/update)
      const dtoToSend: UserUpdateDto = { 
          userId: user.id, // Include userId
          firstName: data.firstName, 
          secondName: data.secondName || undefined, // Send undefined if empty
          // email: user.email // Optionally include email if API supports/requires it
      };
      const updatedUser = await updateProfile(dtoToSend); // Call API
      // Update user state in the auth store, keeping the existing token
      // Need to pass the current token back to the store setter
      // Use setSession (which handles fetching user) or directly set user if API returns it?
      // Since updateProfile returns the updated User, we can perhaps just update state directly?
      // Let's assume setSession is safer as it handles token consistency.
      // However, setSession expects access/refresh tokens, not a user object.
      // We need a way to update just the user in the store.
      
      // Revised approach: Add a dedicated action to auth.store to update user data only.
      // For now, let's just update the user state directly here, assuming token hasn't changed.
      useAuthStore.setState({ user: updatedUser }); 
      
      setUpdateSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile';
      console.error('Update profile failed:', message);
      setUpdateError(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!user) { // Check user exists
        setPasswordError("User not found");
        return;
    }
    if (data.newPassword !== data.confirmNewPassword) {
       setPasswordError('New passwords do not match');
       return;
    }
    
    setIsChangingPassword(true);
    try {
      const passwordDto: ChangePasswordDto = {
         currentPassword: data.currentPassword,
         newPassword: data.newPassword,
      };
      // Call API: PUT /user/{userId}/password
      await changePassword(user.id, passwordDto); 
      setPasswordSuccess(true);
      resetPasswordForm();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to change password';
      console.error('Change password failed:', message);
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Render loading state if user data isn't available yet
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  // --- Render Logic --- 
  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Профиль</Typography>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Добро пожаловать, {user.firstName} ({user.email})
      </Typography>

      {/* Update Profile Form */} 
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Обновить профиль</Typography>
        {/* Display Success/Error Messages */} 
        {updateError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUpdateError(null)}>Ошибка обновления: {updateError}</Alert>}
        {updateSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUpdateSuccess(false)}>Профиль успешно обновлен!</Alert>}
        
        <Box component="form" onSubmit={handleUpdateSubmit(onUpdateSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* First Name Field */} 
            <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)'}, p: 1 }}>
              <TextField fullWidth label="Имя" {...registerUpdate("firstName", { required: "Имя обязательно" })} error={!!updateErrors.firstName} helperText={updateErrors.firstName?.message} disabled={isUpdatingProfile} />
            </Box>
            {/* Second Name Field */} 
            <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)'}, p: 1 }}>
              <TextField fullWidth label="Фамилия (необязательно)" {...registerUpdate("secondName")} disabled={isUpdatingProfile} />
            </Box>
            {/* Submit Button */} 
            <Box sx={{ width: '100%', p: 1 }}>
              <Button type="submit" variant="contained" color="primary" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? <CircularProgress size={24} /> : 'Обновить профиль'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Change Password Form */} 
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Сменить пароль</Typography>
        {/* Display Success/Error Messages */} 
        {passwordError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError(null)}>Ошибка смены пароля: {passwordError}</Alert>}
        {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess(false)}>Пароль успешно изменен!</Alert>}
        
        <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Current Password Field */} 
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField fullWidth type="password" label="Текущий пароль" {...registerPassword("currentPassword", { required: "Текущий пароль обязателен" })} error={!!passwordErrors.currentPassword} helperText={passwordErrors.currentPassword?.message} disabled={isChangingPassword} />
            </Box>
            {/* New Password Field */} 
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField fullWidth type="password" label="Новый пароль" {...registerPassword("newPassword", { required: "Новый пароль обязателен", minLength: { value: 6, message: "Пароль должен быть не менее 6 символов" } })} error={!!passwordErrors.newPassword} helperText={passwordErrors.newPassword?.message} disabled={isChangingPassword} />
            </Box>
            {/* Confirm New Password Field */} 
            <Box sx={{ width: '100%', p: 1 }}>
              <TextField fullWidth type="password" label="Подтвердите новый пароль" {...registerPassword("confirmNewPassword", { required: "Подтвердите новый пароль", validate: value => value === watchPassword("newPassword") || "Пароли не совпадают" })} error={!!passwordErrors.confirmNewPassword} helperText={passwordErrors.confirmNewPassword?.message} disabled={isChangingPassword} />
            </Box>
            {/* Submit Button */} 
            <Box sx={{ width: '100%', p: 1 }}>
              <Button type="submit" variant="contained" color="secondary" disabled={isChangingPassword}>
                 {isChangingPassword ? <CircularProgress size={24} /> : 'Сменить пароль'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage; 