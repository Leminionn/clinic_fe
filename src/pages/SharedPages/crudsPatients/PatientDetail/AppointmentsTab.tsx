import React from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Avatar,
  Stack,
  Tooltip,
  IconButton
} from "@mui/material";
import { AccessTime, Event, Person, VisibilityOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import { useAuth } from "../../../../auth/AuthContext";
import { useNavigate } from "react-router-dom";


export interface AppointmentDTO {
  appointmentId: number;
  doctorName: string;     
  doctorId: number;        
  appointmentDate: string; 
  appointmentTime: string; 
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW'; 
  createDate: string;
}


const getStatusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return { color: 'var(--color-text-info)', bg: 'var(--color-bg-info)' }; // Xanh dương
    case 'CONFIRMED':
      return { color: '#b7791f', bg: '#fefcbf' }; // Vàng cam
    
    case 'COMPLETED':
      return { color: 'var(--color-text-success)', bg: 'var(--color-bg-success)' }; // Xanh lá
    case 'CANCELLED':
      return { color: 'var(--color-text-error)', bg: 'var(--color-bg-error)' }; // Đỏ
    case 'NOSHOW':
      return { color: '#718096', bg: '#edf2f7' }; // Xám
    default:
      return { color: '#6226ef', bg: '#e0d4fc' }; // Tím mặc định
  }
};

interface AppointmentsTabProps {
  patientId: number;
  appointments: AppointmentDTO[]; // Nhận danh sách từ component cha
}

export default function AppointmentsTab({ patientId, appointments }: AppointmentsTabProps) {
  const role= useAuth();
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Appointment history
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {appointments.length === 0 ? (
        <Box 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: '#f9fafb', 
            borderRadius: 2, 
            border: '1px dashed #ccc' 
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No appointment
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Create at</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((row) => {
                const statusStyle = getStatusColor(row.status);
                
                return (
                  <TableRow
                    key={row.appointmentId}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, ':hover': { bgcolor: '#fdfdfd' } }}
                  >
                    {/* ID */}
                    <TableCell component="th" scope="row">
                      #{row.appointmentId}
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell>
                      <Stack direction="column" spacing={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Event fontSize="small" color="action" sx={{ width: 16 }} />
                          <Typography variant="body2" fontWeight={500}>
                            {dayjs(row.appointmentDate).format("DD/MM/YYYY")}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTime fontSize="small" color="action" sx={{ width: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                             {/* Format LocalTime (ví dụ: 08:30:00 -> 08:30) */}
                            {row.appointmentTime.substring(0, 5)} 
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Doctor */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar 
                           sx={{ width: 32, height: 32, bgcolor: '#e3f2fd', color: '#1976d2', fontSize: 14 }}
                        >
                            {/* Lấy chữ cái đầu của tên bác sĩ */}
                            {row.doctorName ? row.doctorName.charAt(0) : <Person />}
                        </Avatar>
                        <Typography variant="body2">
                          Dr. {row.doctorName}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: statusStyle.color,
                          bgcolor: statusStyle.bg,
                        }}
                      >
                        {row.status}
                      </Box>
                    </TableCell>

                    {/* Create Date */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(row.createDate).format("DD/MM/YYYY HH:mm")}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                        <Tooltip title="Detail">
                            <IconButton
                                onClick={() => {
                                    // TODO: Thêm logic chuyển hướng hoặc mở modal tại đây
                                    let prefix="";
                                    if(role.role=="Admin") prefix="admin";
                                    if(role.role=="Receptionist") prefix="receptionist";
                                    if(role.role=="Doctor") prefix="doctor";
                                    navigate(`/${prefix}/appointment/${row.appointmentId}`)
                                    console.log("appointment ID:", row.appointmentId);
                                }}
                                sx={{
                                    color: 'var(--color-primary-main)', // Hoặc dùng màu cứng '#1976d2' nếu biến CSS chưa có
                                    border: '1px solid currentColor',
                                    borderRadius: 1.5,
                                    height: 32,
                                    width: 32,
                                    padding: 0,
                                    opacity: 0.8,
                                    '&:hover': {
                                        opacity: 1,
                                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                            >
                                <VisibilityOutlined sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}