import React, { useState } from 'react';
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
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { 
    Person, 
    Lock, 
    Visibility, 
    VisibilityOff, 
    Save, 
    ArrowBack, 
    Badge, 
    AdminPanelSettings 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../api/api'; // Đảm bảo đường dẫn đúng

// Enum Role khớp với Java
const ROLES = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'WAREHOUSE_STAFF', label: 'Warehouse Staff' },
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'PATIENT', label: 'Patient' }
];

interface CreateAccountRequest {
    actorId: number | '';
    username: string;
    role: string;
    password: string;
}

export default function CreateAccount() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<CreateAccountRequest>({
        actorId: '',
        username: '',
        role: '', // Default empty
        password: ''
    });

    // Visibility State for Password
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.actorId || !formData.username || !formData.role || !formData.password) {
            alert("Please fill in all required fields.");
            return;
        }

        // Validate actorId is number
        if (isNaN(Number(formData.actorId))) {
            alert("Actor ID must be a number.");
            return;
        }

        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");

        // Chuẩn bị payload (chuyển actorId sang số)
        const payload = {
            ...formData,
            actorId: Number(formData.actorId)
        };

        apiCall(
            'auth/link_account', // Endpoint giả định (thường Admin mới tạo đc tk cho staff)
            'POST', 
            null,
            JSON.stringify(payload),
            (data: any) => {
                setLoading(false);
                alert("Account created  and linked successfully!");
                navigate(-1); // Quay lại trang danh sách
            },
            (error: any) => {
                setLoading(false);
                alert(error.message || "Failed to create account. Username might be taken.");
            }
        );
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh', // Full màn hình
            bgcolor: '#f4f7fa',
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
                            Create New Account
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Box component="form" display="flex" flexDirection="column" gap={3}>
                        
                        {/* Actor ID */}
                        <TextField
                            fullWidth
                            label="Actor ID (Staff/Patient ID)"
                            name="actorId"
                            value={formData.actorId}
                            onChange={handleChange}
                            required
                            type="number"
                            helperText="ID của nhân viên hoặc bệnh nhân sở hữu tài khoản này"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Badge color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Username */}
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Role Select */}
                        <FormControl fullWidth required>
                            <InputLabel id="role-select-label">Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                                startAdornment={
                                    <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                                        <AdminPanelSettings color="action" />
                                    </InputAdornment>
                                }
                            >
                                {ROLES.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Password */}
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
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
                                {loading ? "Creating..." : "Create Account"}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}