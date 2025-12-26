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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
	Search as SearchIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { apiCall } from "../../../api/api";
import { invoiceSearch } from "../../../api/urls";
import type { InvoiceListItem, PaymentStatus } from "../../../types/Invoice";

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

interface PageResponse {
	content: InvoiceListItem[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
}

const InvoiceList: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { token } = useAuth();
	
	// Detect role from URL path
	const role = location.pathname.startsWith("/admin") ? "admin" : "receptionist";

	// Search filters
	const [patientName, setPatientName] = useState("");
	const [patientPhone, setPatientPhone] = useState("");
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");

	// Data
	const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalElements, setTotalElements] = useState(0);

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
				console.log("🔥 ADMIN API DEBUG:", response);

				let finalContent: InvoiceListItem[] = [];
				let finalTotal = 0;

				// TRƯỜNG HỢP 1: Axios chuẩn (response.data -> JSON Body -> .data -> Backend Data)
				// Cấu trúc: response.data.data.content
				if (response?.data?.data?.content && Array.isArray(response.data.data.content)) {
					console.log("✅ Case 1: Axios Wrapped (response.data.data.content)");
					finalContent = response.data.data.content;
					finalTotal = response.data.data.totalElements || 0;
				} 
				// TRƯỜNG HỢP 2: apiCall đã bóc vỏ Axios (response -> JSON Body -> .data -> Backend Data)
				// Cấu trúc: response.data.content
				else if (response?.data?.content && Array.isArray(response.data.content)) {
					console.log("✅ Case 2: JSON Body (response.data.content)");
					finalContent = response.data.content;
					finalTotal = response.data.totalElements || 0;
				}
				// TRƯỜNG HỢP 3: Backend trả về thẳng content (ít gặp nhưng có thể)
				// Cấu trúc: response.content
				else if (response?.content && Array.isArray(response.content)) {
					console.log("✅ Case 3: Direct Content (response.content)");
					finalContent = response.content;
					finalTotal = response.totalElements || 0;
				} else {
					console.error("❌ Không tìm thấy data ở bất kỳ đường dẫn nào!");
				}

				setInvoices(finalContent);
				setTotalElements(finalTotal);
				setLoading(false);
			},
			(error: unknown) => {
				console.error("❌ Error fetching invoices:", error);
				setInvoices([]);
				setTotalElements(0);
				setLoading(false);
			}
		);
	}, [token, role, patientName, patientPhone, paymentStatus, fromDate, toDate, page, rowsPerPage]);

	useEffect(() => {
		fetchInvoices();
	}, [fetchInvoices]);

	const handleSearch = () => {
		setPage(1);
		fetchInvoices();
	};

	const handleReset = () => {
		setPatientName("");
		setPatientPhone("");
		setPaymentStatus("");
		setFromDate("");
		setToDate("");
		setPage(1);
	};

	const handleViewDetail = (invoiceId: number) => {
		navigate(`/${role}/invoices/${invoiceId}`);
	};

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
			<Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
				Invoice List
			</Typography>

			{/* Search Filters */}
			<Paper sx={{ p: 3 }}>
				<Grid container spacing={3} alignItems="center">
					<Grid size={{ xs: 12, sm: 6, md: 2 }}>
						<TextField
							fullWidth
							size="small"
							label="Patient Name"
							value={patientName}
							onChange={(e) => setPatientName(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 2 }}>
						<TextField
							fullWidth
							size="small"
							label="Phone Number"
							value={patientPhone}
							onChange={(e) => setPatientPhone(e.target.value)}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 2 }}>
						<FormControl fullWidth size="small">
							<InputLabel>Status</InputLabel>
							<Select
								value={paymentStatus}
								label="Status"
								onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | "")}
							>
								<MenuItem value="">All</MenuItem>
								<MenuItem value="UNPAID">Unpaid</MenuItem>
								<MenuItem value="PAID">Paid</MenuItem>
								<MenuItem value="REFUNDED">Refunded</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 2 }}>
						<TextField
							fullWidth
							size="small"
							label="From Date"
							type="date"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 2 }}>
						<TextField
							fullWidth
							size="small"
							label="To Date"
							type="date"
							value={toDate}
							onChange={(e) => setToDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 2 }}>
						<Box sx={{ display: "flex", gap: 1.5 }}>
							<Button
								variant="contained"
								onClick={handleSearch}
								startIcon={<SearchIcon />}
							>
								Search
							</Button>
							<Button
								variant="outlined"
								onClick={handleReset}
								startIcon={<RefreshIcon />}
							>
								Reset
							</Button>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			{/* Invoice Table */}
			<Paper
				sx={{
					width: "100%",
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					flex: 1,
					p: 2,
				}}
			>
				<Table
					sx={{
						"& .MuiTableCell-root": {
							padding: "9px 8px",
						},
					}}
				>
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Patient</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
							<TableCell sx={{ fontWeight: "bold" }} align="right">Exam Fee</TableCell>
							<TableCell sx={{ fontWeight: "bold" }} align="right">Medicine</TableCell>
							<TableCell sx={{ fontWeight: "bold" }} align="right">Service</TableCell>
							<TableCell sx={{ fontWeight: "bold" }} align="right">Total</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
							<TableCell sx={{ fontWeight: "bold" }}>Payment</TableCell>
							<TableCell sx={{ fontWeight: "bold" }} align="center">Action</TableCell>
						</TableRow>
					</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={11} align="center">
										<CircularProgress size={28} sx={{ my: 2 }} />
									</TableCell>
								</TableRow>
							) : invoices.length === 0 ? (
								<TableRow>
									<TableCell colSpan={11} align="center">
										No data available
									</TableCell>
								</TableRow>
							) : (
								invoices.map((invoice, index) => {
									const statusStyle = getStatusStyle(invoice.paymentStatus);
									return (
										<TableRow
											key={invoice.invoiceId}
											hover
											sx={{ cursor: "pointer" }}
											onClick={() => handleViewDetail(invoice.invoiceId)}
										>
											<TableCell sx={{ fontWeight: "bold" }}>
												{(page - 1) * rowsPerPage + index + 1}
											</TableCell>
											<TableCell>{invoice.patientName}</TableCell>
											<TableCell>{invoice.patientPhone}</TableCell>
											<TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
											<TableCell align="right">
												{formatCurrency(invoice.examinationFee)}
											</TableCell>
											<TableCell align="right">
												{formatCurrency(invoice.medicineFee)}
											</TableCell>
											<TableCell align="right">
												{formatCurrency(invoice.serviceFee)}
											</TableCell>
											<TableCell align="right" sx={{ fontWeight: "bold" }}>
												{formatCurrency(invoice.totalAmount)}
											</TableCell>
											<TableCell>
												<Box
													sx={{
														display: "inline-flex",
														borderRadius: 1,
														padding: "2px 10px",
														color: statusStyle.text,
														bgcolor: statusStyle.bg,
														fontSize: "12px",
													}}
												>
													{getStatusLabel(invoice.paymentStatus)}
												</Box>
											</TableCell>
											<TableCell>
												{invoice.paymentMethodName || "-"}
											</TableCell>
											<TableCell align="center">
												<IconButton
													onClick={(e) => {
														e.stopPropagation();
														handleViewDetail(invoice.invoiceId);
													}}
													sx={{
														color: "var(--color-text-info)",
														border: "1px solid var(--color-primary-main)",
														borderRadius: 1.2,
														height: 32,
														width: 32,
													}}
													title="View Detail"
												>
													<Typography>i</Typography>
												</IconButton>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>

				{/* Pagination */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mr: 5,
						mt: 3,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Typography sx={{ color: "var(--color-text-secondary)" }}>
							Show
						</Typography>
						<Select
							value={rowsPerPage}
							onChange={(e) => {
								setRowsPerPage(Number(e.target.value));
								setPage(1);
							}}
							sx={{
								"& .MuiInputBase-input": {
									width: "20px",
									py: "6px",
								},
							}}
						>
							{[7, 10, 15, 25].map((item) => (
								<MenuItem key={item} value={item}>
									{item}
								</MenuItem>
							))}
						</Select>
						<Typography sx={{ color: "var(--color-text-secondary)" }}>
							results
						</Typography>
					</Box>

					<Pagination
						count={Math.ceil(totalElements / rowsPerPage)}
						page={page}
						onChange={(_, val) => setPage(val)}
						color="primary"
						shape="rounded"
						sx={{
							"& .MuiPaginationItem-root": {
								color: "var(--color-primary-main)",
								"&.Mui-selected": {
									color: "#fff",
								},
							},
						}}
					/>
				</Box>
			</Paper>
		</Box>
	);
};

export default InvoiceList;
