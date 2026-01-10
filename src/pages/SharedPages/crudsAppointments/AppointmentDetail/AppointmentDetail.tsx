import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Divider,
    Grid,
    Avatar,
    Chip,
    Stack,
    Button
} from '@mui/material';
import {
    CalendarToday,
    AccessTime,
    Person,
    MedicalServices,
    EventAvailable,
    ArrowBack,
    Done // Import icon mới
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { apiCall } from '../../../../api/api';
import AlertDialog from '../../crudsReceptionList/ReceptionList/Alert';// Giả định file alert.tsx nằm ở đây

export interface AppointmentDetailDTO {
    appointmentId: number;
    patient: {
        patientId: number;
        fullName: string;
        avatar?: string;
        phone?: string;
    } | null;
    doctorId: number;
    doctorName: string;
    staff?: {
        avatar?: string;
    }; 
    appointmentDate: string;
    appointmentTime: string;
    status: 'SCHEDULED' | 'DONE' | 'CANCELLED' | 'ABSENT' | 'CONFIRMED';
    createDate: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCHEDULED': return { color: 'var(--color-text-info)', bg: 'var(--color-bg-info)', label: 'Scheduled' };
        case 'CONFIRMED': return { color: 'var(--color-text-warning)', bg: 'var(--color-bg-warning)', label: 'Checked in' };
        case 'DONE': // Đổi COMPLETED thành DONE cho khớp với Interface của bạn
        case 'COMPLETED': return { color: 'var(--color-text-success)', bg: 'var(--color-bg-success)', label: 'Completed' };
        case 'CANCELLED': return { color: 'var(--color-text-error)', bg: 'var(--color-bg-error)', label: 'Cancelled' };
        case 'NOSHOW': return { color: '#718096', bg: '#edf2f7', label: 'No Show' };
        default: return { color: '#6226ef', bg: '#e0d4fc', label: status };
    }
};

const AppointmentDetail = () => {
    const navigate = useNavigate();
    const role = useAuth();
    const { id } = useParams();
    const [appointment, setAppointment] = useState<AppointmentDetailDTO>();
    
    // --- NEW STATES ---
    const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAppointment = () => {
        let url = "";
        if (role.role === "Admin") url = `admin/appointment_by_id/${id}`;
        if (role.role === "Receptionist") url = `receptionist/appointment_by_id/${id}`;
        if (role.role === "Patient") url = `patient/appointment/${id}`;
        if (role.role === "Doctor") url = `doctor/appointment_by_id/${id}`;
        
        const accessToken = localStorage.getItem("accessToken");
        apiCall(url, 'GET', accessToken ? accessToken : "", null, (data: any) => {
            setAppointment(data.data);
        }, (data: any) => {
            alert(data.message);
            navigate(-1);
        });
    };

    useEffect(() => {
        fetchAppointment();
    }, []);

    // --- NEW LOGIC: COMPLETE APPOINTMENT ---
    const handleComplete = () => {
        setIsSubmitting(true);
        const accessToken = localStorage.getItem("accessToken");
        const prefix = role.role?.toLowerCase();
        
        const payload = {
            appointmentId: Number(id),
            status: 'DONE'
        };

        apiCall(`${prefix}/change_appointment_status/${id}?status=COMPLETED`, 'GET', accessToken || "", null, 
            (data: any) => {
                setIsSubmitting(false);
                fetchAppointment(); // Refresh lại dữ liệu để cập nhật trạng thái DONE lên UI
            }, 
            (data: any) => {
                setIsSubmitting(false);
                alert(data.message || "Failed to complete appointment");
            }
        );
    };

    const onBack = () => {
        navigate(-1);
    }

    if (!appointment) {
        return (
            <Box p={3} textAlign="center">
                <Typography color="text.secondary">No appointment.</Typography>
            </Box>
        );
    }

    const statusStyle = getStatusColor(appointment.status);

    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: '#f4f7fa',
                p: { xs: 2, md: 3 }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Button 
                        startIcon={<ArrowBack />} 
                        onClick={onBack}
                        sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Back
                    </Button>
                    <Typography variant="h5" fontWeight="bold" color="#1e293b">
                        Detail #{appointment.appointmentId}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    {/* Nút Edit cũ */}
                    {appointment.status == 'SCHEDULED' && (role.role == "Patient" || role.role == "Receptionist") && (
                        <Button 
                            variant="outlined"
                            onClick={() => {
                                const prefix = role.role == "Patient" ? "patient" : "receptionist";
                                navigate(`/${prefix}/appointment/update/${appointment.appointmentId}`)
                            }}
                        >
                            Edit
                        </Button>
                    )}

                    {/* --- NÚT COMPLETE MỚI --- */}
                    {appointment.status === 'CONFIRMED' && (role.role === "Doctor" || role.role === "Receptionist") && (
                        <Button 
                            variant="contained" 
                            color="success"
                            startIcon={<Done />}
                            onClick={() => setIsCompleteDialogOpen(true)}
                            sx={{ fontWeight: 'bold' }}
                        >
                            Complete Appointment
                        </Button>
                    )}
                </Stack>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Information
                            </Typography>
                            <Chip 
                                label={statusStyle.label}
                                sx={{ 
                                    bgcolor: statusStyle.bg, 
                                    color: statusStyle.color,
                                    fontWeight: 'bold',
                                    borderRadius: 1.5
                                }} 
                            />
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<CalendarToday color="action" />} 
                                    label="Appointment date" 
                                    value={dayjs(appointment.appointmentDate).format("DD/MM/YYYY")} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<AccessTime color="action" />} 
                                    label="Appointment time" 
                                    value={appointment.appointmentTime.substring(0, 5)} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<EventAvailable color="action" />} 
                                    label="Create at" 
                                    value={appointment.createDate} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<MedicalServices color="action" />} 
                                    label="Service type" 
                                    value="Examination" 
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                Patient info
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                    src={appointment.patient?.avatar} 
                                    sx={{ width: 56, height: 56, bgcolor: '#e3f2fd', color: '#1976d2' }}
                                >
                                    <Person />
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        {appointment.patient?.fullName || "N/A"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: #{appointment.patient?.patientId}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>

                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                Doctor
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                    src={appointment.staff?.avatar}
                                    sx={{ width: 56, height: 56, bgcolor: '#f3e5f5', color: '#9c27b0' }}
                                >
                                    {appointment.doctorName ? appointment.doctorName.charAt(0) : "Dr"}
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        Dr. {appointment.doctorName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Doctor Id: #{appointment.doctorId}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {/* --- ALERT DIALOG XÁC NHẬN --- */}
            <AlertDialog
                open={isCompleteDialogOpen}
                setOpen={setIsCompleteDialogOpen}
                title="Complete Appointment"
                description="Are you sure you want to mark this appointment as completed? This action cannot be undone."
                type="info"
                buttonCancel="Cancel"
                buttonConfirm={isSubmitting ? "Processing..." : "Yes, Complete"}
                onConfirm={handleComplete}
            />
        </Box>
    );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <Box display="flex" alignItems="flex-start" gap={1.5}>
        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight="500" color="#334155">
                {value}
            </Typography>
        </Box>
    </Box>
);

export default AppointmentDetail;