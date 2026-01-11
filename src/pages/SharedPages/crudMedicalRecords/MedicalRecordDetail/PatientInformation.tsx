import { Avatar, Box, Button, Card, Divider, Typography } from "@mui/material"
import type { Patient } from "../../../../types/Patient"
import dayjs from "dayjs"
import { Calendar, CalendarCheck, IdCard, Mail, MapPin, Phone } from "lucide-react";
import { Female, Male } from "@mui/icons-material";

export default function PatientInformation({
  data,
  onViewPatient,
}: {
  data: Patient,
  onViewPatient: () => void,
}) {
  const patientAge = new Date().getFullYear() - dayjs(data.dateOfBirth).get('year');
  
  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography sx={{ color: 'var(--color-primary-main)' }}>
        Patient #{data.patientId}
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        my: 2,
      }}>
        <Avatar sx={{
          height: 80,
          width: 80,
          fontSize: 24,
          bgcolor: "var(--color-primary-main)",
        }}>
          {data.fullName[0]}
        </Avatar>

        <Typography sx={{ fontWeight: 'bold', mt: 2 }}>
          {data.fullName}
        </Typography>

        <Typography sx={{
          fontSize: 14,
          color: 'var(--color-text-secondary)',
          mt: 0.5,
        }}>
          {patientAge} Years, {data.gender}
        </Typography>

        <Button
          variant="outlined"
          sx={{
            textTransform: 'none',
            width: 'fit-content',
            mt: 1,
          }}
          onClick={onViewPatient}
        >
          View Patient Detail
        </Button>
      </Box>

      <Divider />

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 2,
      }}>
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
            <Calendar size={18} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              Date of Birth
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {dayjs(new Date(data.dateOfBirth)).format("DD MMM YYYY")}
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
            <Phone size={18} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              Phone
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {data.phone}
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
            <Typography sx={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              textWrap: 'wrap',
            }}>
              {data.email}
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
            <MapPin size={18} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '15px', fontWeight: 'bold', }}>
              Address
            </Typography>
            <Typography sx={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              {data.address}
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

      </Box>
    </Card>
  )
}