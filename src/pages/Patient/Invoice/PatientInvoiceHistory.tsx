import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Chip,
	IconButton,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	InputAdornment,
	CircularProgress,
} from "@mui/material";
import {
	Visibility as ViewIcon,
	Search as SearchIcon,
	Receipt as ReceiptIcon,
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
	const [loading, setLoading] = useState(true);
	const [totalElements, setTotalElements] = useState(0);

	// Pagination
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [searchDate, setSearchDate] = useState("");

	const fetchInvoices = useCallback(() => {
		setLoading(true);

		let url = `${patientInvoices}?page=${page}&size=${rowsPerPage}`;
		if (statusFilter) {
			url += `&paymentStatus=${statusFilter}`;
		}

		apiCall(
			url,
			"GET",
			token,
			null,
			(response: {
				data: {
					content: InvoiceListItem[];
					totalElements: number;
				};
			}) => {
				let data = response.data.content;
				// Client-side filter by date if needed
				if (searchDate) {
					data = data.filter(
						(inv) =>
							inv.invoiceDate && inv.invoiceDate.startsWith(searchDate)
					);
				}
				setInvoices(data);
				setTotalElements(response.data.totalElements);
				setLoading(false);
			},
			(error: any) => {
				console.error("Error fetching invoices:", error);
				setLoading(false);
			}
		);
	}, [token, page, rowsPerPage, statusFilter, searchDate]);

	useEffect(() => {
		fetchInvoices();
	}, [fetchInvoices]);

	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

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

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
				<ReceiptIcon sx={{ fontSize: 32, mr: 2, color: "primary.main" }} />
				<Typography variant="h5">Lịch sử hóa đơn</Typography>
			</Box>

			{/* Filters */}
			<Paper sx={{ p: 2, mb: 3 }}>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<TextField
						type="date"
						label="Ngày lập"
						value={searchDate}
						onChange={(e) => setSearchDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
						size="small"
						sx={{ width: 200 }}
					/>
					<FormControl size="small" sx={{ minWidth: 200 }}>
						<InputLabel>Trạng thái</InputLabel>
						<Select
							value={statusFilter}
							label="Trạng thái"
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<MenuItem value="">Tất cả</MenuItem>
							<MenuItem value="PAID">Đã thanh toán</MenuItem>
							<MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
							<MenuItem value="REFUNDED">Đã hoàn tiền</MenuItem>
						</Select>
					</FormControl>
				</Box>
			</Paper>

			{/* Invoice Table */}
			<Paper>
				<TableContainer>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Mã HĐ</TableCell>
								<TableCell>Ngày lập</TableCell>
								<TableCell align="right">Tiền khám</TableCell>
								<TableCell align="right">Tiền dịch vụ</TableCell>
								<TableCell align="right">Tiền thuốc</TableCell>
								<TableCell align="right">Tổng tiền</TableCell>
								<TableCell align="center">Trạng thái</TableCell>
								<TableCell align="center">Chi tiết</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={8} align="center" sx={{ py: 5 }}>
										<CircularProgress />
									</TableCell>
								</TableRow>
							) : invoices.length === 0 ? (
								<TableRow>
									<TableCell colSpan={8} align="center" sx={{ py: 5 }}>
										Không có hóa đơn nào
									</TableCell>
								</TableRow>
							) : (
								invoices.map((invoice) => (
									<TableRow key={invoice.invoiceId} hover>
										<TableCell>#{invoice.invoiceId}</TableCell>
										<TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
										<TableCell align="right">
											{formatCurrency(invoice.examinationFee)}
										</TableCell>
										<TableCell align="right">
											{formatCurrency(invoice.serviceFee)}
										</TableCell>
										<TableCell align="right">
											{formatCurrency(invoice.medicineFee)}
										</TableCell>
										<TableCell align="right">
											<strong>{formatCurrency(invoice.totalAmount)}</strong>
										</TableCell>
										<TableCell align="center">
											<Chip
												size="small"
												label={getStatusLabel(invoice.paymentStatus)}
												color={getStatusColor(invoice.paymentStatus)}
											/>
										</TableCell>
										<TableCell align="center">
											<IconButton
												color="primary"
												onClick={() =>
													navigate(`/patient/invoices/${invoice.invoiceId}`)
												}
											>
												<ViewIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					component="div"
					count={totalElements}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25]}
					labelRowsPerPage="Số dòng mỗi trang"
				/>
			</Paper>
		</Box>
	);
};

export default PatientInvoiceHistory;
