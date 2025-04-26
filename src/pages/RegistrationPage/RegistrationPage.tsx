import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper } from '@mui/material';
import { useAuthStore } from '@/app/store/auth.store';
import { RegistrationRequestDto } from '@/features/auth/model/types';
import {RegistrationForm} from "@/features/auth/ui/RegistrationForm.tsx";

const RegistrationPage: React.FC = () => {
    const navigate = useNavigate();
    const { registration, isLoading, error, isAuthenticated, clearError } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/tasks', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        clearError();
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleRegSubmit = async (data: RegistrationRequestDto) => {
        try {
            await registration(data);
        } catch (regError) {
            console.error("Registration attempt failed in component:", regError);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 }}>
                <Typography component="h1" variant="h5">
                    Регистрация
                </Typography>
                <RegistrationForm
                    onSubmit={handleRegSubmit}
                    isLoading={isLoading}
                    error={error}
                />
            </Paper>
        </Container>
    );
};

export default RegistrationPage;