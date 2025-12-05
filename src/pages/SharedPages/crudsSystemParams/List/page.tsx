import { useEffect, useState, useCallback } from "react";
import {
	Box,
	Card,
	Typography,
	Divider,
	TextField,
	InputAdornment,
	Button,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { Search, Settings } from "lucide-react";
import { Add } from "@mui/icons-material";
import SystemParamsTable from "./SystemParamsTable";
import CreateUpdateSystemParam from "./CreateUpdateSystemParam";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import {
	systemParamsSearch,
	systemParamsDelete,
	systemParamGroupsGetAll,
} from "../../../../api/urls";
import type { SystemParam, SystemParamGroup } from "../../../../types/SystemParam";

const getToken = () => localStorage.getItem("accessToken");

export default function SystemParamsList() {
	const [searchKey, setSearchKey] = useState("");
	const [selectedGroupId, setSelectedGroupId] = useState<number | string>(
		"all"
	);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [editData, setEditData] = useState<SystemParam | null>(null);
	const [viewData, setViewData] = useState<SystemParam | null>(null);
	const [data, setData] = useState<SystemParam[]>([]);
	const [groups, setGroups] = useState<SystemParamGroup[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(7);
	const [totalItems, setTotalItems] = useState(0);

	useEffect(() => {
		fetchGroups();
	}, []);

	const fetchGroups = () => {
		apiCall(
			systemParamGroupsGetAll,
			"GET",
			getToken(),
			null,
			(res: any) => {
				setGroups(res || []);
			},
			(err: any) => {
				console.error(err);
			}
		);
	};

	const fetchList = useCallback(() => {
		setLoading(true);
		let query = `?page=${page - 1}&size=${rowsPerPage}`;
		if (searchKey) {
			query += `&keyword=${encodeURIComponent(searchKey)}`;
		}
		if (selectedGroupId !== "all") {
			query += `&groupId=${selectedGroupId}`;
		}

		console.log("Fetching params with query:", query);
		console.log("Token:", getToken());

		apiCall(
			systemParamsSearch(query),
			"GET",
			getToken(),
			null,
			(res: any) => {
				console.log("API Response:", res);
				setData(res.content || []);
				setTotalItems(res.totalElements || 0);
				setLoading(false);
			},
			(err: any) => {
				console.error("API Error:", err);
				setLoading(false);
			}
		);
	}, [page, rowsPerPage, searchKey, selectedGroupId]);

	useEffect(() => {
		fetchList();
	}, [fetchList]);

	const handleDelete = (id: number) => {
		setDeleteId(id);
		setIsDeleteOpen(true);
	};

	const handleEdit = (param: SystemParam) => {
		setEditData(param);
		setIsCreateOpen(true);
	};

	const handleView = (param: SystemParam) => {
		setViewData(param);
		setIsViewOpen(true);
	};

	const handleCloseView = () => {
		setIsViewOpen(false);
		setViewData(null);
	};

	const handleConfirmDelete = () => {
		if (deleteId !== null) {
			apiCall(
				systemParamsDelete(deleteId),
				"DELETE",
				getToken(),
				null,
				() => {
					showMessage("Parameter deleted successfully");
					setIsDeleteOpen(false);
					setDeleteId(null);
					fetchList();
				},
				(err: any) => {
					console.error(err);
					showMessage("Failed to delete parameter");
				}
			);
		}
	};

	const handleSearch = () => {
		setPage(1);
		fetchList();
	};

	const handleSaved = () => {
		showMessage(
			editData
				? "Parameter updated successfully"
				: "Parameter created successfully"
		);
		setIsCreateOpen(false);
		setEditData(null);
		fetchList();
	};

	const handleCloseDialog = () => {
		setIsCreateOpen(false);
		setEditData(null);
	};

	const getGroupName = (groupId: number) => {
		const group = groups.find((g) => g.groupId === groupId);
		return group ? group.groupName : "";
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				padding: "26px 50px",
				height: "100%",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, mx: 4, mb: 3 }}>
				<Settings size={28} />
				<Typography variant="h5" fontWeight="bold">
					System Parameters
				</Typography>
			</Box>

			<Box flex={1} p="6px">
				<Card
					sx={{
						height: "100%",
						display: "flex",
						flexDirection: "column",
						padding: "24px 30px",
						gap: 1,
						borderRadius: 2,
						boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
					}}
				>
					{/* Toolbar */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							gap: 2,
						}}
					>
						<Box sx={{ display: "flex", gap: 2, flex: 1 }}>
							<TextField
								placeholder="Search by code or name..."
								value={searchKey}
								onChange={(e) => setSearchKey(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSearch();
								}}
								size="small"
								sx={{ minWidth: 300 }}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Search size={18} />
										</InputAdornment>
									),
								}}
							/>

							<FormControl size="small" sx={{ minWidth: 200 }}>
								<InputLabel>Filter by Group</InputLabel>
								<Select
									value={selectedGroupId}
									onChange={(e) => {
										setSelectedGroupId(e.target.value);
										setPage(1);
									}}
									label="Filter by Group"
								>
									<MenuItem value="all">All Groups</MenuItem>
									{groups.map((group) => (
										<MenuItem key={group.groupId} value={group.groupId}>
											{group.groupName}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<Button
								variant="outlined"
								onClick={handleSearch}
								sx={{ textTransform: "none" }}
							>
								Search
							</Button>
						</Box>

						<Button
							variant="contained"
							startIcon={<Add />}
							onClick={() => setIsCreateOpen(true)}
							sx={{ textTransform: "none" }}
						>
							New Parameter
						</Button>
					</Box>

					<Divider sx={{ my: 1 }} />

					{/* Info */}
					<Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Total: <strong>{totalItems}</strong> parameters
						</Typography>
						{selectedGroupId !== "all" && (
							<Chip
								label={`Group: ${getGroupName(Number(selectedGroupId))}`}
								size="small"
								onDelete={() => setSelectedGroupId("all")}
								color="primary"
								variant="outlined"
							/>
						)}
					</Box>

					{/* Table */}
					<Box flex={1} overflow="hidden">
						<SystemParamsTable
							data={data}
							loading={loading}
							page={page}
							rowsPerPage={rowsPerPage}
							totalItems={totalItems}
							onPageChange={setPage}
							onRowsPerPageChange={(rows) => {
								setRowsPerPage(rows);
								setPage(1);
							}}
							onDelete={handleDelete}
							onEdit={handleEdit}
							onView={handleView}
						/>
					</Box>
				</Card>
			</Box>

			{/* Create/Update Dialog */}
			<CreateUpdateSystemParam
				open={isCreateOpen}
				onClose={handleCloseDialog}
				onSaved={handleSaved}
				editData={editData}
			/>

			{/* Delete Dialog */}
			<AlertDialog
				open={isDeleteOpen}
				setOpen={setIsDeleteOpen}
				onConfirm={handleConfirmDelete}
				title="Delete System Parameter?"
				type="warning"
				buttonCancel="Cancel"
				buttonConfirm="Delete"
			/>

			{/* View Dialog */}
			<Dialog open={isViewOpen} onClose={handleCloseView} maxWidth="md" fullWidth>
				<DialogTitle sx={{ bgcolor: "#1976d2", color: "white", fontWeight: "bold" }}>
					System Parameter Details
				</DialogTitle>
				<DialogContent sx={{ mt: 2 }}>
					{viewData && (
						<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
							<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
								<Box>
									<Typography variant="subtitle2" color="text.secondary">
										Parameter Code
									</Typography>
									<Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
										{viewData.paramCode}
									</Typography>
								</Box>
								<Box>
									<Typography variant="subtitle2" color="text.secondary">
										Parameter Name
									</Typography>
									<Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
										{viewData.paramName}
									</Typography>
								</Box>
								<Box>
									<Typography variant="subtitle2" color="text.secondary">
										Group
									</Typography>
									<Chip
										label={viewData.groupName || viewData.groupCode || "N/A"}
										size="small"
										sx={{
											mt: 0.5,
											bgcolor: "#e3f2fd",
											color: "#1976d2",
											fontWeight: 500,
										}}
									/>
								</Box>
								<Box>
									<Typography variant="subtitle2" color="text.secondary">
										Data Type
									</Typography>
									<Chip
										label={viewData.dataType}
										size="small"
										sx={{
											mt: 0.5,
											bgcolor: (() => {
												const colors: Record<string, string> = {
													STRING: "#2196f3",
													NUMBER: "#4caf50",
													BOOLEAN: "#ff9800",
													DATE: "#9c27b0",
													DECIMAL: "#00bcd4",
												};
												return colors[viewData.dataType] || "#757575";
											})(),
											color: "#fff",
											fontWeight: 500,
										}}
									/>
								</Box>
							</Box>
							<Box>
								<Typography variant="subtitle2" color="text.secondary">
									Parameter Value
								</Typography>
								<Typography
									variant="body1"
									fontWeight="600"
									sx={{
										mt: 0.5,
										bgcolor: "#f5f5f5",
										p: 1.5,
										borderRadius: 1,
									}}
								>
									{viewData.paramValue}
								</Typography>
							</Box>
							<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
								<Box>
									<Typography variant="subtitle2" color="text.secondary">
										Unit
									</Typography>
									<Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
										{viewData.unit || "-"}
									</Typography>
								</Box>
								<Box>
									<Typography variant="subtitle2" color="text.secondary">
										Effective From
									</Typography>
									<Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
										{viewData.effectiveFrom
											? new Date(viewData.effectiveFrom).toLocaleDateString("vi-VN")
											: "-"}
									</Typography>
								</Box>
							</Box>
							<Box>
								<Typography variant="subtitle2" color="text.secondary">
									Status
								</Typography>
								<Chip
									label={viewData.active ? "Active" : "Inactive"}
									size="small"
									sx={{
										mt: 0.5,
										bgcolor: viewData.active
											? "var(--color-bg-success)"
											: "var(--color-bg-error)",
										color: viewData.active
											? "var(--color-text-success)"
											: "var(--color-text-error)",
										fontWeight: 600,
									}}
								/>
							</Box>
							{viewData.description && (
								<Box>
									<Typography variant="subtitle2" color="text.secondary">
										Description
									</Typography>
									<Typography
										variant="body2"
										sx={{
											mt: 0.5,
											bgcolor: "#f5f5f5",
											p: 1.5,
											borderRadius: 1,
										}}
									>
										{viewData.description}
									</Typography>
								</Box>
							)}
						</Box>
					)}
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={handleCloseView} variant="contained" color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
