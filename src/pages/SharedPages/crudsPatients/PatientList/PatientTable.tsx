import { useEffect, useState } from "react";
import {
	Box,
	IconButton,
	MenuItem,
	Pagination,
	Select,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";
import { DeleteOutline, Edit, } from "@mui/icons-material";
import type { Patient } from "../../../../types/Patient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import { apiCall } from "../../../../api/api";



export default function PatientTable({
	handleDelete,
	gender,
	name
}: {
	handleDelete: (id: any) => void,
	gender: string,
	name: string
	
}) {
	const navigate = useNavigate();
	const { role } = useAuth();
	const [data, setData] = useState([]);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(7);
	const [totalItems, setTotalItems] = useState(0);
	const rowsPerPage = 7;
	
	
	useEffect(
		()=>{
			
			let url = `unsecure/patients?pageNumber=${page-1}&pageSize=${pageSize}`;
			if(name!="") url+=`&keyword=${name}`;
			if(gender!="") url+=`&gender=${gender}`;
			
			apiCall(url,'GET',null,null,(data:any)=>{
				setData(data.data.content);
				setTotalItems(data.data.totalElements);

			},(data:any)=>{
				alert(data.message);
		})}
		
	,[page,gender,name, pageSize])
	return (
		<Box sx={{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			height: '100%',
		}}>
			<Table sx={{
				'& .MuiTableCell-root': {
					padding: '9px 0px',
				}
			}}>
				<TableHead>
					<TableRow>
						<TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
						<TableCell sx={{ fontWeight: 'bold' }}>Date of Birth</TableCell>
						<TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
						<TableCell sx={{ fontWeight: 'bold' }}>Citizen ID Number</TableCell>
						<TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>
						<TableCell sx={{ fontWeight: 'bold' }}>Email ID</TableCell>
						<TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((p) => (
						<TableRow key={p.patientId} hover>
							<TableCell width="15%">
								{p.fullName}
							</TableCell>
							<TableCell width="12%">{p.dateOfBirth}</TableCell>
							<TableCell width="8%">{p.gender}</TableCell>
							<TableCell width="15%">{p.idCard}</TableCell>
							<TableCell width="12%">{p.phone}</TableCell>

							<TableCell
								width="15%"
								sx={{
									maxWidth: 150,
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}
								title={p.email}
							>
								{p.email}
							</TableCell>

							<TableCell
								width="12%"
								align="center"
							>
								{role!="Doctor"&&<IconButton
									onClick={() => { navigate(`update-patient/${p.patientId}`) }}
									sx={{
										color: 'var(--color-primary-contrast)',
										bgcolor: 'var(--color-primary-main)',
										borderRadius: 1.2,
										height: 32,
										width: 32,
										mr: 1,
									}}
									title="Edit Patient"
								>
									<Edit sx={{ fontSize: 20 }} />
								</IconButton>}

								{role === "Admin" &&
									<IconButton
										onClick={() => handleDelete(p.patientId)}
										sx={{
											color: 'var(--color-text-error)',
											border: '1px solid var(--color-text-error)',
											borderRadius: 1.2,
											height: 32,
											width: 32,
											mr: 1,
										}}
										title="Delete Patient"
									>
										<DeleteOutline sx={{ fontSize: 20 }} />
									</IconButton>
								}

								<IconButton
									onClick={() => navigate(`patient-detail/${p.patientId}`)}
									sx={{
										color: 'var(--color-text-info)',
										border: '1px solid var(--color-primary-main)',
										borderRadius: 1.2,
										height: 32,
										width: 32
									}}
									title="View Patient"
								>
									<Typography>i</Typography>
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Box sx={{ display: "flex", justifyContent: "flex-end", mr: 4, }}>
				<Select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            sx={{
              "& .MuiInputBase-input": {
                width: '20px',
                py: '6px',
              },
            }}
          >
            {[7, 10, 15].map(item => (
              <MenuItem value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
				<Pagination
					count={Math.ceil(totalItems / rowsPerPage)}
					page={page}
					onChange={(_, val) => setPage(val)}
					color="primary"
					shape="rounded"
				/>
			</Box>
		</Box>
	);
}
