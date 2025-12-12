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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';
import {
    ReceiptLong,
    CalendarToday,
    Person,
    AttachMoney,
    AccountBalanceWallet,
    ArrowBack,
    Description
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { apiCall } from '../../../../api/api';
// import { useAuth } from '../../../../auth/AuthContext'; // Uncomment và chỉnh path
// import { apiCall } from '../../../../api/api'; // Uncomment và chỉnh path

// --- MOCK API & AUTH (Thay thế bằng import thực tế) ---

// --- DTO & HELPER ---

// 1. DTO khớp với Invoice Entity
export interface InvoiceDetailDTO {
    invoiceId: number;
    patient: {
        patientId: number;
        fullName: string;
        phone?: string;
        avatar?: string;
    } | null;
    recordId?: number; // Liên kết với MedicalRecord
    invoiceDate: string; // YYYY-MM-DD
    
    // BigDecimal -> number
    examinationFee: number;
    medicineFee: number;
    serviceFee: number;
    totalAmount: number;

    paymentMethod: {
        id: number;
        methodName: string;
    } | null;
    
    paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'CANCELLED';
    
    issueBy: {
        staffId: number;
        fullName: string;
        avatar?: string;
    } | null;
}

// Helper format tiền tệ
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Helper màu trạng thái thanh toán
const getPaymentStatusColor = (status: string) => {
    switch (status) {
        case 'PAID':
            return { color: 'var(--color-text-success)', bg: 'var(--color-bg-success)', label: 'Paid' };
        case 'UNPAID':
            return { color: 'var(--color-text-error)', bg: 'var(--color-bg-error)', label: 'Unpaid' };
        case 'REFUNDED':
            return { color: '#b7791f', bg: '#fefcbf', label: 'Refunded' };
       
        default:
            return { color: '#6226ef', bg: '#e0d4fc', label: status };
    }
};

// --- COMPONENT CHÍNH ---

const InvoiceDetail = () => {
    const navigate = useNavigate();
    const role = useAuth();
    const { id } = useParams();
    const [invoice, setInvoice] = useState<InvoiceDetailDTO | null>(null);

    useEffect(() => {
        let prefix = "";
        // @ts-ignore
        if (role.role === "Admin") prefix = "admin";
        // @ts-ignore
        if (role.role === "Receptionist") prefix = "receptionist";
        // @ts-ignore
        if (role.role === "Doctor") prefix = "doctor"; // Doctor có thể xem invoice

        const accessToken = localStorage.getItem("accessToken");
        
        // Gọi API lấy invoice detail
        apiCall(`${prefix}/invoice_by_id/${id}`, 'GET', accessToken ? accessToken : "", null, (data: any) => {
            setInvoice(data.data);
        }, (data: any) => {
            console.error(data);
            // alert(data.message);
            // navigate(-1);
        });
    }, [id, role, navigate]);

    const onBack = () => navigate(-1);

    if (!invoice) {
        return (
            <Box p={3} textAlign="center">
                <Typography color="text.secondary">Loading invoice...</Typography>
            </Box>
        );
    }

    const statusStyle = getPaymentStatusColor(invoice.paymentStatus);

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
                    Invoice Details #{invoice.invoiceId}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                
                {/* Cột Trái: Thông tin Hóa đơn & Chi phí */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        
                        {/* Header Card: Status & Total */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold" color="primary" display="flex" alignItems="center" gap={1}>
                                <ReceiptLong /> Invoice Information
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

                        {/* Thông tin chung */}
                        <Grid container spacing={3} mb={3}>
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<CalendarToday color="action" />} 
                                    label="Invoice Date" 
                                    value={dayjs(invoice.invoiceDate).format("DD/MM/YYYY")} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<AccountBalanceWallet color="action" />} 
                                    label="Payment Method" 
                                    value={invoice.paymentMethod?.methodName || "Unknown"} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoItem 
                                    icon={<Description color="action" />} 
                                    label="Related Record ID" 
                                    value={`#${invoice.recordId || "N/A"}`} 
                                />
                            </Grid>
                        </Grid>

                        {/* Bảng Chi tiết Phí */}
                        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box bgcolor="#f9fafb" p={1.5} borderBottom="1px solid #eee">
                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                    FEE BREAKDOWN
                                </Typography>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Examination Fee</TableCell>
                                            <TableCell align="right">{formatCurrency(invoice.examinationFee)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Medicine Fee</TableCell>
                                            <TableCell align="right">{formatCurrency(invoice.medicineFee)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Service Fee</TableCell>
                                            <TableCell align="right">{formatCurrency(invoice.serviceFee)}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ bgcolor: '#f0f9ff' }}>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                TOTAL AMOUNT
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}>
                                                {formatCurrency(invoice.totalAmount)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                    </Card>
                </Grid>

                {/* Cột Phải: Thông tin Liên quan (Người lập, Bệnh nhân) */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        
                        {/* Card Bệnh Nhân */}
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                CUSTOMER / PATIENT
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                    src={invoice.patient?.avatar} 
                                    sx={{ width: 56, height: 56, bgcolor: '#e3f2fd', color: '#1976d2' }}
                                >
                                    <Person />
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        {invoice.patient?.fullName || "Guest"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ID: #{invoice.patient?.patientId}
                                    </Typography>
                                    {invoice.patient?.phone && (
                                        <Typography variant="body2" color="text.secondary">
                                            Phone: {invoice.patient.phone}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Card>

                        {/* Card Người Lập (Staff) */}
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2} color="text.secondary">
                                ISSUED BY
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar 
                                    src={invoice.issueBy?.avatar}
                                    sx={{ width: 56, height: 56, bgcolor: '#f3e5f5', color: '#9c27b0' }}
                                >
                                    {invoice.issueBy?.fullName ? invoice.issueBy.fullName.charAt(0) : "S"}
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        {invoice.issueBy?.fullName || "System"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Staff ID: #{invoice.issueBy?.staffId}
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

export default InvoiceDetail;