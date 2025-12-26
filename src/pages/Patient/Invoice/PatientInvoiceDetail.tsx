import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Paper,
	Typography,
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
	ChevronLeft as ChevronLeftIcon,
	QrCode as QrCodeIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { apiCall } from "../../../api/api";
import { patientInvoiceById } from "../../../api/urls";
import type { InvoiceDetail, PaymentStatus } from "../../../types/Invoice";
import PaymentQRModal from "../../Receptionist/Invoice/PaymentQRModal";

const PatientInvoiceDetail: React.FC = () => {
	const { invoiceId } = useParams<{ invoiceId: string }>();
	const navigate = useNavigate();
	const { token } = useAuth();

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
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusLabel = (status: PaymentStatus) => {
		switch (status) {
			case "PAID":
				return "Paid";
			case "UNPAID":
				return "Unpaid";
			case "REFUNDED":
				return "Refunded";
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
				<Alert severity="error">{error || "Invoice not found"}</Alert>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				padding: "26px 50px",
				gap: 3,
				height: "100%",
				overflowY: "auto",
			}}
		>
			{/* Header */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
				<IconButton
					onClick={() => navigate("/patient/invoices")}
					sx={{
						color: "text.primary",
						padding: 1,
						"&:hover": {
							backgroundColor: "rgba(0, 0, 0, 0.04)",
						},
					}}
					title="Quay lại"
				>
					<ChevronLeftIcon />
				</IconButton>
				<Typography variant="h5" sx={{ fontWeight: "bold", flexGrow: 1 }}>
					Invoice Detail #{invoice.invoiceId}
				</Typography>
				<Chip
					label={getStatusLabel(invoice.paymentStatus)}
					color={invoice.paymentStatus === "PAID" ? "success" : invoice.paymentStatus === "REFUNDED" ? "info" : "warning"}
					sx={{ mr: 1 }}
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
				<Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			<Grid container spacing={3}>
				<Grid item xs={12} md={8}>
					<Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							Medical Record Information
						</Typography>
						<Divider sx={{ mb: 2 }} />
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Typography variant="body2" color="text.secondary">
									Record ID
								</Typography>
								<Typography>{invoice.record?.recordId || "-"}</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant="body2" color="text.secondary">
									Examination Date
								</Typography>
								<Typography>{formatDate(invoice.record?.examinateDate || "")}</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant="body2" color="text.secondary">
									Doctor
								</Typography>
								<Typography>{invoice.record?.doctorName || "-"}</Typography>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Typography variant="body2" color="text.secondary">
									Diagnosis
								</Typography>
								<Typography>{invoice.record?.diagnosis || "-"}</Typography>
							</Grid>
						</Grid>
					</Paper>

					<Paper sx={{ p: 3, borderRadius: 3 }}>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							Cost Summary
						</Typography>
						<Divider sx={{ mb: 2 }} />
						<Grid container spacing={2}>
							<Grid item xs={6} md={3}>
								<Typography variant="body2" color="text.secondary">
									Examination Fee
								</Typography>
								<Typography fontWeight="bold">
									{formatCurrency(invoice.examinationFee)}
								</Typography>
							</Grid>
							<Grid item xs={6} md={3}>
								<Typography variant="body2" color="text.secondary">
									Service Fee
								</Typography>
								<Typography fontWeight="bold">
									{formatCurrency(invoice.serviceFee)}
								</Typography>
							</Grid>
							<Grid item xs={6} md={3}>
								<Typography variant="body2" color="text.secondary">
									Medicine Fee
								</Typography>
								<Typography fontWeight="bold">
									{formatCurrency(invoice.medicineFee)}
								</Typography>
							</Grid>
							<Grid item xs={6} md={3}>
								<Typography variant="body2" color="text.secondary" fontWeight="bold">
									TOTAL
								</Typography>
								<Typography variant="h5" color="primary" fontWeight="bold">
									{formatCurrency(invoice.totalAmount)}
								</Typography>
							</Grid>
						</Grid>
					</Paper>
				</Grid>

				<Grid item xs={12} md={4}>
					<Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
						<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
							Payment Information
						</Typography>
						<Divider sx={{ mb: 2 }} />
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<Typography variant="body2" color="text.secondary">
									Invoice Date
								</Typography>
								<Typography>{formatDate(invoice.invoiceDate)}</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="body2" color="text.secondary">
									Status
								</Typography>
								<Chip
									size="small"
									label={getStatusLabel(invoice.paymentStatus)}
									color={invoice.paymentStatus === "PAID" ? "success" : invoice.paymentStatus === "REFUNDED" ? "info" : "warning"}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="body2" color="text.secondary">
									Payment Method
								</Typography>
								<Typography>{invoice.paymentMethod?.methodName || "-"}</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="body2" color="text.secondary">
									Issued By
								</Typography>
								<Typography>{invoice.issuedBy?.fullName || "-"}</Typography>
							</Grid>
						</Grid>
					</Paper>
				</Grid>
			</Grid>

			{/* Service Details */}
			<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
				<Typography variant="h6" gutterBottom>
					Service Details
				</Typography>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>No.</TableCell>
								<TableCell>Service Name</TableCell>
								<TableCell align="right">Unit Price</TableCell>
								<TableCell align="center">Quantity</TableCell>
								<TableCell align="right">Total</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{invoice.serviceDetails.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center" sx={{ py: 3 }}>
										No services
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
								<strong>Total:</strong>
								</TableCell>
								<TableCell align="right">
									<strong>{formatCurrency(invoice.serviceFee)}</strong>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			{/* Medicine Details */}
			<Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mt: 3 }}>
				<Typography variant="h6" gutterBottom>
					Medicine Details
				</Typography>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>No.</TableCell>
								<TableCell>Medicine Name</TableCell>
								<TableCell>Concentration</TableCell>
								<TableCell>Unit</TableCell>
								<TableCell align="right">Unit Price</TableCell>
								<TableCell align="center">Quantity</TableCell>
								<TableCell align="right">Total</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{invoice.medicineDetails.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} align="center" sx={{ py: 3 }}>
										No medicines
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
								<strong>Total:</strong>
								</TableCell>
								<TableCell align="right">
									<strong>{formatCurrency(invoice.medicineFee)}</strong>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
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
