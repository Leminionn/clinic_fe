import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Divider,
    Grid,
    Avatar,
    Stack,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Chip,
    Paper
} from '@mui/material';
import {
    CalendarToday,
    ArrowBack,
    Medication,
    Person,
    LocalPharmacy,
    MedicalServices,
    Description
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '../../../api/api';
import { useAuth } from '../../../auth/AuthContext';
// import { useAuth } from '../../../../auth/AuthContext';
// import { apiCall } from '../../../../api/api';

// --- MOCK API & AUTH ---

/*const apiCall = (endpoint: string, method: string, token: string, body: any, onSuccess: any, onError: any) => {
    // Giả lập API call
    setTimeout(() => {
        onSuccess({
            data: {
                prescriptionId: 101,
                prescriptionDate: "2025-10-25",
                notes: "Uống thuốc đúng giờ, kiêng đồ cay nóng.",
                
                // Mapping từ MedicalRecord
                record: {
                    recordId: 501,
                    doctorName: "Nguyễn Văn A",
                    doctorId: 303,
                    reception: {
                        patient: {
                            patientId: 101,
                            fullName: "Trần Thị B",
                            avatar: "https://picsum.photos/200/200?random=1"
                        }
                    },
                    diagnosis: "Viêm họng cấp"
                },

                // Danh sách chi tiết thuốc
                details: [
                    {
                        medicineId: 1,
                        medicineName: "Paracetamol 500mg",
                        quantity: 10,
                        dosage: "Sáng 1 viên, Chiều 1 viên",
                        days: 5,
                        dispenseStatus: "PENDING",
                        image: "https://via.placeholder.com/150"
                    },
                    {
                        medicineId: 2,
                        medicineName: "Amoxicillin 500mg",
                        quantity: 15,
                        dosage: "Sáng 1 viên, Trưa 1 viên, Tối 1 viên",
                        days: 5,
                        dispenseStatus: "DISPENSED",
                        image: "https://via.placeholder.com/150"
                    },
                    {
                        medicineId: 3,
                        medicineName: "Vitamin C",
                        quantity: 20,
                        dosage: "Sáng 2 viên",
                        days: 10,
                        dispenseStatus: "PENDING",
                        image: "https://via.placeholder.com/150"
                    }
                ]
            }
        });
    }, 500);
};*/

// --- DTO ---

interface PrescriptionDetailDTO {
    prescriptionId: number;
    prescriptionDate: string; // YYYY-MM-DD
    notes: string;
    
    // Nested object từ Record -> Reception -> Patient / Staff
    record?: {
        recordId: number;
        doctorName: string;
        doctorId: number;
        diagnosis: string;
        reception?: {
            patient?: {
                patientId: number;
                fullName: string;
                avatar?: string;
            };
        };
    };

    // List chi tiết thuốc
    
}

interface PrescriptionDetailItemDTO {
    // Mapping từ PrescriptionDetail & Medicine
    medicineId: number;
    medicineName: string;
    image?: string;
    quantity: number;
    dosage: string;
    days: number;
    dispenseStatus: 'PENDING' | 'DISPENSED' | 'CANCELLED';
}

const getDispenseStatusColor = (status: string) => {
    switch (status) {
        case 'DISPENSED': return { color: 'success', label: 'Đã cấp' };
        case 'PENDING': return { color: 'warning', label: 'Chờ cấp' };
        case 'CANCELLED': return { color: 'error', label: 'Đã hủy' };
        default: return { color: 'default', label: status };
    }
};

// --- COMPONENT CHÍNH ---
function fromResponseToPrescriptionDto(response:any) {
    return {
        prescriptionId: response.prescriptionId,
        prescriptionDate: dayjs(response.prescriptionDate).format("DD-MM-YYYY"),
        notes: response.notes,
                
                
                record: {
                    recordId: response.record.recordId,
                    doctorName: response.record.doctorName,
                    doctorId: response.record.doctorId,
                    reception: {
                        patient: {
                            patientId: response.record.patientId,
                            fullName:response.record.patientName,
                            
                        }
                    },
                    diagnosis: response.record.diagnosis
                },
    }
}
function fromResponseToPrescriptionDetailDto(response:any) {
    return {
        medicineId: response.medicine.medicineId,
        medicineName: response.medicine.medicineName,
        quantity: response.quantity,
        dosage: response.dosage,
        days: response.days,
        dispenseStatus: response.dispenseStatus,
            
    }
}
const PrescriptionDetail = () => {
    const navigate = useNavigate();
    const role = useAuth();
    const { id } = useParams();
    const [prescription, setPrescription] = useState<PrescriptionDetailDTO | null>(null);
    const [presciptionDetails, setPrescriptionDetails] = useState<PrescriptionDetailItemDTO[]>([]);
    useEffect(() => {
        let prefix = "";
        // @ts-ignore
        if (role.role === "Admin") prefix = "admin";
        // @ts-ignore
        if (role.role === "Receptionist") prefix = "receptionist";
        // @ts-ignore
        if (role.role === "Doctor") prefix = "doctor";
        if(role.role==="Patient") prefix="patient"; // Doctor/Pharmacist

        const accessToken = localStorage.getItem("accessToken");
        
        apiCall(`${prefix}/prescription/${id}`, 'GET', accessToken ? accessToken : "", null, (data: any) => {
            setPrescription(fromResponseToPrescriptionDto(data.data));

            apiCall(`${prefix}/prescription_details_list/${id}`,'GET',accessToken?accessToken:"",null,(d:any)=>{
                setPrescriptionDetails(d.data.map((item:any)=>fromResponseToPrescriptionDetailDto(item)));
            },(d:any)=>{
                alert(d.message);
            navigate(`/${prefix}`);
            })
        }, (data: any) => {
            alert(data.message);
            navigate(`/${prefix}`);
        });
    }, [id, role, navigate]);

    const onBack = () => navigate(-1);

    if (!prescription) {
        return (
            <Box p={3} textAlign="center">
                <Typography color="text.secondary">Loading prescription...</Typography>
            </Box>
        );
    }

    const patient = prescription.record?.reception?.patient;

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
            {/* Header */}
            <Box display="flex" alignItems="center" mb={3}>
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={onBack}
                    sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
                >
                    Back
                </Button>
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                    Prescription #{prescription.prescriptionId}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                
                {/* Cột Trái: Danh sách thuốc */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Medication color="primary" />
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Medicine List
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {/* Danh sách cuộn */}
                        <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
                            <List>
                                {presciptionDetails.map((item, index) => {
                                    const statusInfo = getDispenseStatusColor(item.dispenseStatus);
                                    return (
                                        <React.Fragment key={index}>
                                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                <ListItemAvatar>
                                                   
                                                        <LocalPharmacy />
                                                    
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {item.medicineName}
                                                            </Typography>
                                                            <Chip 
                                                                label={statusInfo.label} 
                                                                // @ts-ignore
                                                                color={statusInfo.color} 
                                                                size="small" 
                                                                variant="outlined" 
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Stack component="span" spacing={0.5} mt={0.5}>
                                                            <Typography component="span" variant="body2" color="text.primary">
                                                                Quantity: <strong>{item.quantity}</strong> (For {item.days} days)
                                                            </Typography>
                                                            <Typography component="span" variant="body2" color="text.secondary">
                                                                Dosage: {item.dosage}
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                />
                                            </ListItem>
                                            {index <presciptionDetails.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Box>
                    </Card>
                </Grid>

                {/* Cột Phải: Thông tin chung */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={3}>
                        
                        {/* Thông tin đơn thuốc */}
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                GENERAL INFO
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Stack spacing={2}>
                                <InfoItem 
                                    icon={<CalendarToday color="action" />} 
                                    label="Prescription Date" 
                                    value={dayjs(prescription.prescriptionDate).format("DD/MM/YYYY")} 
                                />
                                <InfoItem 
                                    icon={<Description color="action" />} 
                                    label="Notes" 
                                    value={prescription.notes || "No notes"} 
                                />
                                <InfoItem 
                                    icon={<MedicalServices color="action" />} 
                                    label="Diagnosis (Record)" 
                                    value={prescription.record?.diagnosis || "Unknown"} 
                                />
                            </Stack>
                        </Card>

                        {/* Thông tin Bệnh nhân & Bác sĩ */}
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                PEOPLE INVOLVED
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            {/* Bệnh nhân */}
                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                
                                    <Person />
                               
                                <Box>
                                    <Typography variant="caption" color="text.secondary">PATIENT</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {patient?.fullName || "Unknown"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: #{patient?.patientId}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Bác sĩ */}
                            <Box display="flex" alignItems="center" gap={2}>
                                
                                    {prescription.record?.doctorName ? prescription.record.doctorName.charAt(0) : "Dr"}
                               
                                <Box>
                                    <Typography variant="caption" color="text.secondary">PRESCRIBED BY</Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Dr. {prescription.record?.doctorName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: #{prescription.record?.doctorId}
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

// Component con hiển thị Info
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

export default PrescriptionDetail;