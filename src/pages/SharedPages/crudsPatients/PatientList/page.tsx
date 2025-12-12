import { useState } from "react";
import { Card, Box, Typography, Button, TextField, InputAdornment, Divider } from "@mui/material";
import PatientTable from "./PatientTable";
import { CalendarDays, Search } from "lucide-react";
import { Add } from "@mui/icons-material";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import { apiCall } from "../../../../api/api";

export default function PatientList() {
	const navigate = useNavigate();
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const role = useAuth();
	const handleConfirmDelete = (id: any) => {
		setDeleteId(id);
		setIsDeleteConfirmOpen(true);
	};

	return (
		<Box sx={{
			display: 'flex',
			flexDirection: 'column',
			padding: '26px 50px',
			height: '100%',
		}}>
			<Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
				Patient List
			</Typography>

			<Box flex={1} p="6px">
				<Card sx={{
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					padding: '24px 30px',
					gap: 1,
					borderRadius: 2,
					boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
				}}>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Box
							sx={{
								display: "flex",
								gap: 5,
								alignItems: "center",
							}}
						>
							<TextField
								placeholder="Search"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Search size={22} color="var(--color-text-secondary)" />
										</InputAdornment>
									),
								}}
								sx={{
									bgcolor: "var(--color-primary-light)",
									borderRadius: 3,
									width: '300px',
									'& .MuiInputBase-root': {
										pl: '18px',
									},
									'& .MuiInputBase-input': {
										py: '10px',
										pl: 1,
										pr: 3
									},
									'& fieldset': {
										border: 'none'
									},
								}}
							/>
							{/*
						<Button
							variant="outlined"
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								textTransform: "none",
								width: '220px',
								px: '28px',
								py: '10px',
								borderRadius: 3,
								borderWidth: 1.6
							}}
						>							
							<Typography fontSize={14} color="var(--color-text-placeholder)">
								Filter by Date
								</Typography>
							<CalendarDays size={18}/>
						</Button>
						*/}
						</Box>

						<Button
							variant="contained"
							startIcon={<Add sx={{ height: 24, width: 24, }} />}
							onClick={() => { navigate('create-patient'); }}
							sx={{
								borderRadius: 1,
								textTransform: "none"
							}}
						>
							New Patient
						</Button>
					</Box>

					<Divider />

					<Box flex={1} mt={3}>
						<PatientTable
							handleDelete={handleConfirmDelete}
						/>
					</Box>
				</Card>
			</Box>

			<AlertDialog
				title="Are you sure you want to delete this patient?"
				type="error"
				open={isDeleteConfirmOpen}
				setOpen={setIsDeleteConfirmOpen}
				buttonCancel="Cancel"
				buttonConfirm="Delete"
				onConfirm={() => {
					if (!deleteId) return;

					let prefix="";
					if(role.role=="Admin") prefix="admin";
					if(role.role=="Receptionist") prefix="receptionist";
					const accessToken = localStorage.getItem("accessToken");
					apiCall(`${prefix}/delete_patient/${deleteId}`,'DELETE',accessToken,null,
					(data:any)=>{
						showMessage("Patient deletion successful!");
						setIsDeleteConfirmOpen(false);
						setDeleteId(null);
						
					},
					(data:any)=>{
						alert(data.message);
					}
					)
				}}
			/>
		</Box>
	);
}
