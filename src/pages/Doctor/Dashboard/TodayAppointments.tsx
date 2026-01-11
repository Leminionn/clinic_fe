import { Typography, Box, Card, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function getStatusBgColor(status: string): string {
  if (status === 'Scheduled') {
    return 'var(--color-bg-warning)'
  } else if (status === 'Checked-in') {
    return 'var(--color-bg-info)'
  } else if(status=="Completed") {
    return 'var(--color-bg-success)'
  }
  else {
    return 'var(--color-bg-error)'
  }
}

function getStatusTextColor(status: string): string {
  if (status === 'Scheduled') {
    return 'var(--color-text-warning)'
  } else if (status === 'Checked-in') {
    return 'var(--color-text-info)'
  } else if(status=="Completed"){
    return 'var(--color-text-success)'
  }
  else {
    return 'var(--color-text-error)'
  }
}

const fakeAppointments = [
  { id: 1, name: "Nguyễn Văn A", time: new Date('2025-10-14T09:30:00'), status: "Completed" },
  { id: 2, name: "Trần Thị B", time: new Date('2025-10-14T10:15:00'), status: "Completed" },
  { id: 3, name: "Lê Văn C", time: new Date('2025-10-14T11:00:00'), status: "Scheduled" },
  { id: 4, name: "Phạm Thị D", time: new Date('2025-10-14T13:30:00'), status: "Checked-in" },
  { id: 5, name: "Võ Văn E", time: new Date('2025-10-14T14:30:00'), status: "Checked-in" },
  { id: 6, name: "Hoàng Thị F", time: new Date('2025-10-14T16:00:00'), status: "Scheduled" },
];
function getStatus(responseStatus:any){
  if(responseStatus=="COMPLETED") return "Completed";
  if(responseStatus=="CONFIRMED") return "Checked-in";
  if(responseStatus=="NOSHOW") return "Absent";
  if(responseStatus=="SCHEDULED") return "Scheduled";
  if(responseStatus=="CANCELLED") return "Cancelled";
  return "";

}

export default function TodayAppointments({appointments}:{appointments:[]}) {
  const navigate = useNavigate();
  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '22px 50px',
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: '20px'
      }}>
        <Typography sx={{ fontSize: '22px', fontWeight: 'bold' }}>
          Today’s Appointments
        </Typography>
        <Box sx={{
          display: 'flex',
          padding: '2px 10px',
          border: '1px solid #ddd',
          borderRadius: 2,
        }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
            {appointments.length} total
          </Typography>
        </Box>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Time
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Patient Name
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {appointments.map(a => (
              <TableRow>
                <TableCell sx={{
                  color: 'var(--color-primary-main)',
                  flex: 0.6,
                  textAlign: 'center'
                }}>
                  {a.appointmentTime}
                </TableCell>
                <TableCell>
                  {a.patient.fullName?a.patient.fullName:"Deleted patient"}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{
                    display: 'inline-flex',
                    borderRadius: 1,
                    padding: '2px 10px',
                    color: getStatusTextColor(getStatus(a.status)),
                    bgcolor: getStatusBgColor(getStatus(a.status)),
                  }}>
                    {getStatus(a.status)}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" sx={{
                    padding: '2px 10px',
                    color: 'var(--color-primary-dark)',
                    bgcolor: 'var(--color-bg-default)',
                    textTransform: 'none',
                  }} onClick={(e)=>{
                    navigate("/doctor/appointments");
                    
                  }}>
                    View appointments
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 
      <Box sx={{
        display: 'flex',
        padding: '15px 30px',
        borderBottom: '1px solid',
        borderColor: 'text.disabled',
      }}>
        <Typography sx={{ flex: 2, }}>
          Time
        </Typography>
        <Typography sx={{
          flex: 5,
        }}>
          Patient Name
        </Typography>
        <Typography sx={{
          flex: 2,
          display: 'flex',
          justifyContent: 'center'
        }}>
          Status
        </Typography>
      </Box>
       
      <List sx={{
        overflowY: 'auto',
        flex: 1,
        pr: 1,
      }}>
        {appointments.map(a => (
          <ListItem
            key={a.id}
            disablePadding
            sx={{
              display: 'flex',
              borderBottom: '1px solid',
              borderColor: 'text.disabled',
              padding: '20px 0px'
            }}
          >
            <Typography sx={{
              color: 'primary.light',
              flex: 0.6,
              textAlign: 'center'
            }}>
              {a.time}
            </Typography>

            <Typography flex={1.2}>
              {a.name}
            </Typography>

            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <Box sx={{
                borderRadius: 1,
                padding: '2px 10px',
                color: getStatusTextColor(a.status),
                bgcolor: getStatusBgColor(a.status),
              }}>
                <Typography fontSize={14}>
                  {a.status}
                </Typography>
              </Box>
            </Box>

            <Box sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}>
              <Button variant="contained" sx={{
                padding: '2px 10px',
                color: 'primary.dark',
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'primary.light',
                textTransform: 'none',
              }}>
                View Record
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
      */}
    </Card>
  );
}
