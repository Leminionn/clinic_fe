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
} from "@mui/material";
import ActionMenu from "../../../../components/ActionMenu";
import { PlayCircleOutline, Visibility } from "@mui/icons-material";
import type { Reception } from "../../../../types/Reception";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import { apiCall } from "../../../../api/api";
import { Edit } from "lucide-react";

export function getStatusBgColor(status: string): string {
  if (status === 'Admitted - Waiting') {
    return 'var(--color-bg-warning)'
  } else if (status === 'Examined - Unpaid') {
    return 'var(--color-bg-info)'
  } else if (status === 'Paid') {
    return 'var(--color-bg-success)'
  } else {
    return 'var(--color-bg-error)'
  }
}

export function getStatusTextColor(status: string): string {
  if (status === 'Admitted - Waiting') {
    return 'var(--color-text-warning)'
  } else if (status === 'Examined - Unpaid') {
    return 'var(--color-text-info)'
  } else if (status === 'Paid') {
    return 'var(--color-text-success)'
  } else {
    return 'var(--color-text-error)'
  }
}

const fakeData = [
  {
    receptionId: 101,
    patientName: "Nguyễn Văn A",
    patientId: 1,
    receptionDate: "2025-10-11T09:30:00",
    receptionistName: "Trần Thị B",
    receptionistId: 1,
    status: "Paid"
  },
  {
    receptionId: 102,
    patientName: "Lê Thị C",
    patientId: 2,
    receptionDate: "2025-10-11T09:45:00",
    receptionistName: "Trần Thị B",
    receptionistId: 1,
    status: "Admitted - Absent"
  },
  {
    receptionId: 103,
    patientName: "Nguyễn Văn E",
    patientId: 3,
    receptionDate: "2025-10-11T09:50:00",
    receptionistName: "Trần Thị B",
    receptionistId: 1,
    status: "Paid"
  },
  {
    receptionId: 104,
    patientName: "Phạm Thị F",
    patientId: 4,
    receptionDate: "2025-10-11T09:55:00",
    receptionistName: "Trần Thị B",
    receptionistId: 1,
    status: "Examined - Unpaid"
  },
  {
    receptionId: 105,
    patientName: "Trương Văn G",
    patientId: 5,
    receptionDate: "2025-10-11T10:10:00",
    receptionistName: "Nguyễn Minh D",
    receptionistId: 2,
    status: "Paid"
  },
  {
    receptionId: 106,
    patientName: "Lê Thị H",
    patientId: 6,
    receptionDate: "2025-10-11T10:15:00",
    receptionistName: "Nguyễn Minh D",
    receptionistId: 2,
    status: "Admitted - Waiting"
  },
  {
    receptionId: 107,
    patientName: "Dương Văn I",
    patientId: 7,
    receptionDate: "2025-10-11T10:30:00",
    receptionistName: "Nguyễn Minh D",
    receptionistId: 2,
    status: "Admitted - Waiting"
  },
  {
    receptionId: 108,
    patientName: "Nguyễn Văn A",
    patientId: 1,
    receptionDate: "2025-10-11T09:30:00",
    receptionistName: "Trần Thị B",
    receptionistId: 1,
    status: "Paid"
  },
  {
    receptionId: 109,
    patientName: "Lê Thị C",
    patientId: 2,
    receptionDate: "2025-10-11T09:45:00",
    receptionistName: "Trần Thị B",
    receptionistId: 1,
    status: "Admitted - Absent"
  },
  {
    receptionId: 110,
    patientName: "Nguyễn Văn E",
    patientId: 3,
    receptionDate: "2025-10-11T09:50:00",
    receptionistName: "Trần Thị B",
    receptionistId: 1,
    status: "Paid"
  },
];

export default function ReceptionTable() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [data, setData] = useState<Reception[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listReceptions, setListReceptions] = useState<Reception[]>([]);
  function mapData(listReceptions:any):Reception[] {
    return listReceptions.map((item:any)=>{
      const reception:Reception={
        receptionId: item.receptionId,
        patientName: item.patient.fullName,
        receptionDate: item.receptionDate,
        patientId: item.patient.patientId,
        receptionistName: item.receptionist.fullName,
        receptionistId: item.receptionist.staffId,
        status: item.status
      };
      return reception;
    })
  }
  const fetchReceptions = async (page:number, pageSize:number) => {
    const accessToken = localStorage.getItem("accessToken");
    apiCall(`receptionist/all_receptions?pageNumber=${page-1}&pageSize=${pageSize}`,"GET",accessToken?accessToken:"",null,
      (data:any)=>{
        console.log(data.data.content);
        setData(mapData(data.data.content));
        setTotalItems(data.data.totalElements);
      },
      (data:any)=>{
        alert(data.message);
      }
    )

  };

  useEffect(() => {
    fetchReceptions(page,rowsPerPage);
    
    
  }, [page, rowsPerPage]);


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
            <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Received by</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
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
            data.map((row, index) => (
              <TableRow key={row.receptionId} hover>
                <TableCell sx={{ width: "5%", fontWeight: 'bold' }}>
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                <TableCell width="20%">{row.patientName}</TableCell>
                <TableCell width="15%">
                  {dayjs(row.receptionDate).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell width="15%">
                  {dayjs(row.receptionDate).format("hh:mm")}
                </TableCell>
                <TableCell width="20%">{row.receptionistName}</TableCell>
                <TableCell width="20%">
                  <Box sx={{
                    display: 'inline-flex',
                    borderRadius: 1,
                    padding: '2px 10px',
                    color: getStatusTextColor(row.status),
                    bgcolor: getStatusBgColor(row.status),
                  }}>
                    {row.status}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <ActionMenu
                    actions={role === "Doctor" ? [
                      {
                        label: "View patient",
                        icon: Visibility,
                        onClick: () => navigate(`/${role}/patients/patient-detail/${row.patientId}`),
                      },
                      {
                        label: "Start examination",
                        icon: PlayCircleOutline,
                        onClick: () => { },
                      },
                    ] : row.status=="WAITING"?[
                      {
                        label: "View patient",
                        icon: Visibility,
                        onClick: () => navigate(`/${role}/patients/patient-detail/${row.patientId}`),
                      },
                      {
                        label:"Change Status",
                        icon: Edit,
                        onClick:()=>{}
                      }
                    ]:[
                      {
                        label: "View patient",
                        icon: Visibility,
                        onClick: () => navigate(`/${role}/patients/patient-detail/${row.patientId}`),
                      }
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                Không có dữ liệu
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