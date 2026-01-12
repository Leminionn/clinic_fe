import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    CircularProgress,
    Box,
    Stack
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, Save, Close } from '@mui/icons-material';
import { apiCall } from '../../api/api';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// Thêm Props cho Modal
interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const { role } = useAuth();
    const navigate= useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: ''
    });

    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);

    // Reset form khi đóng/mở modal
    useEffect(() => {
        if (!open) {
            setFormData({ oldPassword: '', newPassword: '' });
            setLoading(false);
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!formData.oldPassword || !formData.newPassword) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");

        apiCall(
            'change_password', 
            'PUT', 
            accessToken || "",
            JSON.stringify(formData),
            (data: any) => {
                setLoading(false);
                alert("Password changed successfully!");
                onClose();
                navigate("/login"); // Đóng modal thay vì navigate(-1)
            },
            (error: any) => {
                setLoading(false);
                alert(error.message || "Failed to change password.");
            }
        );
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', color: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Change Password
                <IconButton onClick={onClose} size="small"><Close /></IconButton>
            </DialogTitle>
            
            <Divider />

            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        fullWidth
                        label="Old Password"
                        name="oldPassword"
                        type={showOldPass ? 'text' : 'password'}
                        value={formData.oldPassword}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowOldPass(!showOldPass)} edge="end">
                                        {showOldPass ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showNewPass ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end">
                                        {showNewPass ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 'bold' }}>
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
                        fontWeight: 'bold',
                        px: 3,
                        bgcolor: 'var(--color-primary-main)' 
                    }}
                >
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}