"use client";

import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Box, Pagination, Typography, Select, MenuItem,
} from "@mui/material";
import ActionMenu from "../../../../components/ActionMenu";
import { CancelOutlined, Done, PlayCircleOutline, Visibility } from "@mui/icons-material";
import type { Reception } from "../../../../types/Reception";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import { apiCall } from "../../../../api/api";
import AlertDialog from "./Alert"; // Import AlertDialog bạn đã dùng ở Dashboard
import { medicalRecordCreate } from "../../../../api/urls";


// ... (Các hàm getStatusBgColor, getStatusTextColor)
export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'WAITING':
      return 'var(--color-bg-warning)'; // Orange for waiting
    case 'IN_EXAMINATION':
      return 'var(--color-bg-info)'; // Blue for in progress
    case 'DONE':
      return 'var(--color-bg-success)'; // Green for completed
    case 'CANCELLED':
      return 'var(--color-bg-error)'; // Red for cancelled
    default:
      return 'var(--color-bg-warning)';
  }
}

export function getStatusTextColor(status: string): string {
  switch (status) {
    case 'WAITING':
      return 'var(--color-text-warning)'; // Orange text
    case 'IN_EXAMINATION':
      return 'var(--color-text-info)'; // Blue text
    case 'DONE':
      return 'var(--color-text-success)'; // Green text
    case 'CANCELLED':
      return 'var(--color-text-error)'; // Red text
    default:
      return 'var(--color-text-warning)';
  }
}

export default function ReceptionTable({ filterStatus, filterDate, patientName }: {
  filterStatus: string,
  filterDate: string | null,
  patientName: string
}) {
  const navigate = useNavigate();
  const { role } = useAuth();

  // States cho phân trang và dữ liệu
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [data, setData] = useState<Reception[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- STATES CHO DIALOG ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ role: string, status: string, id: number } | null>(null);

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState({ title: '', type: 'info' as 'error' | 'warning' | 'info' });

  // Hàm mở thông báo kết quả (thay thế alert)
  const showResult = (title: string, type: 'error' | 'warning' | 'info') => {
    setResultMessage({ title, type });
    setIsResultOpen(true);
  };

  const handleRequestChange = (targetRole: string, nextStatus: string, rowId: number) => {
    setPendingAction({ role: targetRole, status: nextStatus, id: rowId });
    setIsConfirmOpen(true);
  };

  const handleStartExam = (receptionId: number) => {
    const accessToken = localStorage.getItem("accessToken");
    const body = {
      receptionId: receptionId
    };

    apiCall(medicalRecordCreate, 'POST', accessToken || "", JSON.stringify(body),
      (response: any) => {
        const createdRecordId = response.data.recordId;
        showResult("Medical record created successfully!", "info");
        navigate(`/doctor/medical-records/${createdRecordId}`);
      },
      (error: any) => {
        showResult(error.message || "Failed to create medical record", "error");
      }
    );
  };

  const changeStatus = (targetRole: string, status: string, rowId: number) => {
    const accessToken = localStorage.getItem("accessToken");
    const body = {
      receptionId: rowId,
      newStatus: status
    }

    apiCall(`${targetRole.toLowerCase()}/reception/update`, 'PUT', accessToken || "", JSON.stringify(body),
      (response: any) => {
        showResult("Updated status successfully!", "info");
        fetchReceptions(page, rowsPerPage); // Refresh lại dữ liệu
      },
      (error: any) => {
        showResult(error.message || "Failed to update status", "error");
      }
    )
  };

  // Logic fetchReceptions (Giữ nguyên của bạn)
  const fetchReceptions = async (currentPage: number, pageSize: number) => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    let url = `${role?.toLowerCase()}/all_receptions?pageNumber=${currentPage - 1}&pageSize=${pageSize}`;
    if (filterStatus !== 'All') url += `&status=${filterStatus}`;
    if (filterDate) url += `&date=${filterDate}`;
    if (patientName) url += `&patientName=${patientName}`;

    apiCall(url, "GET", accessToken || "", null,
      (res: any) => {
        setData(mapData(res.data.content));
        setTotalItems(res.data.totalElements);
        setLoading(false);
      },
      (err: any) => {
        showResult(err.message, "error");
        setLoading(false);
      }
    )
  };

  // MapData (Giữ nguyên của bạn)
  function mapData(list: any): Reception[] {
    return list.map((item: any) => ({
      receptionId: item.receptionId,
      patientName: item.patient ? item.patient.fullName : "",
      receptionDate: item.receptionDate,
      patientId: item.patient ? item.patient.patientId : "",
      receptionistName: item.receptionist ? item.receptionist.fullName : "",
      receptionistId: item.receptionist ? item.receptionist.staffId : "",
      status: item.status
    }));
  }

  useEffect(() => {
    fetchReceptions(page, rowsPerPage);
  }, [page, rowsPerPage, filterStatus, filterDate, patientName]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Table sx={{ '& .MuiTableCell-root': { padding: '9px 0px' } }}>
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
            <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={28} /></TableCell></TableRow>
          ) : data.map((row, index) => (
            <TableRow key={row.receptionId} hover>
              <TableCell sx={{ fontWeight: 'bold' }}>{(page - 1) * rowsPerPage + index + 1}</TableCell>
              <TableCell>{row.patientName}</TableCell>
              <TableCell>{dayjs(row.receptionDate).format("DD/MM/YYYY")}</TableCell>
              <TableCell>{dayjs(row.receptionDate).format("HH:mm")}</TableCell>
              <TableCell>{row.receptionistName}</TableCell>
              <TableCell>
                <Box sx={{ display: 'inline-flex', borderRadius: 1, px: 1, py: 0.5, color: getStatusTextColor(row.status), bgcolor: getStatusBgColor(row.status) }}>
                  {row.status}
                </Box>
              </TableCell>
              <TableCell align="center">
                <ActionMenu
                  actions={[
                    {
                      label: "View patient",
                      icon: Visibility,
                      onClick: () => navigate(`/${role}/patients/patient-detail/${row.patientId}`),
                    },
                    // Sử dụng hàm handleRequestChange thay vì changeStatus trực tiếp
                    ...(row.status === "WAITING" && role === "Doctor" ? [{
                      label: "Start examination",
                      icon: PlayCircleOutline,
                      onClick: () => handleStartExam(row.receptionId)
                    }] : []),
                    ...(row.status === "WAITING" && role !== "Doctor" ? [{
                      label: "Cancel reception",
                      icon: CancelOutlined,
                      onClick: () => handleRequestChange(role!, "CANCELLED", row.receptionId)
                    }] : []),
                    ...(row.status === "IN_EXAMINATION" && role === "Doctor" ? [{
                      label: "Done",
                      icon: Done,
                      onClick: () => handleRequestChange("doctor", "DONE", row.receptionId)
                    }] : []),
                    {
                      label: "View reception",
                      icon: Visibility,
                      onClick: () => navigate(`/${role}/reception/${row.receptionId}`)
                    }
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
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



      {/* Phân trang... (Giữ nguyên) */}


      {/* --- CÁC DIALOG TỰ ĐỊNH NGHĨA --- */}

      {/* 1. Hộp thoại xác nhận hành động */}
      <AlertDialog
        open={isConfirmOpen}
        setOpen={setIsConfirmOpen}
        title={`Confirm changing status to ${pendingAction?.status}?`}
        type="warning"
        buttonCancel="Cancel"
        buttonConfirm="Yes, Proceed"
        onConfirm={() => {
          if (pendingAction) {
            changeStatus(pendingAction.role, pendingAction.status, pendingAction.id);
          }
        }}
      />

      {/* 2. Hộp thoại thông báo kết quả (Thành công/Lỗi) */}
      <AlertDialog
        open={isResultOpen}
        setOpen={setIsResultOpen}
        title={resultMessage.title}
        type={resultMessage.type}
        buttonConfirm="Close"
        onConfirm={() => setIsResultOpen(false)}
      />
    </Box>
  );
}
