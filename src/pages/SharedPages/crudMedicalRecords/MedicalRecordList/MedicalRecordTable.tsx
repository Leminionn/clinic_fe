"use client";

import { useEffect, useState } from "react";
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
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import { Eye } from "lucide-react";

interface MedicalRecord {
  recordId: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  examinateDate: string;
  diseaseType: string;
}

const fakeData: MedicalRecord[] = [
  { recordId: 1, patientId: 1, patientName: "Elizabeth Polson", doctorId: 1, doctorName: "David Lee", examinateDate: "2025-11-15T09:30:00", diseaseType: "Cúm mùa" },
  { recordId: 2, patientId: 2, patientName: "John David", doctorId: 2, doctorName: "Sarah Johnson", examinateDate: "2025-11-15T09:30:00", diseaseType: "Viêm họng cấp" },
  { recordId: 3, patientId: 3, patientName: "Krishtav Rajan", doctorId: 2, doctorName: "Sarah Johnson", examinateDate: "2025-11-15T09:30:00", diseaseType: "Cúm mùa" },
  { recordId: 4, patientId: 4, patientName: "Sumanth Tinson", doctorId: 3, doctorName: "Anna Kim", examinateDate: "2025-11-15T09:30:00", diseaseType: "Cúm mùa" },
  { recordId: 5, patientId: 5, patientName: "EG Subramani", doctorId: 1, doctorName: "David Lee", examinateDate: "2025-11-15T09:30:00", diseaseType: "" },
  { recordId: 6, patientId: 6, patientName: "Ranjan Maari", doctorId: 1, doctorName: "David Lee", examinateDate: "2025-11-15T09:30:00", diseaseType: "Suy giáp" },
  { recordId: 7, patientId: 7, patientName: "Philipile Gopal", doctorId: 3, doctorName: "Anna Kim", examinateDate: "2025-11-15T09:30:00", diseaseType: "Viêm dạ dày" },
  { recordId: 8, patientId: 8, patientName: "EG Subramani", doctorId: 1, doctorName: "David Lee", examinateDate: "2025-11-15T09:30:00", diseaseType: "Viêm mũi dị ứng" },
  { recordId: 9, patientId: 9, patientName: "Ranjan Maari", doctorId: 1, doctorName: "David Lee", examinateDate: "2025-11-15T09:30:00", diseaseType: "Đau mắt đỏ" },
  { recordId: 10, patientId: 10, patientName: "Philipile Gopal", doctorId: 3, doctorName: "Anna Kim", examinateDate: "2025-11-15T09:30:00", diseaseType: "Viêm họng cấp" },
];


export default function MedicalRecordTable({
  selectedDate,
  searchKey
}: {
  selectedDate: string,
  searchKey: string
}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [data, setData] = useState<MedicalRecord[]>(fakeData);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fake data
    setData(fakeData.slice(0, rowsPerPage))
    setTotalItems(fakeData.length)
  }, [page, rowsPerPage, selectedDate, searchKey])

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    }}>
      <Table sx={{
        '& .MuiTableCell-root': {
          padding: '8px 0px',
          color: 'var(--color-text-table)',
        },
        '& .MuiTypography-root': {
          fontSize: 14,
        },
      }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Examination Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Disease Type</TableCell>
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
              <TableRow key={row.recordId} hover>
                <TableCell width="10%" sx={{ fontWeight: 'bold' }}>
                  {row.recordId}
                </TableCell>

                <TableCell width="20%">
                  {dayjs(row.examinateDate).format("DD/MM/YYYY - hh:mm:ss")}
                </TableCell>

                <TableCell sx={{ width: '22%', maxWidth: 200, }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    pr: 6,
                    gap: 2,
                  }}
                    title={row.doctorName}
                  >

                    <Typography sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {row.doctorName}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ width: '22%', maxWidth: 200, }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    pr: 6,
                    gap: 2,
                  }}
                    title={"Dr. " + row.patientName}
                  >

                    <Typography sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      Dr. {row.patientName}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell width="16%">
                  {row.diseaseType ? (
                    <Chip
                      label={row.diseaseType}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    "N/A"
                  )}
                </TableCell>

                <TableCell align="center" width="10%">
                  <IconButton
                    onClick={() => { navigate(`/${role?.toLowerCase()}/medical-records/${row.recordId}`) }}
                    sx={{
                      color: 'var(--color-text-info)',
                      border: '1px solid var(--color-primary-main)',
                      borderRadius: 1.2,
                      height: 32,
                      width: 32
                    }}
                    title="View Record"
                  >
                    <Eye />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mr: 5, mt: 3, }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>
            Show
          </Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(e.target.value)}
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
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>
            results
          </Typography>
        </Box>

        <Pagination
          count={Math.ceil(totalItems / rowsPerPage)}
          page={page}
          onChange={(_, val) => setPage(val)}
          color="primary"
          shape="rounded"
          sx={{
            '& .MuiPaginationItem-root': {
              color: 'var(--color-primary-main)',
              '&.Mui-selected': {
                color: '#fff',
              }
            }
          }}
        />
      </Box>
    </Box>
  );
}