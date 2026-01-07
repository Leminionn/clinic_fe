import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    TextField,
    Button,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment
} from '@mui/material';
import { LockReset, Visibility, VisibilityOff, CheckCircleOutline, ArrowForward } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCall } from '../../api/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy dữ liệu từ trang VerifyCode chuyển sang
    const { email, code } = location.state || {};

    // States
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    
    // States hiển thị password (ẩn/hiện)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Kiểm tra bảo mật: Nếu user vào thẳng link này mà ko có email/code -> Đá về login
    useEffect(() => {
        if (!email || !code) {
            navigate('/login');
        }
    }, [email, code, navigate]);

    const handleResetPassword = () => {
        setError("");

        // 1. Validate
        if (!newPassword || !confirmNewPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) { // Ví dụ validate độ dài
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        // 2. Chuẩn bị payload đúng như bạn yêu cầu
        const payload = {
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword,
            verificationCode: code,  // Lấy từ state truyền qua
            email: email             // Lấy từ state truyền qua
        };

        // 3. Gọi API
        apiCall(
            'auth/reset_password', // Endpoint giả định
            'POST',
            null,
            JSON.stringify(payload),
            (data: any) => {
                setLoading(false);
                setIsSuccess(true); // Hiển thị màn hình thành công
            },
            (err: any) => {
                setLoading(false);
                setError(err.message || "Failed to reset password.");
            }
        );
    };

    // --- MÀN HÌNH THÀNH CÔNG ---
    if (isSuccess) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#f4f7fa',
                p: 2
            }}>
                <Card sx={{
                    p: 5,
                    borderRadius: 3,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                    maxWidth: 450,
                    width: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Box sx={{
                        width: 70, height: 70, borderRadius: '50%',
                        bgcolor: 'var(--color-bg-success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1
                    }}>
                        <CheckCircleOutline sx={{ fontSize: 40, color: 'var(--color-text-success)' }} />
                    </Box>
                    
                    <Typography variant="h5" fontWeight="bold" color="#1e293b">
                        Password Reset Successfully
                    </Typography>
                    
                    <Typography color="text.secondary" mb={2}>
                        Your password has been updated. You can now login with your new password.
                    </Typography>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/login')}
                        endIcon={<ArrowForward />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            bgcolor: 'var(--color-primary-main)',
                            py: 1.2
                        }}
                    >
                        Back to Login
                    </Button>
                </Card>
            </Box>
        );
    }

    // --- MÀN HÌNH NHẬP PASSWORD ---
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#f4f7fa',
            p: 2
        }}>
            <Container maxWidth="xs">
                <Card sx={{
                    p: 4,
                    borderRadius: 3,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                }}>
                    {/* Header */}
                    <Box textAlign="center" mb={4}>
                        <Box sx={{
                            width: 50, height: 50, borderRadius: 2,
                            bgcolor: 'var(--color-primary-light)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2
                        }}>
                            <LockReset sx={{ color: 'var(--color-primary-main)', fontSize: 28 }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" color="#1e293b" gutterBottom>
                            Set new password
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Must be at least 6 characters long.
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" display="flex" flexDirection="column" gap={2.5}>
                        
                        {/* New Password Input */}
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            error={!!error}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        {/* Confirm Password Input */}
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            error={!!error}
                            helperText={error}
                            onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        {/* Submit Button */}
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleResetPassword}
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} color="inherit" />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                py: 1.5,
                                bgcolor: 'var(--color-primary-main)',
                                mt: 1,
                                '&:hover': { bgcolor: 'var(--color-primary-dark)' }
                            }}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </Box>
                    
                    {/* Footer - Back to Login */}
                    <Box mt={3} textAlign="center">
                         <Button
                            variant="text"
                            onClick={() => navigate('/login')}
                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                        >
                            Back to Login
                        </Button>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}