import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    TextField,
    Button,
    CircularProgress,
    Container,
    Link,
    InputAdornment
} from '@mui/material';
import { Key, ArrowBack, Refresh } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiCall } from '../../api/api'; // Đường dẫn import api của bạn

export default function VerifyCode() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy email được truyền từ trang ForgotPassword sang
    // Nếu user truy cập trực tiếp link này mà không có email, có thể handle redirect về lại
    const email = location.state?.email || ""; 

    // States
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // States cho bộ đếm ngược "Gửi lại mã"
    const [countdown, setCountdown] = useState(0); 

    // Effect: Nếu không có email (truy cập lậu), đá về trang quên mật khẩu
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Effect: Xử lý đếm ngược
    useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleVerify = () => {
        setError("");

        if (!code || code.trim().length === 0) {
            setError("Please enter the verification code.");
            return;
        }

        setLoading(true);

        // Gọi API xác thực
        apiCall(
            `auth/verify_code`, // Endpoint giả định
            'POST',
            null,
            JSON.stringify({email:email,code:code}),
            (data: any) => {
                setLoading(false);
                // Nếu thành công -> Chuyển sang trang đặt lại mật khẩu mới
                // Truyền kèm token hoặc email để step sau biết đang đổi pass cho ai
                navigate('/reset_password', { state: { email: email, code: code } });
            },
            (err: any) => {
                setLoading(false);
                setError(err.message || "Invalid code. Please try again.");
            }
        );
    };

    const handleResendCode = () => {
        if (countdown > 0) return;

        // Gọi lại API gửi mail (giống bên trang ForgotPassword)
        apiCall(
            'auth/forget_password',
            'POST',
            null,
            JSON.stringify({ email: email }),
            () => {
                setCountdown(60); // Reset bộ đếm 60s
                setError(""); // Clear lỗi cũ nếu có
                // Có thể thêm Toast thông báo "Đã gửi lại mã" tại đây
            },
            (err: any) => {
                setError("Cannot resend code right now.");
            }
        );
    };

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
                    {/* Header Icon & Title */}
                    <Box textAlign="center" mb={4}>
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 2,
                                bgcolor: 'var(--color-primary-light)', // Hoặc '#e3f2fd'
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}
                        >
                            <Key sx={{ color: 'var(--color-primary-main)' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" color="#1e293b" gutterBottom>
                            Check your email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            We sent a verification code to <br />
                            <Box component="span" fontWeight="bold" color="text.primary">
                                {email}
                            </Box>
                        </Typography>
                    </Box>

                    {/* Form Input */}
                    <Box component="form" display="flex" flexDirection="column" gap={3}>
                        <TextField
                            fullWidth
                            label="Verification Code"
                            placeholder="Enter 6-digit code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            error={!!error}
                            helperText={error}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Key color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                sx: { letterSpacing: '2px', fontWeight: 'bold' } // Tăng khoảng cách chữ cho dễ nhìn mã
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleVerify}
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} color="inherit" />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                py: 1.5,
                                bgcolor: 'var(--color-primary-main)',
                                '&:hover': {
                                    bgcolor: 'var(--color-primary-dark)'
                                }
                            }}
                        >
                            {loading ? "Verifying..." : "Verify Code"}
                        </Button>
                    </Box>

                    {/* Footer Actions: Resend & Back */}
                    <Box mt={4} display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <Typography variant="body2" color="text.secondary">
                            Didn't receive the email?{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={handleResendCode}
                                disabled={countdown > 0}
                                sx={{
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    color: countdown > 0 ? 'text.disabled' : 'var(--color-primary-main)',
                                    cursor: countdown > 0 ? 'default' : 'pointer'
                                }}
                            >
                                {countdown > 0 ? `Resend in ${countdown}s` : "Click to resend"}
                            </Link>
                        </Typography>

                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/forgot-password')} // Quay lại nhập email khác
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                textDecoration: 'none',
                                color: 'text.secondary',
                                fontWeight: 500,
                                '&:hover': { color: 'var(--color-primary-main)' }
                            }}
                        >
                            <ArrowBack fontSize="small" /> Back
                        </Link>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}