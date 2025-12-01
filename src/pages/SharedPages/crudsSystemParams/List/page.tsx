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

export default function SystemParamsList() {
	const [searchKey, setSearchKey] = useState("");
	const [selectedGroupId, setSelectedGroupId] = useState<number | string>(
		"all"
	);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [editData, setEditData] = useState<SystemParam | null>(null);
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
			null,
			null,
			(res: any) => {
				setGroups(res.data || []);
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

		apiCall(
			systemParamsSearch(query),
			"GET",
			null,
			null,
			(res: any) => {
				setData(res.data?.content || []);
				setTotalItems(res.data?.totalElements || 0);
				setLoading(false);
			},
			(err: any) => {
				console.error(err);
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

	const handleConfirmDelete = () => {
		if (deleteId !== null) {
			apiCall(
				systemParamsDelete(deleteId),
				"DELETE",
				null,
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
		</Box>
	);
}
