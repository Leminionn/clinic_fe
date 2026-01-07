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
    Autocomplete,
    CircularProgress
} from '@mui/material';
import { Add, Delete, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
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

// Interface
interface PrescriptionDetailRequest {
    prescriptionId: number;
    medicineId: number | null;
    quantity: number;
    dosage: string;
    days: number;
    tempId: number; // UI helper
}

interface PrescriptionRequest {
    recordId: number | '';
    notes: string;
    prescriptionDetails: PrescriptionDetailRequest[];
}

const PrescriptionUpdatePage = () => {
    const navigate = useNavigate();
    const { prescriptionId } = useParams<{ prescriptionId: string }>(); // Lấy ID từ URL
    
    // --- STATES ---
    const [records, setRecords] = useState(MOCK_RECORDS);
    const [medicines, setMedicines] = useState(MOCK_MEDICINES);
    const [loading, setLoading] = useState(true); // Loading ban đầu khi fetch dữ liệu
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<PrescriptionRequest>({
        recordId: '',
        notes: '',
        prescriptionDetails: [] 
    });
    function fromResponseToMedicalRecordDTO(response:any) {
        return {
            recordId: response.recordId,
            patientName: response.patientName,
            diagnosis: response.diagnosis,
            examinateDate: response.examinateDate
        }
    }
    function fromResponseToPrescription(response:any) {
        return {
            recordId: response.record.recordId,
            notes: response.notes
        }
    }
    function fromResponseToPrescriptionDetail(response:any) {
        return {
            prescriptionId: response.prescription.prescriptionId,
            medicineId: response.medicine.medicineId,
            quantity:response.quantity,
            days: response.days,
            dosage: response.dosage
        }
    }
    function fromResponseToMedicineData(response:any) {
    return {
        medicineId:response.medicineId,
        medicineName:response.medicineName,
        unit:response.unit
    }
}
    // --- FETCH DATA ---
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Records & Medicines (Master Data)
                // await apiCall('/doctor/records', ...);
                // await apiCall('/common/medicines', ...);

                // 2. Fetch Prescription Info (Thông tin chung)
                // const presRes = await apiCall(`/doctor/prescription/${prescriptionId}`, 'GET');
                const mockPrescription = { 
                    recordId: 101, 
                    notes: "Uống nhiều nước, tái khám sau 3 ngày" 
                };

                // 3. Fetch Prescription Details (Danh sách thuốc - API Riêng như yêu cầu)
                // const detailsRes = await apiCall(`/doctor/prescription/${prescriptionId}/details`, 'GET');
                const mockDetails = [
                    { prescriptionId: Number(prescriptionId), medicineId: 1, quantity: 10, dosage: "Sáng 1, Chiều 1", days: 5 },
                    { prescriptionId: Number(prescriptionId), medicineId: 3, quantity: 20, dosage: "Sáng 2", days: 10 }
                ];
                const accessToken = localStorage.getItem("accessToken");
                apiCall("doctor/medicines","GET",accessToken?accessToken:"",null,(data:any)=>{
                            setMedicines(data.data.map((item:any)=>fromResponseToMedicineData(item)));
                        },(data:any)=>{
                            alert(data.message);
                            navigate("/doctor");}) 
                let prescription=mockPrescription;
                let details=mockDetails;
                apiCall(`doctor/prescription/${prescriptionId}`,"GET",accessToken?accessToken:"",null,(data:any)=>{
                    prescription=fromResponseToPrescription(data.data);
                    setRecords([fromResponseToMedicalRecordDTO(data.data.record)]);
                    apiCall(`doctor/prescription_details_list/${prescriptionId}`,"GET",accessToken?accessToken:"",null,(data:any)=>{
                    details = data.data.map((item:any)=>{
                        return fromResponseToPrescriptionDetail(item);
                    });
                    setFormData({
                    recordId: prescription.recordId,
                    notes: prescription.notes,
                    prescriptionDetails: details.map((d, index) => ({
                        ...d,
                        tempId: Date.now() + index // Tạo tempId để làm key
                    }))
                });
                },(data:any)=>{
                            alert(data.message);
                            navigate("/doctor");});
                            
                },(data:any)=>{
                            alert(data.message);
                            navigate("/doctor");});
                
               
                // 4. Update Form State
                
                
                

            } catch (error) {
                console.error("Error loading prescription:", error);
                alert("Không thể tải thông tin đơn thuốc.");
            } finally {
                setLoading(false);
            }
        };

        if (prescriptionId) {
            loadData();
        }
    }, [prescriptionId]);

    // --- HANDLERS ---

    const handleGeneralChange = (field: keyof PrescriptionRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddDetail = () => {
        const newDetail: PrescriptionDetailRequest = {
            tempId: Date.now(),
            prescriptionId: Number(prescriptionId), // Gán ID hiện tại
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

    const handleRemoveDetail = (tempId: number) => {
        setFormData(prev => ({
            ...prev,
            prescriptionDetails: prev.prescriptionDetails.filter(d => d.tempId !== tempId)
        }));
    };

    const handleDetailChange = (tempId: number, field: keyof PrescriptionDetailRequest, value: any) => {
        setFormData(prev => ({
            ...prev,
            prescriptionDetails: prev.prescriptionDetails.map(detail => 
                detail.tempId === tempId ? { ...detail, [field]: value } : detail
            )
        }));
    };

    const handleSubmit = async () => {
        // Validation (Giống trang Create)
        if (!formData.recordId) return alert("Vui lòng chọn Hồ sơ bệnh án.");
        if (formData.prescriptionDetails.length === 0) return alert("Vui lòng thêm thuốc.");
        for (const detail of formData.prescriptionDetails) {
            if (!detail.medicineId) return alert("Vui lòng chọn tên thuốc.");
            if (detail.quantity <= 0 || detail.days <= 0) return alert("Số lượng/ngày phải > 0.");
        }

        setSaving(true);
        
        const payload = {
            prescriptionId: Number(prescriptionId), // Thêm ID để server biết là update
            recordId: formData.recordId,
            notes: formData.notes,
            prescriptionDetails: formData.prescriptionDetails.map(({ tempId, ...rest }) => rest)
        };

        console.log("Updating Payload:", payload);

        // Gọi API Update
        // await apiCall(`/doctor/prescription/update/${prescriptionId}`, 'PUT', payload);
        const accessToken = localStorage.getItem("accessToken");
        apiCall(`doctor/prescription/update/${prescriptionId}`,"PUT",accessToken?accessToken:"",JSON.stringify(payload),(data:any)=>{
            alert("Cập nhật đơn thuốc thành công!");
            setSaving(false);
            navigate(-1);
        },(data:any)=>{
            alert(data.message);
        })
        
        
    };

   
    return<Box> {
        loading?(
         <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
    ):(
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
                        Update prescription #{prescriptionId}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    {saving ? "Saving..." : "Save changes"}
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* 1. Thông tin chung */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
                            General Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="record-label">Medical record</InputLabel>
                                    <Select
                                        labelId="record-label"
                                        value={formData.recordId}
                                        label="Medical record"
                                        onChange={(e) => handleGeneralChange('recordId', e.target.value)}
                                        disabled // Thường khi update không cho đổi Record ID
                                    >
                                        {records.map((rec) => (
                                            <MenuItem key={rec.recordId} value={rec.recordId}>
                                                #{rec.recordId} - {rec.patientName}
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
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                {/* 2. Chi tiết thuốc */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Medicines list
                            </Typography>
                            <Button 
                                startIcon={<Add />} 
                                variant="outlined" 
                                onClick={handleAddDetail}
                                size="small"
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Add medicine
                            </Button>
                        </Box>

                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table sx={{ minWidth: 700 }} size="small">
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Medicine name</TableCell>
                                        <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                        <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Days</TableCell>
                                        <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Dosage</TableCell>
                                        <TableCell width="10%" align="center">Delete</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.prescriptionDetails.map((detail) => (
                                        <TableRow key={detail.tempId}>
                                            <TableCell>
                                                <Autocomplete
                                                    options={medicines}
                                                    getOptionLabel={(option) => `${option.medicineName} (${option.unit})`}
                                                    value={medicines.find(m => m.medicineId === detail.medicineId) || null}
                                                    onChange={(_, newValue) => {
                                                        handleDetailChange(detail.tempId, 'medicineId', newValue ? newValue.medicineId : null);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField {...params} placeholder="Choose medicine..." size="small" variant="standard" />
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={detail.quantity}
                                                    onChange={(e) => handleDetailChange(detail.tempId, 'quantity', parseInt(e.target.value) || 0)}
                                                    size="small" variant="standard" fullWidth
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={detail.days}
                                                    onChange={(e) => handleDetailChange(detail.tempId, 'days', parseInt(e.target.value) || 0)}
                                                    size="small" variant="standard" fullWidth
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    value={detail.dosage}
                                                    onChange={(e) => handleDetailChange(detail.tempId, 'dosage', e.target.value)}
                                                    size="small" variant="standard" fullWidth
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton color="error" size="small" onClick={() => handleRemoveDetail(detail.tempId)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>
            </Grid>
        </Box>
        
    )}
    </Box>
};

export default PrescriptionUpdatePage;