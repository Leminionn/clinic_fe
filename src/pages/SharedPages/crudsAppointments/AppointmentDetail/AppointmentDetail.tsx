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
    ArrowBack
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { apiCall } from '../../../../api/api';

// 1. Định nghĩa Interface cho Appointment (Dựa trên JSON từ Backend)
// Lưu ý: Các trường @JsonIgnore trong Java sẽ không có ở đây.
// Các getter public như getDoctorName() sẽ thành field doctorName trong JSON.
export interface AppointmentDetailDTO {
    appointmentId: number;
    patient: {
        patientId: number;
        fullName: string;
        // Thêm các trường khác của Patient nếu backend trả về (vd: avatar, phone...)
        avatar?: string; // Giả định có avatar
        phone?: string;
    } | null;
    doctorId: number;        // Từ getDoctorId()
    doctorName: string;      // Từ getDoctorName()
    staff?: {                // staff bị @JsonIgnore, nhưng nếu bạn cần avatar bác sĩ, backend nên trả thêm
        avatar?: string;
    }; 
    appointmentDate: string; // "YYYY-MM-DD"
    appointmentTime: string; // "HH:mm:ss"
    status: 'SCHEDULED' | 'IN_EXAMINATION' | 'DONE' | 'CANCELLED' | 'ABSENT' | 'CHECKED_IN';
    createDate: string;
}

// Helper lấy màu trạng thái (Tái sử dụng logic của bạn)
const getStatusColor = (status: string) => {
    switch (status) {
        case 'SCHEDULED': return { color: 'var(--color-text-info)', bg: 'var(--color-bg-info)', label: 'Scheduled' };
        case 'CONFIRMED': return { color: 'var(--color-text-warning)', bg: 'var(--color-bg-warning)', label: 'Confirmed' };
        
        case 'COMPLETED': return { color: 'var(--color-text-success)', bg: 'var(--color-bg-success)', label: 'Completed' };
        case 'CANCELLED': return { color: 'var(--color-text-error)', bg: 'var(--color-bg-error)', label: 'Cancelled' };
        case 'NOSHOW': return { color: '#718096', bg: '#edf2f7', label: 'No Show' };
        default: return { color: '#6226ef', bg: '#e0d4fc', label: status };
    }
};



const AppointmentDetail=() => {
    const navigate = useNavigate();
    const role = useAuth();
    const {id} = useParams();
    const [appointment, setAppointment] = useState<AppointmentDetailDTO>();
    useEffect(()=>{
        let url="";
        if(role.role=="Admin") url=`admin/appointment_by_id/${id}`
        if(role.role=="Receptionist") url=`receptionist/appointment_by_id/${id}`
        if(role.role=="Patient") url=`patient/appointment/${id}`
        const accessToken = localStorage.getItem("accessToken");
        apiCall(url,'GET',accessToken?accessToken:"",null,(data:any)=>{
            setAppointment(data.data);
        },(data:any)=>{
            alert(data.message);
            navigate(-1);
        })
    },[])
    const onBack=()=>{
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
                bgcolor: '#f4f7fa', // Nền nhẹ cho vùng chứa
                p: { xs: 2, md: 3 }
            }}
        >
            {/* Header: Nút Back và Tiêu đề */}
            <Box display="flex" alignItems="center" mb={3}>
                {onBack && (
                    <Button 
                        startIcon={<ArrowBack />} 
                        onClick={onBack}
                        sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Back
                    </Button>
                )}
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                    Detail #{appointment.appointmentId}
                </Typography>
                {appointment.status=='SCHEDULED'&&<Button onClick={
                    ()=>{
                        const prefix=role.role=="Patient"?"patient":"receptionist";
                        navigate(`/${prefix}/appointment/update/${appointment.appointmentId}`)
                    }
                }>Edit</Button>}
            </Box>

            {/* Nội dung chính: Chia làm 2 cột nếu màn hình rộng */}
            <Grid container spacing={3}>
                
                {/* Cột Trái: Thông tin chính */}
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
                            {/* Ngày hẹn */}
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<CalendarToday color="action" />} 
                                    label="Appointment date" 
                                    value={dayjs(appointment.appointmentDate).format("DD/MM/YYYY")} 
                                />
                            </Grid>
                            
                            {/* Giờ hẹn */}
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<AccessTime color="action" />} 
                                    label="Appointment time" 
                                    value={appointment.appointmentTime.substring(0, 5)} 
                                />
                            </Grid>

                            {/* Ngày tạo */}
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<EventAvailable color="action" />} 
                                    label="Create at" 
                                    value={appointment.createDate} 
                                />
                            </Grid>

                            {/* Dịch vụ / Ghi chú (Nếu có thêm trường này trong tương lai) */}
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<MedicalServices color="action" />} 
                                    label="Service type" 
                                    value="Examinate" // Placeholder vì entity chưa có trường này
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* Cột Phải: Thông tin Người tham gia */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        
                        {/* Card Bệnh Nhân */}
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
                                        {appointment.patient?.fullName || "Chưa cập nhật"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: #{appointment.patient?.patientId}
                                    </Typography>
                                    {appointment.patient?.phone && (
                                        <Typography variant="body2" color="text.secondary">
                                            Phone: {appointment.patient.phone}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Card>

                        {/* Card Bác Sĩ */}
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                Doctor
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                    src={appointment.staff?.avatar} // Nếu backend trả avatar bác sĩ
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
            
        </Box>
    );
};

// Component con để hiển thị từng dòng thông tin (Icon - Label - Value)
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <Box display="flex" alignItems="flex-start" gap={1.5}>
        <Box 
            sx={{ 
                p: 1, 
                borderRadius: 1.5, 
                bgcolor: '#f5f7fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
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