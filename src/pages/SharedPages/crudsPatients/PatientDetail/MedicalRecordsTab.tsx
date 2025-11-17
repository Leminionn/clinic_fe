import {
  Card,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import type { Patient } from "../../../../types/Patient";
import { Calendar, CalendarCheck, CalendarClock, IdCard, Mail, Phone } from "lucide-react";
import dayjs from "dayjs";

export default function MedicalRecordsTab({ patientId }: { patientId: number }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Medical Records
      </Typography>
      <Divider />
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        (Medical record details will be shown here)
      </Typography>
    </Box>
  )
}