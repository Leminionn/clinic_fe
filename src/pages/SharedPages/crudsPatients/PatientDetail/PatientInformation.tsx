import {
  Card,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import type { Patient } from "../../../../types/Patient";
import { Calendar, CalendarCheck, CalendarClock, IdCard, Mail, Phone } from "lucide-react";
import dayjs from "dayjs";
import { Female, Male } from "@mui/icons-material";

export default function PatientInformation({ data }: { data: Patient }) {
  return (
    <Card
      sx={{
        display: 'flex',
        gap: 4.5,
        padding: '20px 36px',
        borderRadius: 2,
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="150px"
      >
        <Box display="flex" flexDirection="column" gap="2px">
          <Typography sx={{ fontSize: '16px', color: 'var(--color-primary-main)' }}>
            #{data.patientId}
          </Typography>
          <Typography sx={{ fontSize: '20px', fontWeight: 'bold', }}>
            {data.fullName}
          </Typography>
          <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
            {data.address}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap="2px">
          <Phone size={16} />
          <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)', mx: 0.5, }}>
            Phone:
          </Typography>
          <Typography sx={{ fontSize: '16px', color: 'var(--color-text-main)', }}>
            {data.phone}
          </Typography>

          <Divider sx={{ height: '70%', borderWidth: 'thin', mx: 1, }} />

          <CalendarClock size={16} />
          <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)', mx: 0.5, }}>
            Last Visited:
          </Typography>
          <Typography sx={{ fontSize: '16px', color: 'var(--color-text-main)' }}>
            {dayjs(new Date("2025-04-30")).format("DD MMM YYYY")}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ height: '100%', borderWidth: 'thin', }} />

      <Box flex={1} display="flex" flexWrap="wrap">
        <Box width="30%" display="flex" alignItems="center" gap="12px">
          <Box sx={{
            height: 40,
            width: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--color-bg-tag)',
            borderRadius: 5,
          }}>
            <Calendar size={18} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              DOB
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {dayjs(new Date(data.dateOfBirth)).format("DD MMM YYYY")}
            </Typography>
          </Box>
        </Box>

        <Box width="44%" display="flex" alignItems="center" gap="12px">
          <Box sx={{
            height: 40,
            width: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--color-bg-tag)',
            borderRadius: 5,
          }}>
            <IdCard size={18} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              Citizen ID Number
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {data.idCard}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap="12px">
          <Box sx={{
            height: 40,
            width: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--color-bg-tag)',
            borderRadius: 5,
          }}>
            <CalendarCheck size={18} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              First Visit
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {dayjs(new Date(data.firstVisitDate)).format("DD MMM YYYY")}
            </Typography>
          </Box>
        </Box>

        <Box width="30%" display="flex" alignItems="center" gap="12px">
          <Box sx={{
            height: 40,
            width: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--color-bg-tag)',
            borderRadius: 5,
          }}>
            {data.gender === "Male" ?
              <Male sx={{ height: 20, width: 20 }} /> :
              <Female sx={{ height: 20, width: 20 }} />
            }
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              Gender
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {data.gender}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap="12px">
          <Box sx={{
            height: 40,
            width: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--color-bg-tag)',
            borderRadius: 5,
          }}>
            <Mail size={18} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              Email
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {data.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}