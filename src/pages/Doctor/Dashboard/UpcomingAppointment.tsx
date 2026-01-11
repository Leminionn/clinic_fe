import { Box, Button, Card, Typography } from "@mui/material";
import { Calendar, Clock } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";



export default function UpcomingAppointment({nextAppointment}:{nextAppointment:any}) {
  const navigate= useNavigate();
  
  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 30px',
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography sx={{ fontSize: '22px', fontWeight: 'bold' }}>
        Upcoming Appointment
      </Typography>

      {nextAppointment?(<Box><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: '12px' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
          {nextAppointment.patient.fullName?nextAppointment.patient.fullName:"Deleted patient"}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          ({nextAppointment.patient.gender?nextAppointment.patient.gender:"Deleted patient"})
        </Typography>
      </Box>

      <Typography sx={{ fontSize: '16px', fontWeight: 'bold', mt: '10px' }}>
        General Visit
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, mt: '5px' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Calendar size={16} />
          <Typography sx={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {dayjs(nextAppointment.appointmentDate).format("dddd, DD MMM YYYY")}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Clock size={16} />
          <Typography sx={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {nextAppointment.appointmentTime}
          </Typography>
        </Box>
      </Box>

     </Box>):(<Box>No appointment</Box>)}

      <Button variant="contained" fullWidth sx={{
        mt: 'auto',
        textTransform: 'none',
      }} onClick={(e)=>{
        navigate(`/doctor/appointment/${nextAppointment.appointmentId}`)
      }}>
        Detail
      </Button>
    </Card>
  );
}
