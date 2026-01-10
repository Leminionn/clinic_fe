import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Pagination,
	Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Sử dụng Grid v2 cho MUI mới nhất
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { apiCall } from "../../../api/api";
import { invoiceSearch } from "../../../api/urls";
import type { InvoiceListItem, PaymentStatus } from "../../../types/Invoice";

// --- Helpers (Giữ nguyên logic của bạn) ---
function getStatusStyle(status: PaymentStatus) {
    switch (status) {
        case "PAID":
            return { bg: "var(--color-bg-success)", text: "var(--color-text-success)" };
        case "UNPAID":
            return { bg: "var(--color-bg-warning)", text: "var(--color-text-warning)" };
        case "REFUNDED":
            return { bg: "var(--color-bg-info)", text: "var(--color-text-info)" };
        default:
            return { bg: "var(--color-bg-secondary)", text: "var(--color-text-secondary)" };
    }
}

const InvoiceList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useAuth();
    
    const role = location.pathname.startsWith("/admin") ? "admin" : "receptionist";

    const [patientName, setPatientName] = useState("");
    const [patientPhone, setPatientPhone] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(7);
    const [totalElements, setTotalElements] = useState(0);

    // --- Logic API (Giữ nguyên logic của bạn) ---
    const fetchInvoices = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (patientName) params.append("patientName", patientName);
        if (patientPhone) params.append("patientPhone", patientPhone);
        if (paymentStatus) params.append("paymentStatus", paymentStatus);
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        params.append("page", (page - 1).toString());
        params.append("size", rowsPerPage.toString());

        const query = params.toString() ? `?${params.toString()}` : "";

        apiCall(
            invoiceSearch(role, query),
            "GET",
            token,
            null,
            (response: any) => {
                let finalContent: InvoiceListItem[] = [];
                let finalTotal = 0;

                if (response?.data?.data?.content && Array.isArray(response.data.data.content)) {
                    finalContent = response.data.data.content;
                    finalTotal = response.data.data.totalElements || 0;
                } 
                else if (response?.data?.content && Array.isArray(response.data.content)) {
                    finalContent = response.data.content;
                    finalTotal = response.data.totalElements || 0;
                }
                else if (response?.content && Array.isArray(response.content)) {
                    finalContent = response.content;
                    finalTotal = response.totalElements || 0;
                }

                setInvoices(finalContent);
                setTotalElements(finalTotal);
                setLoading(false);
            },
            (error: unknown) => {
                setInvoices([]);
                setTotalElements(0);
                setLoading(false);
            }
        );
    }, [token, role, patientName, patientPhone, paymentStatus, fromDate, toDate, page, rowsPerPage]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleSearch = () => { setPage(1); fetchInvoices(); };
    const handleReset = () => {
        setPatientName(""); setPatientPhone(""); setPaymentStatus("");
        setFromDate(""); setToDate(""); setPage(1);
    };

    const handleViewDetail = (invoiceId: number) => navigate(`/${role}/invoices/${invoiceId}`);
    const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const getStatusLabel = (status: PaymentStatus) => {
        switch (status) {
            case "PAID": return "Paid";
            case "UNPAID": return "Unpaid";
            case "REFUNDED": return "Refunded";
            default: return status;
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                padding: "26px 50px",
                gap: 2,
                height: "100vh",      // Cố định chiều cao bằng khung nhìn trình duyệt
                overflow: "hidden",   // Chặn cuộn toàn trang
                boxSizing: "border-box"
            }}
        >
            <Typography sx={{ fontSize: "20px", fontWeight: "bold", mb: 1 }}>
                Invoice List
            </Typography>

            {/* Search Filters Section */}
            <Paper sx={{ p: 3, flexShrink: 0, borderRadius: "12px" }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField fullWidth size="small" label="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField fullWidth size="small" label="Phone Number" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select value={paymentStatus} label="Status" onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | "")}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="UNPAID">Unpaid</MenuItem>
                                <MenuItem value="PAID">Paid</MenuItem>
                                <MenuItem value="REFUNDED">Refunded</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField fullWidth size="small" label="From" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField fullWidth size="small" label="To" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Stack direction="row" spacing={1}>
                            <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>Search</Button>
                            <Button variant="outlined" onClick={handleReset} startIcon={<RefreshIcon />}>Reset</Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Table Section */}
            <Paper
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,              // Tự động giãn nở để chiếm phần còn lại của màn hình
                    overflow: "hidden",   // Chặn nội dung tràn ra ngoài Paper
                    p: 2,
                    borderRadius: "12px",
                }}
            >
                {/* Khu vực cuộn của bảng */}
                <Box sx={{ flex: 1, overflowY: "auto", width: "100%" }}>
                    <Table stickyHeader sx={{ "& .MuiTableCell-root": { padding: "12px 8px" } }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }}>#</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }}>Patient</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }} align="right">Exam Fee</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }} align="right">Medicine</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }} align="right">Service</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }} align="right">Total</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "white" }} align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={11} align="center"><CircularProgress size={30} sx={{ my: 4 }} /></TableCell></TableRow>
                            ) : invoices.length === 0 ? (
                                <TableRow><TableCell colSpan={11} align="center"><Typography sx={{ py: 4 }}>No data available</Typography></TableCell></TableRow>
                            ) : (
                                invoices.map((invoice, index) => {
                                    const statusStyle = getStatusStyle(invoice.paymentStatus);
                                    return (
                                        <TableRow key={invoice.invoiceId} hover onClick={() => handleViewDetail(invoice.invoiceId)} sx={{ cursor: "pointer" }}>
                                            <TableCell sx={{ fontWeight: "bold" }}>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                                            <TableCell>{invoice.patientName}</TableCell>
                                            <TableCell>{invoice.patientPhone}</TableCell>
                                            <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                                            <TableCell align="right">{formatCurrency(invoice.examinationFee)}</TableCell>
                                            <TableCell align="right">{formatCurrency(invoice.medicineFee)}</TableCell>
                                            <TableCell align="right">{formatCurrency(invoice.serviceFee)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>{formatCurrency(invoice.totalAmount)}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "inline-flex", borderRadius: 1, px: 1.5, py: 0.5, color: statusStyle.text, bgcolor: statusStyle.bg, fontSize: "12px", fontWeight: "600" }}>
                                                    {getStatusLabel(invoice.paymentStatus)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{invoice.paymentMethodName || "-"}</TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" sx={{ color: "primary.main", border: "1px solid", borderColor: "primary.light" }}>
                                                    <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>i</Typography>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Box>

                {/* Pagination Section - Luôn nằm cố định ở đáy Paper */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, borderTop: "1px solid #edf2f7" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">Show</Typography>
                        <Select
                            size="small"
                            value={rowsPerPage}
                            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                            sx={{ height: "32px", fontSize: "14px" }}
                        >
                            {[7, 10, 15, 25].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                        </Select>
                        <Typography variant="body2" color="text.secondary">results</Typography>
                    </Box>

                    <Pagination
                        count={Math.ceil(totalElements / rowsPerPage)}
                        page={page}
                        onChange={(_, val) => setPage(val)}
                        color="primary"
                        shape="rounded"
                        size="medium"
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default InvoiceList;