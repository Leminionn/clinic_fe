import { Box, Button, Card, Typography } from "@mui/material";
import dayjs from "dayjs";
import type { Patient } from "../../../../types/Patient";

export default function AppointmentSummary({
  patient,
  selectedDoctor,
  selectedDate,
  selectedTime,
  onConfirm,
}: {
  patient: Patient,
  selectedDoctor: any,
  selectedDate: string,
  selectedTime: string,
  onConfirm: () => void,
}) {
  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      mb: 3,
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography sx={{ fontWeight: 'bold', mb: 2.5, color: 'var(--color-primary-main)' }}>
        Appointment Summary
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        gap: 1,
        borderRadius: 2,
        border: "1px solid #ddd",
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
          <Typography >Patient Name:</Typography>
          <Typography fontWeight={600}>{patient.fullName}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
          <Typography >Patient's Id Card:</Typography>
          <Typography fontWeight={600}>{patient.idCard}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
          <Typography >Doctor:</Typography>
          <Typography fontWeight={600}>Dr. {selectedDoctor.fullName}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
          <Typography >Date:</Typography>
          <Typography fontWeight={600}>
            {dayjs(selectedDate).format("MMMM DD, YYYY")}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', }}>
          <Typography >Time:</Typography>
          <Typography fontWeight={600}>
            {selectedTime}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            mt: 2,
            borderRadius: 1,
            textTransform: "none",
            boxShadow: "none",
            fontWeight: 600,
          }}
        >
          Confirm Appointment
        </Button>
      </Box>
    </Card>
  );
}