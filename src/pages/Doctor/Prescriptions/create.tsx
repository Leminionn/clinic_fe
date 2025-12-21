import React, { useState, useEffect } from 'react';
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
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Autocomplete
} from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../api/api';
// import { apiCall } from '../../../../api/api'; 
// import { useAuth } from '../../../../auth/AuthContext';

// --- MOCK DATA (Thay thế bằng API) ---
const MOCK_RECORDS = [
    { recordId: 101, patientName: "Nguyễn Văn A", diagnosis: "Cảm cúm", examinateDate: "2025-10-25" },
    { recordId: 102, patientName: "Trần Thị B", diagnosis: "Viêm họng", examinateDate: "2025-10-26" },
];

const MOCK_MEDICINES = [
    { medicineId: 1, medicineName: "Paracetamol 500mg", unit: "Viên" },
    { medicineId: 2, medicineName: "Amoxicillin 500mg", unit: "Viên" },
    { medicineId: 3, medicineName: "Vitamin C", unit: "Viên" },
    { medicineId: 4, medicineName: "Siro Ho", unit: "Chai" },
];

// Interface cho Request Body
interface PrescriptionDetailRequest {
     prescriptionId: number;
    medicineId: number | null; // Để null khi chưa chọn
    quantity: number;
    dosage: string;
    days: number;
    // UI helper fields (không gửi lên server)
    tempId: number; 
}

interface PrescriptionRequest {
    recordId: number | '';
    notes: string;
    prescriptionDetails: PrescriptionDetailRequest[];
}
function fromResponseToRecordData(response:any){
    return {
        recordId: response.recordId,
        patientName: response.patientName,
        diagnosis: response.diagnosis,
        examinateDate: response.exanminateDate
    }
}
function fromResponseToMedicineData(response:any) {
    return {
        medicineId:response.medicineId,
        medicineName:response.medicineName,
        unit:response.unit
    }
}

const PrescriptionCreatePage = () => {
    const navigate = useNavigate();
    // const { role } = useAuth(); // Nếu cần check quyền

    // --- STATES ---
    const [records, setRecords] = useState(MOCK_RECORDS);
    const [medicines, setMedicines] = useState(MOCK_MEDICINES);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<PrescriptionRequest>({
        recordId: '',
        notes: '',
        prescriptionDetails: [] 
    });

    // --- EFFECTS ---
    useEffect(() => {
        // Fetch Records & Medicines từ API
        // apiCall('/doctor/records', 'GET', ..., (data) => setRecords(data));
        // apiCall('/common/medicines', 'GET', ..., (data) => setMedicines(data));

        const accessToken = localStorage.getItem("accessToken");
        apiCall("doctor/records","GET",accessToken?accessToken:"",null,(data:any)=>{
            //console.log(data);
            setRecords(data.data.map((item:any)=>fromResponseToRecordData(item)));
        },(data:any)=>{
            alert(data.message);
            navigate("/doctor");
        });
        apiCall("doctor/medicines","GET",accessToken?accessToken:"",null,(data:any)=>{
            setMedicines(data.data.map((item:any)=>fromResponseToMedicineData(item)));
        },(data:any)=>{
            alert(data.message);
            navigate("/doctor");})
        
    }, []);

    // --- HANDLERS ---

    // Thay đổi thông tin chung (Record, Notes)
    const handleGeneralChange = (field: keyof PrescriptionRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Thêm dòng thuốc mới
    const handleAddDetail = () => {
        const newDetail: PrescriptionDetailRequest = {
            prescriptionId: 0,
            tempId: Date.now(), // ID tạm để làm key cho React
            medicineId: null,
            quantity: 1,
            dosage: '',
            days: 1
        };
        setFormData(prev => ({
            ...prev,
            prescriptionDetails: [...prev.prescriptionDetails, newDetail]
        }));
    };

    // Xóa dòng thuốc
    const handleRemoveDetail = (tempId: number) => {
        setFormData(prev => ({
            ...prev,
            prescriptionDetails: prev.prescriptionDetails.filter(d => d.tempId !== tempId)
        }));
    };

    // Thay đổi thông tin trong dòng thuốc
    const handleDetailChange = (tempId: number, field: keyof PrescriptionDetailRequest, value: any) => {
        setFormData(prev => ({
            ...prev,
            prescriptionDetails: prev.prescriptionDetails.map(detail => 
                detail.tempId === tempId ? { ...detail, [field]: value } : detail
            )
        }));
    };

    // Submit Form
    const handleSubmit = async () => {
        // Validation cơ bản
        if (!formData.recordId) {
            alert("Please choose record (Record).");
            return;
        }
        if (formData.prescriptionDetails.length === 0) {
            alert("Add at least 1 medicine type");
            return;
        }
        for (const detail of formData.prescriptionDetails) {
            if (!detail.medicineId) {
                alert("Please select medicine for all rows");
                return;
            }
            if (detail.quantity <= 0 || detail.days <= 0) {
                alert("Quantity and days must be greater than 0.");
                return;
            }
        }

        setLoading(true);
        
        // Chuẩn bị payload (loại bỏ tempId)
        const payload = {
            recordId: formData.recordId,
            notes: formData.notes,
            prescriptionDetails: formData.prescriptionDetails.map(({ tempId, ...rest }) => rest)
        };

        console.log("Submitting Payload:", payload);
        const accessToken = localStorage.getItem("accessToken");
        // Gọi API
        apiCall('doctor/prescription/create', 'POST', accessToken?accessToken:"", JSON.stringify(payload),
             (res:any) => {
                 alert("Create prescription success!");
                 navigate(-1);
             },
             (err:any) => { alert("Error: " + err.message); setLoading(false); }
         );
        
        
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: '#f4f7fa',
            p: { xs: 2, md: 3 },
            overflow: 'auto'
        }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <Button 
                        startIcon={<ArrowBack />} 
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Back
                    </Button>
                    <Typography variant="h5" fontWeight="bold" color="#1e293b">
                        New Prescription
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        py: 1
                    }}
                >
                    {loading ? "Saving..." : "Save prescription"}
                </Button>
            </Box>

            <Grid container spacing={3}>
                
                {/* 1. Thông tin chung (Record & Notes) */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
                            General Info
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="record-select-label">Choose medical record*</InputLabel>
                                    <Select
                                        labelId="record-select-label"
                                        value={formData.recordId}
                                        label="Choose medical record *"
                                        onChange={(e) => handleGeneralChange('recordId', e.target.value)}
                                    >
                                        {records.map((rec) => (
                                            <MenuItem key={rec.recordId} value={rec.recordId}>
                                                #{rec.recordId} - {rec.patientName} ({rec.diagnosis}) - {rec.examinateDate}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    value={formData.notes}
                                    onChange={(e) => handleGeneralChange('notes', e.target.value)}
                                    size="small"
                                    placeholder="Vd: Kiêng đồ cay nóng, uống nhiều nước..."
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* 2. Chi tiết thuốc (Danh sách động) */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Medicine list
                            </Typography>
                            <Button 
                                startIcon={<Add />} 
                                variant="outlined" 
                                onClick={handleAddDetail}
                                size="small"
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Add Medicine
                            </Button>
                        </Box>

                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table sx={{ minWidth: 700 }} size="small">
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Medicine name *</TableCell>
                                        <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Amount *</TableCell>
                                        <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Days *</TableCell>
                                        <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Dosage</TableCell>
                                        <TableCell width="10%" align="center">Xóa</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.prescriptionDetails.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                No medicine, press "Add medicine to add"
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        formData.prescriptionDetails.map((detail) => (
                                            <TableRow key={detail.tempId}>
                                                {/* Cột 1: Tên Thuốc (Autocomplete để dễ tìm) */}
                                                <TableCell>
                                                    <Autocomplete
                                                        options={medicines}
                                                        getOptionLabel={(option) => `${option.medicineName} (${option.unit})`}
                                                        value={medicines.find(m => m.medicineId === detail.medicineId) || null}
                                                        onChange={(_, newValue) => {
                                                            handleDetailChange(detail.tempId, 'medicineId', newValue ? newValue.medicineId : null);
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField {...params} placeholder="Chọn thuốc..." size="small" variant="standard" />
                                                        )}
                                                    />
                                                </TableCell>

                                                {/* Cột 2: Số lượng */}
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={detail.quantity}
                                                        onChange={(e) => handleDetailChange(detail.tempId, 'quantity', parseInt(e.target.value) || 0)}
                                                        size="small"
                                                        variant="standard"
                                                        inputProps={{ min: 1 }}
                                                        fullWidth
                                                    />
                                                </TableCell>

                                                {/* Cột 3: Số ngày */}
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={detail.days}
                                                        onChange={(e) => handleDetailChange(detail.tempId, 'days', parseInt(e.target.value) || 0)}
                                                        size="small"
                                                        variant="standard"
                                                        inputProps={{ min: 1 }}
                                                        fullWidth
                                                    />
                                                </TableCell>

                                                {/* Cột 4: Liều dùng */}
                                                <TableCell>
                                                    <TextField
                                                        value={detail.dosage}
                                                        onChange={(e) => handleDetailChange(detail.tempId, 'dosage', e.target.value)}
                                                        size="small"
                                                        variant="standard"
                                                        placeholder="Vd: Sáng 1, Chiều 1"
                                                        fullWidth
                                                    />
                                                </TableCell>

                                                {/* Cột 5: Xóa */}
                                                <TableCell align="center">
                                                    <IconButton 
                                                        color="error" 
                                                        size="small"
                                                        onClick={() => handleRemoveDetail(detail.tempId)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PrescriptionCreatePage;