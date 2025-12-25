import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Paper,
	Typography,
	Tabs,
	Tab,
	Grid,
	Chip,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	CircularProgress,
	Alert,
	Divider,
} from "@mui/material";
import {
	ArrowBack as BackIcon,
	QrCode as QrCodeIcon,
	Download as DownloadIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { apiCall } from "../../../api/api";
import { patientInvoiceById } from "../../../api/urls";
import type { InvoiceDetail, PaymentStatus } from "../../../types/Invoice";
import PaymentQRModal from "../../Receptionist/Invoice/PaymentQRModal";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div role="tabpanel" hidden={value !== index} {...other}>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

const PatientInvoiceDetail: React.FC = () => {
	const { invoiceId } = useParams<{ invoiceId: string }>();
	const navigate = useNavigate();
	const { token } = useAuth();

	const [tabValue, setTabValue] = useState(0);
	const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Payment modal
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);

	const fetchInvoice = useCallback(() => {
		setLoading(true);
		apiCall(
			patientInvoiceById(parseInt(invoiceId!)),
			"GET",
			token,
			null,
			(response: { data: InvoiceDetail }) => {
				setInvoice(response.data);
				setLoading(false);
			},
			(error: any) => {
				console.error("Error fetching invoice:", error);
				setError("Không thể tải thông tin hóa đơn");
				setLoading(false);
			}
		);
	}, [invoiceId, token]);

	useEffect(() => {
		fetchInvoice();
	}, [fetchInvoice]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString("vi-VN");
	};

	const getStatusColor = (status: PaymentStatus) => {
		switch (status) {
			case "PAID":
				return "success";
			case "UNPAID":
				return "warning";
			case "REFUNDED":
				return "info";
			default:
				return "default";
		}
	};

	const getStatusLabel = (status: PaymentStatus) => {
		switch (status) {
			case "PAID":
				return "Đã thanh toán";
			case "UNPAID":
				return "Chưa thanh toán";
			case "REFUNDED":
				return "Đã hoàn tiền";
			default:
				return status;
		}
	};

	const isPaid = invoice?.paymentStatus === "PAID";

	const handlePaymentSuccess = () => {
		setPaymentModalOpen(false);
		fetchInvoice();
	};

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!invoice) {
		return (
			<Box sx={{ p: 3 }}>
				<Alert severity="error">{error || "Không tìm thấy hóa đơn"}</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
				<IconButton onClick={() => navigate("/patient/invoices")}>
					<BackIcon />
				</IconButton>
				<Typography variant="h5" sx={{ ml: 1, flexGrow: 1 }}>
					Chi tiết hóa đơn #{invoice.invoiceId}
				</Typography>
				<Chip
					label={getStatusLabel(invoice.paymentStatus)}
					color={getStatusColor(invoice.paymentStatus)}
					sx={{ mr: 2 }}
				/>
				{!isPaid && (
					<Button
						variant="contained"
						startIcon={<QrCodeIcon />}
						onClick={() => setPaymentModalOpen(true)}
					>
						Thanh toán ngay
					</Button>
				)}
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Tabs */}
			<Paper sx={{ width: "100%" }}>
				<Tabs
					value={tabValue}
					onChange={(_, newValue) => setTabValue(newValue)}
					indicatorColor="primary"
					textColor="primary"
				>
					<Tab label="Thông tin hóa đơn" />
					<Tab label="Chi tiết dịch vụ" />
					<Tab label="Chi tiết thuốc" />
				</Tabs>

				{/* Tab 1: Invoice Info */}
				<TabPanel value={tabValue} index={0}>
					<Grid container spacing={3}>
						{/* Record Info */}
						<Grid item xs={12} md={6}>
							<Typography variant="h6" gutterBottom>
								Thông tin khám bệnh
							</Typography>
							<Paper variant="outlined" sx={{ p: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Mã hồ sơ
										</Typography>
										<Typography>{invoice.record?.recordId || "-"}</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Ngày khám
										</Typography>
										<Typography>
											{formatDate(invoice.record?.examinateDate || "")}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Bác sĩ
										</Typography>
										<Typography>{invoice.record?.doctorName || "-"}</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Chẩn đoán
										</Typography>
										<Typography>{invoice.record?.diagnosis || "-"}</Typography>
									</Grid>
								</Grid>
							</Paper>
						</Grid>

						{/* Payment Info */}
						<Grid item xs={12} md={6}>
							<Typography variant="h6" gutterBottom>
								Thông tin thanh toán
							</Typography>
							<Paper variant="outlined" sx={{ p: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Ngày lập hóa đơn
										</Typography>
										<Typography>{formatDate(invoice.invoiceDate)}</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Trạng thái
										</Typography>
										<Chip
											size="small"
											label={getStatusLabel(invoice.paymentStatus)}
											color={getStatusColor(invoice.paymentStatus)}
										/>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Phương thức thanh toán
										</Typography>
										<Typography>
											{invoice.paymentMethod?.methodName || "-"}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Nhân viên
										</Typography>
										<Typography>{invoice.issuedBy?.fullName || "-"}</Typography>
									</Grid>
								</Grid>
							</Paper>
						</Grid>

						{/* Invoice Summary */}
						<Grid item xs={12}>
							<Typography variant="h6" gutterBottom>
								Tổng kết chi phí
							</Typography>
							<Paper variant="outlined" sx={{ p: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={6} md={3}>
										<Typography variant="body2" color="text.secondary">
											Tiền khám
										</Typography>
										<Typography variant="h6">
											{formatCurrency(invoice.examinationFee)}
										</Typography>
									</Grid>
									<Grid item xs={6} md={3}>
										<Typography variant="body2" color="text.secondary">
											Tiền dịch vụ
										</Typography>
										<Typography variant="h6">
											{formatCurrency(invoice.serviceFee)}
										</Typography>
									</Grid>
									<Grid item xs={6} md={3}>
										<Typography variant="body2" color="text.secondary">
											Tiền thuốc
										</Typography>
										<Typography variant="h6">
											{formatCurrency(invoice.medicineFee)}
										</Typography>
									</Grid>
									<Grid item xs={6} md={3}>
										<Typography variant="body2" color="text.secondary">
											<strong>TỔNG CỘNG</strong>
										</Typography>
										<Typography variant="h5" color="primary">
											{formatCurrency(invoice.totalAmount)}
										</Typography>
									</Grid>
								</Grid>
							</Paper>
						</Grid>
					</Grid>
				</TabPanel>

				{/* Tab 2: Service Details */}
				<TabPanel value={tabValue} index={1}>
					<Typography variant="h6" gutterBottom>
						Chi tiết dịch vụ
					</Typography>

					<TableContainer component={Paper} variant="outlined">
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>STT</TableCell>
									<TableCell>Tên dịch vụ</TableCell>
									<TableCell align="right">Đơn giá</TableCell>
									<TableCell align="center">Số lượng</TableCell>
									<TableCell align="right">Thành tiền</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{invoice.serviceDetails.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
											Không có dịch vụ
										</TableCell>
									</TableRow>
								) : (
									invoice.serviceDetails.map((detail, index) => (
										<TableRow key={detail.detailId}>
											<TableCell>{index + 1}</TableCell>
											<TableCell>{detail.serviceName}</TableCell>
											<TableCell align="right">
												{formatCurrency(detail.salePrice)}
											</TableCell>
											<TableCell align="center">{detail.quantity}</TableCell>
											<TableCell align="right">
												{formatCurrency(detail.amount)}
											</TableCell>
										</TableRow>
									))
								)}
								<TableRow>
									<TableCell colSpan={3} />
									<TableCell align="right">
										<strong>Tổng cộng:</strong>
									</TableCell>
									<TableCell align="right">
										<strong>{formatCurrency(invoice.serviceFee)}</strong>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</TabPanel>

				{/* Tab 3: Medicine Details */}
				<TabPanel value={tabValue} index={2}>
					<Typography variant="h6" gutterBottom>
						Chi tiết thuốc
					</Typography>

					<TableContainer component={Paper} variant="outlined">
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>STT</TableCell>
									<TableCell>Tên thuốc</TableCell>
									<TableCell>Hàm lượng</TableCell>
									<TableCell>ĐVT</TableCell>
									<TableCell align="right">Đơn giá</TableCell>
									<TableCell align="center">Số lượng</TableCell>
									<TableCell align="right">Thành tiền</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{invoice.medicineDetails.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} align="center" sx={{ py: 3 }}>
											Không có thuốc
										</TableCell>
									</TableRow>
								) : (
									invoice.medicineDetails.map((detail, index) => (
										<TableRow key={detail.detailId}>
											<TableCell>{index + 1}</TableCell>
											<TableCell>{detail.medicineName}</TableCell>
											<TableCell>{detail.concentration}</TableCell>
											<TableCell>{detail.unit}</TableCell>
											<TableCell align="right">
												{formatCurrency(detail.salePrice)}
											</TableCell>
											<TableCell align="center">{detail.quantity}</TableCell>
											<TableCell align="right">
												{formatCurrency(detail.amount)}
											</TableCell>
										</TableRow>
									))
								)}
								<TableRow>
									<TableCell colSpan={5} />
									<TableCell align="right">
										<strong>Tổng cộng:</strong>
									</TableCell>
									<TableCell align="right">
										<strong>{formatCurrency(invoice.medicineFee)}</strong>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</TabPanel>
			</Paper>

			{/* Payment QR Modal */}
			<PaymentQRModal
				open={paymentModalOpen}
				onClose={() => setPaymentModalOpen(false)}
				invoice={invoice}
				onPaymentSuccess={handlePaymentSuccess}
				role="patient"
			/>
		</Box>
	);
};

export default PatientInvoiceDetail;
