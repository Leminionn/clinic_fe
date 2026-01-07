import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Divider,
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { Save, ArrowBack, Person, Email, Phone, Home, Badge, Lock, CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { apiCall } from '../../api/api';
// import { apiCall } from '../../../../api/api'; // Uncomment dòng này khi tích hợp

// --- MOCK API CALL (Thay thế bằng import thực tế của bạn) ---


interface PatientRegisterRequest {
    fullName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email: string;
    idCard: string;
    address: string;
    password: string;
}

export default function PatientRegister() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<PatientRegisterRequest>({
        fullName: '',
        dateOfBirth: dayjs().format('YYYY-MM-DD'),
        gender: 'MALE',
        phone: '',
        email: '',
        idCard: '',
        address: '',
        password: ''
    });

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Submit
    const handleSubmit = () => {
        // Simple Validation
        if (!formData.fullName || !formData.phone || !formData.password || !formData.idCard) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        // Gọi API Đăng ký (Public endpoint thường không cần token)
        apiCall(
            'auth/patient/register', // Endpoint giả định
            'POST',
            null,
            JSON.stringify(formData),
            (data: any) => {
                setLoading(false);
                alert("Registration successful! Please login.");
                navigate('/login'); // Chuyển hướng về trang login
            },
            (error: any) => {
                setLoading(false);
                alert(error.message || "Registration failed.");
            }
        );
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#f4f7fa', // Màu nền giống dashboard
            p: 2
        }}>
            <Card sx={{
                width: '100%',
                maxWidth: 900,
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            }}>
                {/* Header */}
                <Box display="flex" alignItems="center" mb={4}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" fontWeight="bold" color="var(--color-primary-main)">
                        Patient Registration
                    </Typography>
                </Box>

                <Typography variant="h6" fontWeight="bold" mb={2} color="text.secondary">
                    Personal Information
                </Typography>
                <Divider sx={{ mb: 4 }} />

                {/* Form Fields */}
                <Grid container spacing={3}>
                    {/* Full Name */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* ID Card */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="ID Card / Citizen ID"
                            name="idCard"
                            value={formData.idCard}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Badge color="action" /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Date of Birth */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Date of Birth"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><CalendarToday color="action" /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Gender Select */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="gender-label">Gender</InputLabel>
                            <Select
                                labelId="gender-label"
                                name="gender"
                                value={formData.gender}
                                label="Gender"
                                onChange={handleChange}
                            >
                                <MenuItem value="MALE">Male</MenuItem>
                                <MenuItem value="FEMALE">Female</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Phone */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Address */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Home color="action" /></InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Password Section */}
                    <Grid item xs={12}>
                        <Box mt={2}>
                            <Typography variant="h6" fontWeight="bold" mb={2} color="text.secondary">
                                Security
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            helperText="Must be at least 6 characters"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Actions */}
                <Box mt={5} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                            py: 1.2
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
                            px: 4,
                            py: 1.2,
                            fontWeight: 'bold',
                            bgcolor: 'var(--color-primary-main)', // Sử dụng biến màu của bạn
                            '&:hover': {
                                bgcolor: 'var(--color-primary-dark)' // Hoặc để default hover
                            }
                        }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </Button>
                </Box>
            </Card>
        </Box>
    );
}