import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Pagination,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Paper,
  TableContainer
} from "@mui/material";
import { UpdateOutlined, VisibilityOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../api/api";

// 1. Interface tương ứng với JSON từ Backend
export interface PrescriptionDTO {
  prescriptionId: number;
  prescriptionDate: string; // YYYY-MM-DD
  notes: string;
  
  // Mapping từ entity MedicalRecord
  recordId: number;
  doctorName: string; // Lấy từ record.doctorName (getter)
  patientName: string; // Bạn cần đảm bảo MedicalRecord hoặc Prescription trả về patient info
  patientImage?: string; // Optional avatar
  
  // Dữ liệu từ MedicalRecord (nếu cần hiển thị thêm)
  diagnosis: string;
}

// Dữ liệu giả lập
const fakeData: PrescriptionDTO[] = [
  {
    prescriptionId: 101,
    prescriptionDate: "2025-10-25",
    notes: "Uống thuốc sau khi ăn",
    recordId: 501,
    doctorName: "David Lee",
    patientName: "Elizabeth Polson",
    patientImage: "https://picsum.photos/200/200?random=1",
    diagnosis: "Cảm cúm"
  },
  {
    prescriptionId: 102,
    prescriptionDate: "2025-10-25",
    notes: "Tái khám sau 1 tuần",
    recordId: 502,
    doctorName: "Sarah Johnson",
    patientName: "John David",
    patientImage: "https://picsum.photos/200/200?random=2",
    diagnosis: "Viêm họng"
  },
  // Thêm dữ liệu giả...
];

interface PrescriptionTableProps {
  searchKey: string;
  date: string;
}
function fromResponseToPrescriptionDTO(response:any) {
    return{
    prescriptionId: response.prescriptionId,
    prescriptionDate: dayjs("2025-01-06").format("DD-MM-YYYY"),
    notes: response.notes,
    recordId: response.record.recordId,
    doctorName: response.record.doctorName,
    patientName:response.record.patientName,
    diagnosis: response.record.diagnosis
  };
}
export default function PrescriptionTable({ searchKey, date }: PrescriptionTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [data, setData] = useState<PrescriptionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems]= useState(0);
  // Giả lập fetch data có filter
  const fetchPrescriptions = async () => {
    setLoading(true);
    let url=`doctor/prescriptions?pageNumber=${page-1}&pageSize=${rowsPerPage}`;
    if(searchKey&&searchKey!="") {
        url+=`&patientName=${searchKey}`;
    } 
    if(date&&date!="") {
        url+=`&prescriptionDate=${date}`;
    }
    const accessToken = localStorage.getItem("accessToken");
    apiCall(url,"GET",accessToken?accessToken:"",null,(data:any)=>{
        setData(data.data.content.map((item:any)=>fromResponseToPrescriptionDTO(item)));
        setTotalItems(data.data.totalElements);
        setLoading(false);
        
    },(data:any)=>{
        alert(data.message);
        navigate("/doctor");
    });
    /*setTimeout(() => {
        let filtered = fakeData;
        
        // Filter by Date
        if (date) {
            filtered = filtered.filter(item => item.prescriptionDate === date);
        }
        
        // Filter by Patient Name
        if (searchKey) {
            filtered = filtered.filter(item => 
                item.patientName.toLowerCase().includes(searchKey.toLowerCase())
            );
        }

        setData(filtered);
        setLoading(false);
    }, 500);*/
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [page, rowsPerPage, searchKey, date]);

  const handleViewDetail = (id: number) => {
      // Navigate tới trang chi tiết (nếu có)
      navigate(`/doctor/prescription/${id}`);
      console.log("View prescription:", id);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    }}>
      <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
        <Table sx={{
            '& .MuiTableCell-root': {
            padding: '12px 16px',
            color: 'var(--color-text-table)',
            borderBottom: '1px solid #f0f0f0'
            },
            '& .MuiTypography-root': {
            fontSize: 14,
            },
        }}>
            <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Diagnosis</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
            </TableRow>
            </TableHead>

            <TableBody>
            {loading ? (
                <TableRow>
                <TableCell colSpan={7} align="center">
                    <CircularProgress size={28} sx={{ my: 2 }} />
                </TableCell>
                </TableRow>
            ) : data.length > 0 ? (
                data.map((row) => (
                <TableRow key={row.prescriptionId} hover>
                    <TableCell>#{row.prescriptionId}</TableCell>
                    <TableCell>{dayjs(row.prescriptionDate).format("DD/MM/YYYY")}</TableCell>

                    {/* Patient */}
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            
                            <Typography fontWeight={500}>{row.patientName}</Typography>
                        </Box>
                    </TableCell>

                    {/* Doctor */}
                    <TableCell>
                        <Typography variant="body2">Dr. {row.doctorName}</Typography>
                    </TableCell>

                    {/* Diagnosis */}
                    <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.diagnosis}
                        </Typography>
                    </TableCell>

                    {/* Notes */}
                    <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.notes || "-"}
                        </Typography>
                    </TableCell>

                    <TableCell align="center">
                        <IconButton
                            onClick={() => handleViewDetail(row.prescriptionId)}
                            sx={{
                                color: 'var(--color-text-info)',
                                border: '1px solid var(--color-primary-main)',
                                borderRadius: 1.2,
                                height: 32,
                                width: 32
                            }}
                        >
                            <VisibilityOutlined sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                        onClick={() => navigate(`/doctor/prescription/update/${row.prescriptionId}`)}
                            sx={{
                                color: 'var(--color-text-info)',
                                border: '1px solid var(--color-primary-main)',
                                borderRadius: 1.2,
                                height: 32,
                                width: 32
                            }}>
                          <UpdateOutlined sx={{fontSize: 18}}/>
                        </IconButton>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={7} align="center">
                    No data found
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination (Tái sử dụng style) */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mr: 5, mt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>Show</Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            sx={{ "& .MuiInputBase-input": { width: '20px', py: '6px' } }}
          >
            {[7, 10, 15].map(item => (
              <MenuItem key={item} value={item}>{item}</MenuItem>
            ))}
          </Select>
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>results</Typography>
        </Box>

        <Pagination
          count={Math.ceil(totalItems / rowsPerPage) || 1} // Logic phân trang giả lập
          page={page}
          onChange={(_, val) => setPage(val)}
          color="primary"
          shape="rounded"
          sx={{ '& .MuiPaginationItem-root.Mui-selected': { color: '#fff' } }}
        />
      </Box>
    </Box>
  );
}