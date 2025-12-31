import React, { use, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Divider,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    CircularProgress,
    Container
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../api/api';// Đảm bảo đường dẫn đúng
import { useAuth } from '../../auth/AuthContext';

export default function ChangePassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {role} = useAuth();
    useEffect(()=>{
        if(!role) {
            navigate("/login");
        }
    },[role])

    // Form State
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: ''
    });

    // Visibility State
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = () => {
        if (!formData.oldPassword || !formData.newPassword) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");

        apiCall(
            'change_password', // Endpoint giả định
            'PUT', // Hoặc PUT tùy backend
            accessToken || "",
            JSON.stringify(formData),
            (data: any) => {
                setLoading(false);
                alert("Password changed successfully!");
                navigate(-1); // Quay lại trang trước
            },
            (error: any) => {
                setLoading(false);
                alert(error.message || "Failed to change password.");
            }
        );
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100%',
            bgcolor: '#f4f7fa', // Màu nền dashboard
            p: 3
        }}>
            <Container maxWidth="sm">
                <Card sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" mb={3}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(-1)}
                            sx={{ mr: 1, textTransform: 'none', color: 'text.secondary', minWidth: 'auto' }}
                        >
                            Back
                        </Button>
                        <Typography variant="h5" fontWeight="bold" color="#1e293b">
                            Change Password
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Box component="form" display="flex" flexDirection="column" gap={3}>
                        
                        {/* Old Password */}
                        <TextField
                            fullWidth
                            label="Old Password"
                            name="oldPassword"
                            type={showOldPass ? 'text' : 'password'}
                            value={formData.oldPassword}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowOldPass(!showOldPass)}
                                            edge="end"
                                        >
                                            {showOldPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* New Password */}
                        <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            type={showNewPass ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            edge="end"
                                        >
                                            {showNewPass ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Action Buttons */}
                        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3,
                                    color: 'text.secondary',
                                    borderColor: 'var(--color-border)'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3,
                                    fontWeight: 'bold',
                                    bgcolor: 'var(--color-primary-main)',
                                    '&:hover': {
                                        bgcolor: 'var(--color-primary-dark)'
                                    }
                                }}
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}