import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    TextField,
    Button,
    InputAdornment,
    CircularProgress,
    Container,
    Link
} from '@mui/material';
import { Mail, ArrowBack, CheckCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../api/api';




export default function ForgotPassword() {
    const navigate = useNavigate();
    
    // States
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSendCode = () => {
        setError(""); // Reset lỗi

        // 1. Validate Email cơ bản
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setError("Please enter your email.");
            return;
        }
        if (!emailRegex.test(email)) {
            setError("Invalid email.");
            return;
        }

        setLoading(true);

        // 2. Gọi API
        apiCall(
            'auth/forget_password', // Endpoint giả định
            'POST',
            null,
            JSON.stringify({ email:email }),
            (data: any) => {
                setLoading(false);
                setIsSuccess(true); // Chuyển sang màn hình thành công
            },
            (err: any) => {
                setLoading(false);
                setError(err.message || "Error! Please try again.");
            }
        );
    };

    // Màn hình thành công (Sau khi gửi mã)
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
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: 'var(--color-bg-success)', // Hoặc '#e8f5e9'
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                    }}>
                        <CheckCircleOutline sx={{ fontSize: 40, color: 'var(--color-text-success)' }} />
                    </Box>
                    
                    <Typography variant="h5" fontWeight="bold" color="#1e293b">
                        We sent verification code to your email
                    </Typography>
                    
                    <Typography color="text.secondary" mb={2}>
                       We sent verification code to your email. Please check your mail box
                    </Typography>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/verify_code',{ state: { email: email } })} // Điều hướng sang trang nhập mã (nếu có)
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            bgcolor: 'var(--color-primary-main)',
                            py: 1.2
                        }}
                    >
                       Enter verification code
                    </Button>

                    <Button
                        variant="text"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/login')}
                        sx={{ textTransform: 'none', color: 'text.secondary', mt: 1 }}
                    >
                        Back to login
                    </Button>
                </Card>
            </Box>
        );
    }

    // Màn hình nhập Email
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
                    <Box textAlign="center" mb={4}>
                        <Box 
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 2,
                                bgcolor: 'var(--color-primary-light)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2
                            }}
                        >
                            <Mail sx={{ color: 'var(--color-primary-main)' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" color="#1e293b" gutterBottom>
                            Forget your password?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your email and get code to reset your password
                        </Typography>
                    </Box>

                    <Box component="form" display="flex" flexDirection="column" gap={3}>
                        <TextField
                            fullWidth
                            label="Email address"
                            placeholder="example@email.com"
                            value={email}
                            onChange={(e) => {setEmail(e.target.value);}}
                            error={!!error}
                            helperText={error}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Mail color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSendCode}
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
                            {loading ? "Sending ...." : "Send verification code"}
                        </Button>
                    </Box>

                    <Box mt={4} textAlign="center">
                        <Link 
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/login')}
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
                            <ArrowBack fontSize="small" /> Back to login
                        </Link>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}