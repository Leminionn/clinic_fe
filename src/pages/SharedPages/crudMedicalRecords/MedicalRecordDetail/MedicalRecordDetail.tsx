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
    Button,
    Paper
} from '@mui/material';
import {
    CalendarToday,
    AccessTime,
    Person,
    MedicalServices,
    EventAvailable,
    ArrowBack,
    Notes,
    LocalHospital,
    Healing
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { apiCall } from '../../../../api/api';
// import { useAuth } from '../../../../auth/AuthContext'; // Uncomment if needed
// import { apiCall } from '../../../../api/api'; // Uncomment if needed

// Mock useAuth và apiCall để component có thể chạy độc lập cho demo



// 1. Định nghĩa Interface cho MedicalRecord (Dựa trên JSON từ Backend)
export interface MedicalRecordDetailDTO {
    recordId: number;
    reception?: { // Nếu backend trả về thông tin reception
        receptionId: number;
    };
    doctorId: number;        // Từ getDoctorId()
    doctorName: string;      // Từ getDoctorName()
    examinateDate: string;   // Java Date -> String "YYYY-MM-DD"
    symptoms: string;
    diagnosis: string;
    diseaseType?: {          // Giả định backend trả về object diseaseType
        id: number;
        name: string;
    };
    orderedServices: string;
    notes: string;
    // Thêm thông tin bệnh nhân nếu API trả về (thường sẽ có trong reception hoặc riêng)
    patientName?: string; 
    patientId?: number;
}

const MedicalRecordDetail = () => {
    const navigate = useNavigate();
    const role = useAuth();
    const { id } = useParams();
    const [record, setRecord] = useState<MedicalRecordDetailDTO | null>(null);

    useEffect(() => {
        let prefix = "";
        // @ts-ignore
        if (role.role === "Admin") prefix = "admin";
        // @ts-ignore
        if (role.role === "Receptionist") prefix = "receptionist";
        // @ts-ignore
        if (role.role === "Doctor") prefix = "doctor";

        const accessToken = localStorage.getItem("accessToken");
        
        // Gọi API lấy thông tin chi tiết
        apiCall(`${prefix}/medical_record_by_id/${id}`, 'GET', accessToken ? accessToken : "", null, (data: any) => {
            setRecord(data.data);
        }, (data: any) => {
            alert(data.message);
            navigate(-1);
            
        });
    }, [id, role, navigate]);

    const onBack = () => {
        navigate(-1);
    };

    if (!record) {
        return (
            <Box p={3} textAlign="center">
                <Typography color="text.secondary">Loading record...</Typography>
            </Box>
        );
    }

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
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={onBack}
                    sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                    Medical Record #{record.recordId}
                </Typography>
            </Box>

            {/* Nội dung chính */}
            <Grid container spacing={3}>
                
                {/* Cột Trái: Thông tin Chẩn đoán & Khám bệnh */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Diagnosis Information
                            </Typography>
                            {/* Hiển thị Loại bệnh nếu có */}
                            {record.diseaseType && (
                                <Chip 
                                    label={record.diseaseType.name}
                                    icon={<LocalHospital fontSize="small" />}
                                    sx={{ 
                                        bgcolor: '#e3f2fd', 
                                        color: '#1976d2',
                                        fontWeight: 'bold',
                                        borderRadius: 1.5
                                    }} 
                                />
                            )}
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            {/* Ngày khám */}
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<CalendarToday color="action" />} 
                                    label="Examination Date" 
                                    value={dayjs(record.examinateDate).format("DD/MM/YYYY")} 
                                />
                            </Grid>
                            
                            {/* Bác sĩ khám (có thể hiển thị lại ở đây cho rõ) */}
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<Person color="action" />} 
                                    label="Doctor" 
                                    value={record.doctorName || "Unknown"} 
                                />
                            </Grid>

                            {/* Chẩn đoán */}
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        DIAGNOSIS
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500" color="#334155" mt={0.5}>
                                        {record.diagnosis || "No diagnosis provided."}
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* Triệu chứng */}
                            <Grid item xs={12}>
                                <InfoItem 
                                    icon={<Healing color="error" />} 
                                    label="Symptoms" 
                                    value={record.symptoms || "No symptoms recorded."} 
                                />
                            </Grid>

                            {/* Dịch vụ chỉ định */}
                            <Grid item xs={12}>
                                <InfoItem 
                                    icon={<MedicalServices color="primary" />} 
                                    label="Ordered Services" 
                                    value={record.orderedServices || "None"} 
                                />
                            </Grid>

                             {/* Ghi chú */}
                             <Grid item xs={12}>
                                <InfoItem 
                                    icon={<Notes color="action" />} 
                                    label="Doctor's Notes" 
                                    value={record.notes || "No notes."} 
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* Cột Phải: Thông tin Bác sĩ (và có thể thêm Bệnh nhân nếu API trả về) */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        
                        {/* Card Bác Sĩ */}
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                DOCTOR IN CHARGE
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                    sx={{ width: 56, height: 56, bgcolor: '#f3e5f5', color: '#9c27b0' }}
                                >
                                    {record.doctorName ? record.doctorName.charAt(0) : "Dr"}
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        Dr. {record.doctorName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: #{record.doctorId}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>

                        {/* Có thể thêm Card thông tin Reception hoặc Bệnh nhân tại đây nếu cần */}
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
                justifyContent: 'center',
                minWidth: 40, 
                height: 40
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight="500" color="#334155" sx={{ whiteSpace: 'pre-line' }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

export default MedicalRecordDetail;