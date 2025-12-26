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
  Button,
  Avatar,
} from "@mui/material";
import { CloseRounded, } from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import type { Appointment } from "../../../../types/Appointment";
import { apiCall } from "../../../../api/api";

export function getStatusBgColor(status: string): string {
  if (status === 'Scheduled') {
    return 'var(--color-bg-info)'
  } else if (status === 'Checked in') {
    return 'var(--color-bg-warning)'
  } else if (status === 'Completed') {
    return 'var(--color-bg-success)'
  } else if (status === 'Cancelled') {
    return 'var(--color-bg-error)'
  } else {
    return '#e0d4fc'
  }
}

export function getStatusTextColor(status: string): string {
  if (status === 'Scheduled') {
    return 'var(--color-text-info)'
  } else if (status === 'Checked in') {
    return 'var(--color-text-warning)'
  } else if (status === 'Completed') {
    return 'var(--color-text-success)'
  } else if (status === 'Cancelled') {
    return 'var(--color-text-error)'
  } else {
    return '#6226ef'
  }
}

const fakeData: Appointment[] = [
  { appointment_id: 1, patient_id: 1, patient_name: "Elizabeth Polson", patient_image: "https://picsum.photos/200/200?random=1", doctor_name: "David Lee", doctor_image: "https://picsum.photos/200/300?random=6", appointment_date: "05/12/2025", appointment_time: "8:30 AM", status: "Completed" },
  { appointment_id: 2, patient_id: 2, patient_name: "John David", patient_image: "https://picsum.photos/200/200?random=2", doctor_name: "Sarah Johnson", doctor_image: "https://picsum.photos/200/300?random=7", appointment_date: "05/12/2025", appointment_time: "9:00 AM", status: "Cancelled" },
  { appointment_id: 3, patient_id: 3, patient_name: "Krishtav Rajan", patient_image: "", doctor_name: "Sarah Johnson", doctor_image: "https://picsum.photos/200/200?random=7", appointment_date: "05/12/2025", appointment_time: "9:30 AM", status: "Completed" },
  { appointment_id: 4, patient_id: 4, patient_name: "Sumanth Tinson", patient_image: "https://picsum.photos/200/200?random=3", doctor_name: "Anna Kim", doctor_image: "https://picsum.photos/200/200?random=8", appointment_date: "05/12/2025", appointment_time: "10:30 AM", status: "Absent" },
  { appointment_id: 5, patient_id: 5, patient_name: "EG Subramani", patient_image: "", doctor_name: "David Lee", doctor_image: "https://picsum.photos/200/200?random=6", appointment_date: "05/12/2025", appointment_time: "2:00 PM", status: "Completed" },
  { appointment_id: 6, patient_id: 6, patient_name: "Ranjan Maari", patient_image: "https://picsum.photos/200/200?random=4", doctor_name: "David Lee", doctor_image: "https://picsum.photos/200/200?random=6", appointment_date: "05/12/2025", appointment_time: "2:30 PM", status: "Checked in" },
  { appointment_id: 7, patient_id: 7, patient_name: "Philipile Gopal", patient_image: "https://picsum.photos/200/200?random=5", doctor_name: "Anna Kim", doctor_image: "https://picsum.photos/200/200?random=8", appointment_date: "05/12/2025", appointment_time: "3:00 PM", status: "Scheduled" },
  { appointment_id: 8, patient_id: 8, patient_name: "EG Subramani", patient_image: "", doctor_name: "David Lee", doctor_image: "", appointment_date: "05/12/2025", appointment_time: "3:30 PM", status: "Checked in" },
  { appointment_id: 9, patient_id: 9, patient_name: "Ranjan Maari", patient_image: "", doctor_name: "David Lee", doctor_image: "", appointment_date: "05/12/2025", appointment_time: "4:00 PM", status: "Scheduled" },
  { appointment_id: 10, patient_id: 10, patient_name: "Philipile Gopal", patient_image: "", doctor_name: "Anna Kim", doctor_image: "", appointment_date: "05/12/2025", appointment_time: "4:30 PM", status: "Scheduled" },
];
function getStatus(appointmentStatus:string) {
  if(appointmentStatus=="SCHEDULED") return "Scheduled";
  if(appointmentStatus=="CONFIRMED") return "Checked in";
  if(appointmentStatus=="COMPLETED") return "Completed";
  if(appointmentStatus=="CANCELLED") return "Cancelled";
  if(appointmentStatus=="NOSHOW") return "Absent";
  return "";
}
function getEnumStatus(clientSideStatus:string) {
  if(clientSideStatus=="Scheduled") return "SCHEDULED";
  if(clientSideStatus=="Checked in") return "CONFIRMED";
  if(clientSideStatus=="Completed") return "COMPLETED";
  if(clientSideStatus=="Cancelled") return "CANCELLED";
  if(clientSideStatus=="Absent") return "NOSHOW";
  return "";
}
function mapAppointmentData(appointment:any) {
  return {
    appointment_id:appointment.appointmentId,
    patient_id: appointment.patient.patientId,
    patient_name: appointment.patient.fullName,
    doctor_name: appointment.doctorName,
    appointment_date: appointment.appointmentDate,
    appointment_time: appointment.appointmentTime,
    status: getStatus(appointment.status)
  }
}
export default function AppointmentTable({
  handleCancel,
  handleCheckIn,
  selectedStatus, 
  selectedDate,
  patientName
}: {
  handleCancel: (id: any) => void,
  handleCheckIn: (id: any) => void,
  selectedStatus: string,
  selectedDate: string, 
  patientName:string
}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [data, setData] = useState<Appointment[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async (page:number, rowsPerPage:number) => {
    setLoading(true);
    let url="";
    if(role=="Patient") {
      
      
      url= `patient/appointment_history?pageNumber=${page-1}&pageSize=${rowsPerPage}`;
      
      
    }
    if(role=="Receptionist"||role=="Admin") {
      let prefix="";
      if(role=="Receptionist") {
        prefix="receptionist";
      } 
      else prefix="admin";
      url=`${prefix}/appointments?pageNumber=${page-1}&pageSize=${rowsPerPage}`;
      if(patientName&&patientName!="") {
        url+=`&patientName=${patientName}`;
      }
    }
    if(selectedStatus&&selectedStatus!="") {
        url+=`&status=${getEnumStatus(selectedStatus)}`;
      }
      if(selectedDate&&selectedDate!="") {
        url+=`&appointmentDate=${selectedDate}`;
      }

    const accessToken = localStorage.getItem("accessToken");
      
      apiCall(url,"GET",accessToken?accessToken:"",null,(data:any)=>{
        setData(data.data.content.map((item: any)=>{
          return mapAppointmentData(item);
        }));
        setLoading(false);
        setTotalItems(data.data.totalElements);
      },(data:any)=>{
        alert(data.message);
        navigate("/patient");
      })
    
    

  };

  useEffect(() => {
    fetchAppointments(page,rowsPerPage);
    
  }, [page, rowsPerPage, selectedStatus,selectedDate,patientName]);


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
            <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Doctor</TableCell>
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
            data.map((row) => (
              <TableRow key={row.appointment_id} hover>
                <TableCell width="10%">
                  {row.appointment_time}
                </TableCell>
                <TableCell width="12%">
                  {dayjs(row.appointment_date).format("DD/MM/YYYY")}
                </TableCell>

                <TableCell sx={{ width: '25%', maxWidth: 200, }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    pr: 6,
                    gap: 2,
                  }}
                    title={row.patient_name}
                  >
                    
                    <Typography sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {row.patient_name}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ width: '25%', maxWidth: 200, }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    pr: 6,
                    gap: 2,
                  }}
                    title={"Dr. " + row.doctor_name}
                  >
                    
                    <Typography sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      Dr. {row.doctor_name}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell width="12%">
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
                <TableCell align="right" width="15%">
                  {role === "Receptionist"&&row.status=="Scheduled" &&
                    <Button
                      variant="text"
                      onClick={() => { handleCheckIn(row.appointment_id) }}
                      sx={{
                        fontWeight: 'bold',
                        textTransform: 'none',
                        height: 32,
                        mr: 1,
                      }}
                    >
                      Check in
                    </Button>
                  }
                  {(role === "Admin" || role === "Receptionist"||role=="Patient") &&row.status=="Scheduled"&&
                    <IconButton
                      onClick={() => { handleCancel(row.appointment_id) }}
                      sx={{
                        color: 'var(--color-primary-contrast)',
                        bgcolor: 'var(--color-error-secondary)',
                        ':hover': {
                          bgcolor: 'var(--color-text-error)',
                        },
                        borderRadius: 1.2,
                        height: 32,
                        width: 32,
                        mr: 1,
                      }}
                      title="Cancel Appointment"
                    >
                      <CloseRounded sx={{ fontSize: 20 }} />
                    </IconButton>
                  }

                  <IconButton
                    onClick={() => { navigate(`/${role?.toLowerCase}/patients/patient-detail/${row.patient_id}`) }}
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
                  <IconButton
                    onClick={() => { 
                      const prefix = role=="Patient"?"patient":"receptionist";
                      navigate(`/${prefix}/appointment/${row.appointment_id}`)
                     }}
                    sx={{
                      color: 'var(--color-text-info)',
                      border: '1px solid var(--color-primary-main)',
                      borderRadius: 1.2,
                      height: 32,
                      width: 32
                    }}
                    title="View appointment"
                  >
                    <Typography>D</Typography>
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