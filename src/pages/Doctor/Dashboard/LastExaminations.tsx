import { Box, Button, Card, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fakeExam = {
  id: 'ex2',
  patientName: 'Trần Thị B',
  gender: 'Female',
  age: 28,
  examinationDate: '2025-10-14T10:00:00',
  symptoms: 'Đau đầu, chóng mặt, buồn nôn',
  diagnosis: 'Hạ huyết áp tạm thời',
}

export default function LastExamination({lastAppointment}:{lastAppointment:any}) {
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
        Last Appointment
      </Typography>
      {lastAppointment?
        (<Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: '12px' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
          {lastAppointment.patient.fullName?lastAppointment.patient.fullName:"Deleted patient"}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          ({lastAppointment.patient.gender?lastAppointment.patient.gender:"Deleted patient"})
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: '10px' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
          Checkup at
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Calendar size={16} />
          <Typography sx={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {dayjs(lastAppointment.appointmentDate).format("DD/MM/YYYY")}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Clock size={16} />
          <Typography sx={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {lastAppointment.appointmentTime}
          </Typography>
        </Box>
      </Box>

      </Box>):(<Box>No appointment</Box>)}

      <Button variant="contained" fullWidth sx={{
        mt: 'auto',
        textTransform: 'none',
      }}
      onClick={()=>{
        navigate(`/doctor/appointment/${lastAppointment.appointmentId}`)
      }}
      >
        Detail
      </Button>
    </Card>
  );
}
