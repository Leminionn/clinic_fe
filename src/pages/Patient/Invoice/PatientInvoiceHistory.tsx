import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	IconButton,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	InputAdornment,
	CircularProgress,
	Pagination,
	Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
	Search as SearchIcon,
	Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { apiCall } from "../../../api/api";
import { patientInvoices } from "../../../api/urls";
import type { InvoiceListItem, PaymentStatus } from "../../../types/Invoice";

const PatientInvoiceHistory: React.FC = () => {
	const navigate = useNavigate();
	const { token } = useAuth();

	const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [totalElements, setTotalElements] = useState(0);

	// Pagination
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [searchDate, setSearchDate] = useState("");

	const fetchInvoices = useCallback(() => {
		setLoading(true);

		const pageIndex = page - 1;
		let url = `${patientInvoices}?page=${pageIndex}&size=${rowsPerPage}`;
		if (statusFilter) {
			url += `&paymentStatus=${statusFilter}`;
		}

		apiCall(
			url,
			"GET",
			token,
			null,
			(response: any) => {
				console.log("🔥 DEBUG API Response:", response);

				// Thử lấy data theo 2 cách phổ biến
				// Cách 1: Giả sử response là Axios Object (có lớp .data bọc ngoài)
				const path1 = response?.data?.data?.content;
				
				// Cách 2: Giả sử response là JSON Body (apiCall đã bóc vỏ)
				const path2 = response?.data?.content;

				console.log("Path 1 (response.data.data.content):", path1);
				console.log("Path 2 (response.data.content):", path2);

				// Lấy cái nào có dữ liệu
				let finalContent: InvoiceListItem[] = [];
				let finalTotal = 0;

				if (Array.isArray(path1)) {
					console.log("✅ Sử dụng Path 1 (response.data.data.content)");
					finalContent = path1;
					finalTotal = response.data.data.totalElements || 0;
				} else if (Array.isArray(path2)) {
					console.log("✅ Sử dụng Path 2 (response.data.content)");
					finalContent = path2;
					finalTotal = response.data.totalElements || 0;
				} else {
					console.error("❌ Không tìm thấy mảng dữ liệu trong response");
					console.log("Response structure:", JSON.stringify(response, null, 2));
				}

				// Filter client-side (nếu cần)
				if (searchDate && finalContent.length > 0) {
					console.log("🔍 Filtering by date:", searchDate);
					finalContent = finalContent.filter((inv: InvoiceListItem) => 
						inv.invoiceDate && inv.invoiceDate.startsWith(searchDate)
					);
					console.log("Filtered results:", finalContent.length);
				}

				setInvoices(finalContent);
				setTotalElements(finalTotal);
				setLoading(false);
			},
			(error: any) => {
				console.error("❌ Error fetching invoices:", error);
				setInvoices([]);
				setTotalElements(0);
				setLoading(false);
			}
		);
	}, [token, page, rowsPerPage, statusFilter, searchDate]);

	useEffect(() => {
		fetchInvoices();
	}, [fetchInvoices]);

	const handleSearch = () => {
		setPage(1);
		fetchInvoices();
	};

	const handleReset = () => {
		setStatusFilter("");
		setSearchDate("");
		setPage(1);
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

	const getStatusStyle = (status: PaymentStatus) => {
		switch (status) {
			case "PAID":
				return { bg: "var(--color-bg-success)", text: "var(--color-text-success)", label: "Paid" };
			case "UNPAID":
				return { bg: "var(--color-bg-warning)", text: "var(--color-text-warning)", label: "Unpaid" };
			case "REFUNDED":
				return { bg: "var(--color-bg-info)", text: "var(--color-text-info)", label: "Refunded" };
			default:
				return { bg: "var(--color-bg-secondary)", text: "var(--color-text-secondary)", label: status };
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
				Invoice History
			</Typography>

			{/* Search Filters */}
			<Paper sx={{ p: 3 }}>
				<Grid container spacing={3} alignItems="center">
					<Grid size={{ xs: 12, sm: 6, md: 2 }}>
						<TextField
							fullWidth
							size="small"
							type="date"
							label="Invoice Date"
							value={searchDate}
							onChange={(e) => setSearchDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
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
						<FormControl fullWidth size="small">
							<InputLabel>Status</InputLabel>
							<Select
								value={statusFilter}
								label="Status"
								onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "")}
							>
								<MenuItem value="">All</MenuItem>
								<MenuItem value="UNPAID">Unpaid</MenuItem>
								<MenuItem value="PAID">Paid</MenuItem>
								<MenuItem value="REFUNDED">Refunded</MenuItem>
							</Select>
						</FormControl>
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
								<TableCell colSpan={9} align="center">
									<CircularProgress size={28} sx={{ my: 2 }} />
								</TableCell>
							</TableRow>
					) : !invoices || invoices.length === 0 ? (
						<TableRow>
							<TableCell colSpan={9} align="center">
								No data available
							</TableCell>
						</TableRow>
					) : (
						invoices?.map((invoice, index) => {
								const statusStyle = getStatusStyle(invoice.paymentStatus);
								return (
									<TableRow
										key={invoice.invoiceId}
										hover
										sx={{ cursor: "pointer" }}
										onClick={() => navigate(`/patient/invoices/${invoice.invoiceId}`)}
									>
										<TableCell sx={{ fontWeight: "bold" }}>
											{(page - 1) * rowsPerPage + index + 1}
										</TableCell>
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
												{statusStyle.label}
											</Box>
										</TableCell>
										<TableCell>
											{invoice.paymentMethodName || "-"}
										</TableCell>
										<TableCell align="center">
											<IconButton
												onClick={(e) => {
													e.stopPropagation();
													navigate(`/patient/invoices/${invoice.invoiceId}`);
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
						count={Math.ceil(totalElements / rowsPerPage) || 1}
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

export default PatientInvoiceHistory;
