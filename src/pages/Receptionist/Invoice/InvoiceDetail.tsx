import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Paper,
	Typography,
	Tabs,
	Tab,
	Chip,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Autocomplete,
	CircularProgress,
	Alert,
	Divider,
	Card,
	Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import QrCodeIcon from "@mui/icons-material/QrCode";
import MedicationIcon from "@mui/icons-material/Medication";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { apiCall } from "../../../api/api";
import { showMessage } from "../../../components/ActionResultMessage";
import AlertDialog from "../../../components/AlertDialog";
import {
	invoiceGetById,
	invoiceMedicineDetails,
	invoiceMedicineDetailDelete,
	invoiceServiceDetails,
	invoiceServiceDetailDelete,
	invoiceAvailableMedicines,
	invoiceMarkPaid,
	paymentMethodsGetActive,
} from "../../../api/urls";
import type {
	InvoiceDetail,
	InvoiceMedicineDetailItem,
	InvoiceServiceDetailItem,
	AvailableMedicine,
	PaymentStatus,
	InvoiceMedicineDetailRequest,
	InvoiceServiceDetailRequest,
} from "../../../types/Invoice";
import type { Service } from "../../../types/Service";
import PaymentQRModal from "./PaymentQRModal";

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

interface PaymentMethod {
	paymentMethodId: number;
	methodCode: string;
	methodName: string;
}

// Cash-based payment methods that don't need QR code
const CASH_PAYMENT_METHODS = ["CASH", "BANK_CARD", "INSURANCE", "KIOSK", "OTHER", "TIEN_MAT", "THE_NGAN_HANG", "BAO_HIEM", "MAY_KIOSK", "KHAC"];

const InvoiceDetailPage: React.FC = () => {
	const { invoiceId } = useParams<{ invoiceId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { token } = useAuth();
	
	// Detect role from URL path
	const role = location.pathname.startsWith("/admin") ? "admin" : "receptionist";

	const [tabValue, setTabValue] = useState(0);
	const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// Payment methods
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

	// Available medicines and services for adding
	const [availableMedicines, setAvailableMedicines] = useState<AvailableMedicine[]>([]);
	const [availableServices, setAvailableServices] = useState<Service[]>([]);

	// Edit dialogs
	const [medicineDialogOpen, setMedicineDialogOpen] = useState(false);
	const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
	const [editingMedicineDetail, setEditingMedicineDetail] = useState<InvoiceMedicineDetailItem | null>(null);
	const [editingServiceDetail, setEditingServiceDetail] = useState<InvoiceServiceDetailItem | null>(null);

	// Form state
	const [selectedMedicine, setSelectedMedicine] = useState<AvailableMedicine | null>(null);
	const [medicineQuantity, setMedicineQuantity] = useState(1);
	const [selectedService, setSelectedService] = useState<Service | null>(null);
	const [serviceQuantity, setServiceQuantity] = useState(1);

	// Payment modal
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [selectedQRPaymentMethod, setSelectedQRPaymentMethod] = useState<PaymentMethod | null>(null);

	// Mark as paid dialog
	const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

	// Delete confirmation
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<{ type: 'medicine' | 'service'; id: number } | null>(null);

	const fetchInvoice = useCallback(() => {
		setLoading(true);
		apiCall(
			invoiceGetById(role, parseInt(invoiceId!)),
			"GET",
			token,
			null,
			(response: { data: InvoiceDetail }) => {
				setInvoice(response.data);
				setLoading(false);
			},
			(error: Error) => {
				console.error("Error fetching invoice:", error);
				showMessage("Failed to load invoice information", "error");
				setLoading(false);
			}
		);
	}, [invoiceId, token, role]);

	const fetchPaymentMethods = useCallback(() => {
		apiCall(
			paymentMethodsGetActive,
			"GET",
			token,
			null,
			(response: { data: PaymentMethod[] }) => {
				setPaymentMethods(response.data);
			},
			(error: Error) => console.error("Error fetching payment methods:", error)
		);
	}, [token]);

	const fetchAvailableMedicines = useCallback(() => {
		apiCall(
			invoiceAvailableMedicines(role) + "?minMonthsBeforeExpiry=3",
			"GET",
			token,
			null,
			(response: { data: AvailableMedicine[] }) => {
				setAvailableMedicines(response.data);
			},
			(error: Error) => console.error("Error fetching medicines:", error)
		);
	}, [token, role]);

	const fetchAvailableServices = useCallback(() => {
		apiCall(
			`${role}/services/all`,
			"GET",
			token,
			null,
			(response: { data: Service[] }) => {
				setAvailableServices(response.data);
			},
			(error: Error) => console.error("Error fetching services:", error)
		);
	}, [token, role]);

	useEffect(() => {
		fetchInvoice();
		fetchPaymentMethods();
		fetchAvailableMedicines();
		fetchAvailableServices();
	}, [fetchInvoice, fetchPaymentMethods, fetchAvailableMedicines, fetchAvailableServices]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatDate = (dateStr: string) => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString("en-GB");
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

	// Check if payment method is cash-based (doesn't need QR)
	const isCashBasedPayment = (method: PaymentMethod | null) => {
		if (!method) return false;
		const code = method.methodCode?.toUpperCase() || "";
		const name = method.methodName?.toUpperCase() || "";
		return CASH_PAYMENT_METHODS.some(m => code.includes(m) || name.includes(m));
	};

	// Medicine detail handlers
	const handleAddMedicine = () => {
		setEditingMedicineDetail(null);
		setSelectedMedicine(null);
		setMedicineQuantity(1);
		setMedicineDialogOpen(true);
	};

	const handleEditMedicine = (detail: InvoiceMedicineDetailItem) => {
		setEditingMedicineDetail(detail);
		const medicine = availableMedicines.find((m) => m.medicineId === detail.medicineId);
		setSelectedMedicine(medicine || null);
		setMedicineQuantity(detail.quantity);
		setMedicineDialogOpen(true);
	};

	const handleDeleteMedicineClick = (detailId: number) => {
		setDeleteTarget({ type: 'medicine', id: detailId });
		setDeleteConfirmOpen(true);
	};

	const handleDeleteMedicine = (detailId: number) => {
		setSaving(true);
		apiCall(
			invoiceMedicineDetailDelete(role, parseInt(invoiceId!), detailId),
			"DELETE",
			token,
			null,
			() => {
				fetchInvoice();
				setSaving(false);
				showMessage("Medicine detail deleted successfully");
			},
			(error: Error) => {
				console.error("Error deleting medicine detail:", error);
				showMessage(error?.message || "Failed to delete medicine detail", "error");
				setSaving(false);
			}
		);
	};

	const handleSaveMedicine = () => {
		if (!selectedMedicine) return;

		setSaving(true);

		if (editingMedicineDetail) {
			// Lấy danh sách hiện tại từ state
			const currentDetails = invoice?.medicineDetails || [];

			// Tạo danh sách request đầy đủ (giữ nguyên cái cũ, cập nhật cái đang sửa)
			const allDetailsRequest: InvoiceMedicineDetailRequest[] = currentDetails.map((item) => {
				// Nếu là item đang sửa -> Dùng dữ liệu từ form
				if (item.detailId === editingMedicineDetail.detailId) {
					return {
						detailId: item.detailId,
						medicineId: selectedMedicine.medicineId,
						quantity: medicineQuantity,
						salePrice: selectedMedicine.unitPrice,
					};
				}
				// Nếu là item khác -> Giữ nguyên dữ liệu cũ để không bị xóa
				return {
					detailId: item.detailId,
					medicineId: item.medicineId,
					quantity: item.quantity,
					salePrice: item.salePrice,
				};
			});

			apiCall(
				invoiceMedicineDetails(role, parseInt(invoiceId!)),
				"PUT",
				token,
				JSON.stringify({ details: allDetailsRequest }),
				() => {
					setMedicineDialogOpen(false);
					fetchInvoice();
					fetchAvailableMedicines();
					setSaving(false);
					showMessage("Medicine detail updated successfully");
				},
				(error: Error) => {
					console.error("Error updating medicine detail:", error);
					showMessage(error?.message || "Failed to update medicine detail", "error");
					setSaving(false);
				}
			);
		} else {
			// Adding new - send single item without detailId
			const newRequest = {
				medicineId: selectedMedicine.medicineId,
				quantity: medicineQuantity,
				salePrice: selectedMedicine.unitPrice,
			};
			apiCall(
				invoiceMedicineDetails(role, parseInt(invoiceId!)),
				"POST",
				token,
				JSON.stringify(newRequest),
				() => {
					setMedicineDialogOpen(false);
					fetchInvoice();
					fetchAvailableMedicines();
					setSaving(false);
					showMessage("Medicine added successfully");
				},
				(error: Error) => {
					console.error("Error adding medicine detail:", error);
					showMessage(error?.message || "Failed to add medicine", "error");
					setSaving(false);
				}
			);
		}
	};

	// Service detail handlers
	const handleAddService = () => {
		setEditingServiceDetail(null);
		setSelectedService(null);
		setServiceQuantity(1);
		setServiceDialogOpen(true);
	};

	const handleEditService = (detail: InvoiceServiceDetailItem) => {
		setEditingServiceDetail(detail);
		const service = availableServices.find((s) => s.serviceId === detail.serviceId);
		setSelectedService(service || null);
		setServiceQuantity(detail.quantity);
		setServiceDialogOpen(true);
	};

	const handleDeleteServiceClick = (detailId: number) => {
		setDeleteTarget({ type: 'service', id: detailId });
		setDeleteConfirmOpen(true);
	};

	const handleDeleteService = (detailId: number) => {
		setSaving(true);
		apiCall(
			invoiceServiceDetailDelete(role, parseInt(invoiceId!), detailId),
			"DELETE",
			token,
			null,
			() => {
				fetchInvoice();
				setSaving(false);
				showMessage("Service detail deleted successfully");
			},
			(error: Error) => {
				console.error("Error deleting service detail:", error);
				showMessage(error?.message || "Failed to delete service detail", "error");
				setSaving(false);
			}
		);
	};

	const handleSaveService = () => {
		if (!selectedService) return;

		setSaving(true);

		if (editingServiceDetail) {
			// Lấy danh sách hiện tại
			const currentDetails = invoice?.serviceDetails || [];

			// Tạo danh sách request đầy đủ
			const allDetailsRequest: InvoiceServiceDetailRequest[] = currentDetails.map((item) => {
				// Nếu là item đang sửa -> Dùng dữ liệu mới
				if (item.detailId === editingServiceDetail.detailId) {
					return {
						detailId: item.detailId,
						serviceId: selectedService.serviceId,
						quantity: serviceQuantity,
						salePrice: selectedService.unitPrice,
					};
				}
				// Nếu là item khác -> Giữ nguyên
				return {
					detailId: item.detailId,
					serviceId: item.serviceId,
					quantity: item.quantity,
					salePrice: item.salePrice,
				};
			});

			apiCall(
				invoiceServiceDetails(role, parseInt(invoiceId!)),
				"PUT",
				token,
				JSON.stringify({ details: allDetailsRequest }),
				() => {
					setServiceDialogOpen(false);
					fetchInvoice();
					setSaving(false);
					showMessage("Service detail updated successfully");
				},
				(error: Error) => {
					console.error("Error updating service detail:", error);
					showMessage(error?.message || "Failed to update service detail", "error");
					setSaving(false);
				}
			);
		} else {
			// Adding new
			const newRequest = {
				serviceId: selectedService.serviceId,
				quantity: serviceQuantity,
				salePrice: selectedService.unitPrice,
			};
			apiCall(
				invoiceServiceDetails(role, parseInt(invoiceId!)),
				"POST",
				token,
				JSON.stringify(newRequest),
				() => {
					setServiceDialogOpen(false);
					fetchInvoice();
					setSaving(false);
					showMessage("Service added successfully");
				},
				(error: Error) => {
					console.error("Error adding service detail:", error);
					showMessage(error?.message || "Failed to add service", "error");
					setSaving(false);
				}
			);
		}
	};

	// Confirm delete handler
	const handleConfirmDelete = () => {
		if (!deleteTarget) return;
		if (deleteTarget.type === 'medicine') {
			handleDeleteMedicine(deleteTarget.id);
		} else {
			handleDeleteService(deleteTarget.id);
		}
		setDeleteConfirmOpen(false);
		setDeleteTarget(null);
	};

	// Payment handlers
	const handleMarkAsPaid = () => {
		if (!selectedPaymentMethod) return;

		setSaving(true);
		// Get staffId from localStorage or default to 1
		const storedStaffId = localStorage.getItem("staffId");
		const staffId = storedStaffId ? parseInt(storedStaffId) : 1;
		apiCall(
			`${invoiceMarkPaid(role, parseInt(invoiceId!))}?paymentMethodId=${selectedPaymentMethod.paymentMethodId}&staffId=${staffId}`,
			"POST",
			token,
			null,
			() => {
				setMarkPaidDialogOpen(false);
				fetchInvoice();
				setSaving(false);
				showMessage("Invoice marked as paid successfully");
			},
			(error: Error) => {
				console.error("Error marking as paid:", error);
				showMessage(error?.message || "Failed to update payment status", "error");
				setSaving(false);
			}
		);
	};

	const handlePaymentSuccess = () => {
		setPaymentModalOpen(false);
		fetchInvoice();
		showMessage("Payment completed successfully");
	};

	const handleOpenQRPayment = (method: PaymentMethod) => {
		setSelectedQRPaymentMethod(method);
		setPaymentModalOpen(true);
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
			<Box sx={{ p: 4 }}>
				<Alert severity="error">Invoice not found</Alert>
				<Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
					Back to list
				</Button>
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
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Box display="flex" alignItems="center" gap={1}>
					<IconButton onClick={() => navigate(-1)}>
						<ChevronLeft />
					</IconButton>
					<Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
						Invoice #{invoice.invoiceId}
					</Typography>
					<Chip
						label={getStatusLabel(invoice.paymentStatus)}
						color={getStatusColor(invoice.paymentStatus)}
						sx={{ ml: 2 }}
					/>
				</Box>

				{!isPaid && (
					<Box display="flex" gap={2}>
						<Button
							variant="outlined"
							startIcon={<PaymentIcon />}
							onClick={() => setMarkPaidDialogOpen(true)}
							sx={{
								textTransform: "none",
								fontSize: "14px",
								fontWeight: "bold",
								padding: "8px 24px",
							}}
						>
							Select Payment Method
						</Button>
					</Box>
				)}
			</Box>

			{/* Tabs */}
			<Paper sx={{ width: "100%", borderRadius: 2 }}>
				<Tabs
					value={tabValue}
					onChange={(_, newValue) => setTabValue(newValue)}
					indicatorColor="primary"
					textColor="primary"
					sx={{ borderBottom: 1, borderColor: 'divider' }}
				>
					<Tab label="Invoice Information" />
					<Tab label="Prescription" icon={<MedicationIcon />} iconPosition="start" />
					<Tab label="Service Details" />
					<Tab label="Medicine Details" />
				</Tabs>

				{/* Tab 1: Invoice Info */}
				<TabPanel value={tabValue} index={0}>
					<Box sx={{ px: 3 }}>
						<Grid container spacing={4}>
							{/* Patient Info */}
							<Grid size={{ xs: 12, md: 6 }}>
								<Card sx={{ p: 3, height: "100%" }}>
									<Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
										Patient Information
									</Typography>
									<Stack spacing={3}>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Full Name
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.patient?.fullName || "-"}</Typography>
										</Box>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Phone Number
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.patient?.phone || "-"}</Typography>
										</Box>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Date of Birth
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>
												{formatDate(invoice.patient?.dateOfBirth)}
											</Typography>
										</Box>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Address
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.patient?.address || "-"}</Typography>
										</Box>
									</Stack>
								</Card>
							</Grid>

							{/* Record Info */}
							<Grid size={{ xs: 12, md: 6 }}>
								<Card sx={{ p: 3, height: "100%" }}>
									<Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
										Medical Record Information
									</Typography>
									<Stack spacing={3}>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Record ID
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.record?.recordId || "-"}</Typography>
										</Box>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Examination Date
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>
												{formatDate(invoice.record?.examinateDate || "")}
											</Typography>
										</Box>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Doctor
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.record?.doctorName || "-"}</Typography>
										</Box>
										<Box>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Diagnosis
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.record?.diagnosis || "-"}</Typography>
										</Box>
									</Stack>
								</Card>
							</Grid>

							{/* Invoice Summary */}
							<Grid size={12}>
								<Card sx={{ p: 3 }}>
									<Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
										Invoice Summary
									</Typography>
									<Grid container spacing={3}>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Invoice Date
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{formatDate(invoice.invoiceDate)}</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Payment Method
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>
												{invoice.paymentMethod?.methodName || "-"}
											</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Issued By
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.issuedBy?.fullName || "-"}</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Status
											</Typography>
											<Chip
												size="small"
												label={getStatusLabel(invoice.paymentStatus)}
												color={getStatusColor(invoice.paymentStatus)}
											/>
										</Grid>
									</Grid>

									<Divider sx={{ my: 3 }} />

									<Grid container spacing={3}>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Examination Fee
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>
												{formatCurrency(invoice.examinationFee)}
											</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Service Fee
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{formatCurrency(invoice.serviceFee)}</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Medicine Fee
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>
												{formatCurrency(invoice.medicineFee)}
											</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												<strong>TOTAL AMOUNT</strong>
											</Typography>
											<Typography variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
												{formatCurrency(invoice.totalAmount)}
											</Typography>
										</Grid>
									</Grid>
								</Card>
							</Grid>
						</Grid>
					</Box>
				</TabPanel>

				{/* Tab 2: Prescription (from Medical Record) */}
				<TabPanel value={tabValue} index={1}>
					<Box sx={{ px: 3 }}>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
							<Typography variant="h6" sx={{ fontWeight: "bold" }}>
								Prescription from Medical Record
							</Typography>
							{invoice.record && (
								<Chip
									label={`Record #${invoice.record.recordId}`}
									color="primary"
									variant="outlined"
								/>
							)}
						</Box>

						{!invoice.record ? (
							<Alert severity="info" sx={{ mb: 3 }}>
								No medical record linked to this invoice.
							</Alert>
						) : (
							<>
								{/* Doctor & Diagnosis Info */}
								<Card sx={{ p: 3, mb: 3 }}>
									<Grid container spacing={3}>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Doctor
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.record.doctorName}</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Examination Date
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>
												{formatDate(invoice.record.examinateDate)}
											</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Symptoms
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.record.symptoms || "-"}</Typography>
										</Grid>
										<Grid size={{ xs: 12, sm: 6, md: 3 }}>
											<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
												Diagnosis
											</Typography>
											<Typography sx={{ fontWeight: 500 }}>{invoice.record.diagnosis || "-"}</Typography>
										</Grid>
									</Grid>
								</Card>

								{/* Prescription Medicines Table */}
								<Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
									Prescribed Medicines
								</Typography>
								<TableContainer component={Paper} variant="outlined">
									<Table>
										<TableHead>
											<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
												<TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
												<TableCell sx={{ fontWeight: "bold" }}>Medicine Name</TableCell>
												<TableCell sx={{ fontWeight: "bold" }}>Concentration</TableCell>
												<TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
												<TableCell align="center" sx={{ fontWeight: "bold" }}>Quantity</TableCell>
												<TableCell align="right" sx={{ fontWeight: "bold" }}>Unit Price</TableCell>
												<TableCell align="right" sx={{ fontWeight: "bold" }}>Amount</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{invoice.medicineDetails.length === 0 ? (
												<TableRow>
													<TableCell colSpan={7} align="center" sx={{ py: 4 }}>
														<Typography color="text.secondary">
															No medicines prescribed for this record
														</Typography>
													</TableCell>
												</TableRow>
											) : (
												invoice.medicineDetails.map((detail, index) => (
													<TableRow key={detail.detailId} hover>
														<TableCell>{index + 1}</TableCell>
														<TableCell>
															<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
																<MedicationIcon fontSize="small" color="primary" />
																{detail.medicineName}
															</Box>
														</TableCell>
														<TableCell>{detail.concentration}</TableCell>
														<TableCell>{detail.unit}</TableCell>
														<TableCell align="center">{detail.quantity}</TableCell>
														<TableCell align="right">{formatCurrency(detail.salePrice)}</TableCell>
														<TableCell align="right">{formatCurrency(detail.amount)}</TableCell>
													</TableRow>
												))
											)}
											{invoice.medicineDetails.length > 0 && (
												<TableRow sx={{ backgroundColor: "#e3f2fd" }}>
													<TableCell colSpan={5} />
													<TableCell align="right" sx={{ fontWeight: "bold" }}>
														Total Medicine Fee:
													</TableCell>
													<TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>
														{formatCurrency(invoice.medicineFee)}
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</>
						)}
					</Box>
				</TabPanel>

				{/* Tab 3: Service Details */}
				<TabPanel value={tabValue} index={2}>
					<Box sx={{ px: 3 }}>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
							<Typography variant="h6" sx={{ fontWeight: "bold" }}>Service Details</Typography>
							{!isPaid && (
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={handleAddService}
									sx={{ textTransform: "none" }}
								>
									Add Service
								</Button>
							)}
						</Box>

						<TableContainer component={Paper} variant="outlined">
							<Table>
								<TableHead>
									<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
										<TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Service Name</TableCell>
										<TableCell align="right" sx={{ fontWeight: "bold" }}>Unit Price</TableCell>
										<TableCell align="center" sx={{ fontWeight: "bold" }}>Quantity</TableCell>
										<TableCell align="right" sx={{ fontWeight: "bold" }}>Amount</TableCell>
										{!isPaid && <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>}
									</TableRow>
								</TableHead>
								<TableBody>
									{invoice.serviceDetails.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={isPaid ? 5 : 6}
												align="center"
												sx={{ py: 4 }}
											>
												<Typography color="text.secondary">No services added</Typography>
											</TableCell>
										</TableRow>
									) : (
										invoice.serviceDetails.map((detail, index) => (
											<TableRow key={detail.detailId} hover>
												<TableCell>{index + 1}</TableCell>
												<TableCell>{detail.serviceName}</TableCell>
												<TableCell align="right">
													{formatCurrency(detail.salePrice)}
												</TableCell>
												<TableCell align="center">{detail.quantity}</TableCell>
												<TableCell align="right">
													{formatCurrency(detail.amount)}
												</TableCell>
												{!isPaid && (
													<TableCell align="center">
														<IconButton
															size="small"
															onClick={() => handleEditService(detail)}
															color="primary"
														>
															<EditIcon fontSize="small" />
														</IconButton>
														<IconButton
															size="small"
															color="error"
															onClick={() => handleDeleteServiceClick(detail.detailId)}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</TableCell>
												)}
											</TableRow>
										))
									)}
									{invoice.serviceDetails.length > 0 && (
										<TableRow sx={{ backgroundColor: "#f9f9f9" }}>
											<TableCell colSpan={isPaid ? 3 : 4} />
											<TableCell align="right" sx={{ fontWeight: "bold" }}>
												Total:
											</TableCell>
											<TableCell align="right" sx={{ fontWeight: "bold" }}>
												{formatCurrency(invoice.serviceFee)}
											</TableCell>
											{!isPaid && <TableCell />}
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>
				</Box>
				</TabPanel>

				{/* Tab 4: Medicine Details */}
				<TabPanel value={tabValue} index={3}>
					<Box sx={{ px: 3 }}>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
							<Typography variant="h6" sx={{ fontWeight: "bold" }}>Medicine Details</Typography>
							{!isPaid && (
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={handleAddMedicine}
									sx={{ textTransform: "none" }}
								>
									Add Medicine
								</Button>
							)}
						</Box>

						{/* Show prescription info if available */}
						{invoice.record && (
							<Alert severity="info" sx={{ mb: 3 }}>
								This invoice is linked to Medical Record #{invoice.record.recordId}. 
								The medicines listed here are based on the doctor's prescription.
							</Alert>
						)}

						<TableContainer component={Paper} variant="outlined">
							<Table>
								<TableHead>
									<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
										<TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Medicine Name</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Concentration</TableCell>
										<TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
										<TableCell align="right" sx={{ fontWeight: "bold" }}>Unit Price</TableCell>
										<TableCell align="center" sx={{ fontWeight: "bold" }}>Quantity</TableCell>
										<TableCell align="right" sx={{ fontWeight: "bold" }}>Amount</TableCell>
										{!isPaid && <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>}
									</TableRow>
								</TableHead>
								<TableBody>
									{invoice.medicineDetails.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={isPaid ? 7 : 8}
												align="center"
												sx={{ py: 4 }}
											>
												<Typography color="text.secondary">No medicines added</Typography>
											</TableCell>
										</TableRow>
									) : (
										invoice.medicineDetails.map((detail, index) => (
											<TableRow key={detail.detailId} hover>
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
												{!isPaid && (
													<TableCell align="center">
														<IconButton
															size="small"
															onClick={() => handleEditMedicine(detail)}
															color="primary"
														>
															<EditIcon fontSize="small" />
														</IconButton>
														<IconButton
															size="small"
															color="error"
															onClick={() => handleDeleteMedicineClick(detail.detailId)}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													</TableCell>
												)}
											</TableRow>
										))
									)}
									{invoice.medicineDetails.length > 0 && (
										<TableRow sx={{ backgroundColor: "#f9f9f9" }}>
											<TableCell colSpan={isPaid ? 5 : 6} />
											<TableCell align="right" sx={{ fontWeight: "bold" }}>
												Total:
											</TableCell>
											<TableCell align="right" sx={{ fontWeight: "bold" }}>
												{formatCurrency(invoice.medicineFee)}
											</TableCell>
											{!isPaid && <TableCell />}
										</TableRow>
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</TabPanel>
			</Paper>

			{/* Medicine Dialog */}
			<Dialog
				open={medicineDialogOpen}
				onClose={() => setMedicineDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: "bold" }}>
					{editingMedicineDetail ? "Edit Medicine Detail" : "Add Medicine"}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 2 }}>
						<Autocomplete
							options={availableMedicines}
							getOptionLabel={(option) =>
								`${option.medicineName} - ${option.concentration} (Stock: ${option.availableQuantity})`
							}
							value={selectedMedicine}
							onChange={(_, value) => setSelectedMedicine(value)}
							renderInput={(params) => (
								<TextField {...params} label="Select Medicine" fullWidth />
							)}
							renderOption={(props, option) => {
								const { key, ...restProps } = props;
								return (
									<li key={key} {...restProps}>
										<Box>
											<Typography variant="body1">
												{option.medicineName} - {option.concentration}
											</Typography>
											<Typography variant="body2" color="text.secondary">
												Stock: {option.availableQuantity} | Price: {formatCurrency(option.unitPrice)} | 
												Expiry: {formatDate(option.nearestExpiryDate)}
											</Typography>
										</Box>
									</li>
								);
							}}
						/>
						{selectedMedicine && (
							<>
								<Alert severity="info" sx={{ mt: 1 }}>
									<Typography variant="body2">
										<strong>Unit Price:</strong> {formatCurrency(selectedMedicine.unitPrice)} | 
										<strong> Stock:</strong> {selectedMedicine.availableQuantity} | 
										<strong> Nearest Expiry:</strong> {formatDate(selectedMedicine.nearestExpiryDate)}
									</Typography>
								</Alert>
								<TextField
									fullWidth
									type="number"
									label="Quantity"
									value={medicineQuantity}
									onChange={(e) => setMedicineQuantity(parseInt(e.target.value) || 1)}
									inputProps={{
										min: 1,
										max: selectedMedicine.availableQuantity,
									}}
								/>
								<Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
									<Typography variant="body1">
										<strong>Total Amount:</strong>{" "}
										<Typography component="span" variant="h6" color="primary">
											{formatCurrency(selectedMedicine.unitPrice * medicineQuantity)}
										</Typography>
									</Typography>
								</Box>
							</>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setMedicineDialogOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						onClick={handleSaveMedicine}
						disabled={!selectedMedicine || saving}
					>
						{saving ? <CircularProgress size={24} /> : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Service Dialog */}
			<Dialog
				open={serviceDialogOpen}
				onClose={() => setServiceDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: "bold" }}>
					{editingServiceDetail ? "Edit Service Detail" : "Add Service"}
				</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 2 }}>
						<Autocomplete
							options={availableServices}
							getOptionLabel={(option) =>
								`${option.serviceName} - ${formatCurrency(option.unitPrice)}`
							}
							value={selectedService}
							onChange={(_, value) => setSelectedService(value)}
							renderInput={(params) => (
								<TextField {...params} label="Select Service" fullWidth />
							)}
							renderOption={(props, option) => {
								const { key, ...restProps } = props;
								return (
									<li key={key} {...restProps}>
										<Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
											<Typography variant="body1">{option.serviceName}</Typography>
											<Typography variant="body1" color="primary">
												{formatCurrency(option.unitPrice)}
											</Typography>
										</Box>
									</li>
								);
							}}
						/>
						{selectedService && (
							<>
								<Alert severity="info">
									<Typography variant="body2">
										<strong>Unit Price:</strong> {formatCurrency(selectedService.unitPrice)}
									</Typography>
								</Alert>
								<TextField
									fullWidth
									type="number"
									label="Quantity"
									value={serviceQuantity}
									onChange={(e) => setServiceQuantity(parseInt(e.target.value) || 1)}
									inputProps={{ min: 1 }}
								/>
								<Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
									<Typography variant="body1">
										<strong>Total Amount:</strong>{" "}
										<Typography component="span" variant="h6" color="primary">
											{formatCurrency(selectedService.unitPrice * serviceQuantity)}
										</Typography>
									</Typography>
								</Box>
							</>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						onClick={handleSaveService}
						disabled={!selectedService || saving}
					>
						{saving ? <CircularProgress size={24} /> : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Mark as Paid Dialog */}
			<Dialog
				open={markPaidDialogOpen}
				onClose={() => setMarkPaidDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle sx={{ fontWeight: "bold" }}>Confirm Payment</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 2 }}>
						<Box sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
							<Typography variant="body1">
								Total Amount:{" "}
								<Typography component="span" variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
									{formatCurrency(invoice.totalAmount)}
								</Typography>
							</Typography>
						</Box>
						<Autocomplete
							options={paymentMethods}
							getOptionLabel={(option) => option.methodName}
							value={selectedPaymentMethod}
							onChange={(_, value) => setSelectedPaymentMethod(value)}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Payment Method"
									fullWidth
								/>
							)}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setMarkPaidDialogOpen(false)}>Cancel</Button>
					{selectedPaymentMethod && !isCashBasedPayment(selectedPaymentMethod) && (
						<Button
							variant="outlined"
							startIcon={<QrCodeIcon />}
							onClick={() => {
								setMarkPaidDialogOpen(false);
								handleOpenQRPayment(selectedPaymentMethod);
							}}
						>
							QR Payment
						</Button>
					)}
					<Button
						variant="contained"
						onClick={handleMarkAsPaid}
						disabled={!selectedPaymentMethod || saving}
					>
						{saving ? <CircularProgress size={24} /> : "Confirm Payment"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deleteConfirmOpen}
				title={`Are you sure you want to delete this ${deleteTarget?.type === 'medicine' ? 'medicine' : 'service'} detail?`}
				type="warning"
				buttonCancel="Cancel"
				buttonConfirm="Delete"
				setOpen={setDeleteConfirmOpen}
				onConfirm={handleConfirmDelete}
			/>

			{/* Payment QR Modal */}
			<PaymentQRModal
				open={paymentModalOpen}
				onClose={() => setPaymentModalOpen(false)}
				invoice={invoice}
				onPaymentSuccess={handlePaymentSuccess}
				role={role}
				paymentMethod={selectedQRPaymentMethod}
			/>
		</Box>
	);
};

export default InvoiceDetailPage;
