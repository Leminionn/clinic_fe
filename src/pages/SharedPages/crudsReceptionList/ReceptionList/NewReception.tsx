import { useState, } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { apiCall } from "../../../../api/api";

export interface ReceptionPatientFindInterface {
  patientId: number;
  address: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  todayAppointment?: {
    appointmentId: number;
    date: string;
    doctorName: string;
  }[]
}

const NullPatient = {
  patientId: 0,
  address: "",
  fullName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
}
const fakePatient = {
  patientId: 1,
  fullName: "Nguyen Van An",
  dateOfBirth: "1995-04-12",
  gender: "Male",
  address: "12 Nguyen Trai, Ha Noi",
  phone: "0901234567",
  email: "an.nguyen@example.com",
  todayAppointment: [
    {
      appointmentId: 1,
      date: "2025-10-11T09:30:00",
      doctorName: "Ngô Văn A"
    },
  ]
}

export default function NewReceptionForm({
  open,
  onClose,
  onConfirm,
  onAppointmentCheckIn,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (patientId: number) => void;
  onAppointmentCheckIn: (appointmentId: number) => void;
}) {
  const navigate = useNavigate();
  const [patientIdCard, setPatientIdCard] = useState("");
  const [patientFound, setPatientFound] = useState(false);
  const [patient, setPatient] = useState<ReceptionPatientFindInterface>(NullPatient);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPatientIdCard("");
    setPatientFound(false);
    setPatient(NullPatient);
  }
  function mapData(patientResponse: any) {
    const result: ReceptionPatientFindInterface = {
      patientId: patientResponse.patientId,
      address: patientResponse.address,
      fullName: patientResponse.fullName,
      dateOfBirth: patientResponse.dateOfBirth,
      gender: patientResponse.gender,
      phone: patientResponse.phone,
      email: patientResponse.email
    };
    return result;
  }
  const handleFindPatient = (idCard: string) => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    apiCall(`receptionist/find_patient?idCard=${idCard}`, "GET", accessToken ? accessToken : "", null,
      (data: any) => {
        setPatientIdCard(idCard);
        setPatientFound(true);
        setPatient(mapData(data.data));
        setLoading(false);
      },
      (data: any) => {
        setPatientIdCard("");
        setPatientFound(false);
        setPatient(NullPatient);
        setLoading(false);
      }
    )


  }

  const handleCancel = () => {
    onClose();
    reset();
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth
      sx={{
        '& .MuiPaper-root': {
          padding: '26px 4px',
          borderRadius: '15px',
          maxWidth: '500px',
          height: '600px'
        },
        '& .MuiDialogContent-root': {
          padding: 0,
        },
        "& fieldset": {
          borderRadius: "10px",
        },
        "& .MuiInputBase-input": {
          padding: "15px 10px",
          fontSize: "16px",
          "&::placeholder": {
            color: "#a5bed4",
            opacity: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{
        padding: '18px 24px',
        paddingTop: '0px',
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        New Reception
        <Box sx={{ display: 'flex', gap: 1, mt: 3, }}>
          <TextField
            value={patientIdCard}
            fullWidth
            placeholder="Enter patient's citizen ID number to search"
            sx={{
              '& .MuiInputBase-root': {
                pl: '12px',
              },
              '& fieldset': {
                borderRadius: 1,
              },
            }}
            onChange={(e) => setPatientIdCard(e.target.value)}
          />

          <IconButton
            onClick={() => { handleFindPatient(patientIdCard) }}
            sx={{
              color: 'var(--color-primary-contrast)',
              bgcolor: 'var(--color-primary-main)',
              borderRadius: 1,
              width: '50px'
            }}
          >
            <Search />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <CircularProgress size={28} sx={{ my: 2 }} />
          </Box>
        ) : patientFound ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: '24px 30px',
            m: '15px 24px',
            bgcolor: 'var(--color-bg-default)',
            borderRadius: 1
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">Full name: </Typography>
              {patient.fullName}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">Gender: </Typography>
              {patient.gender}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">Date of Birth: </Typography>
              {dayjs(patient.dateOfBirth).format("DD/MM/YYYY")}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">Address: </Typography>
              {patient.address}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">Phone: </Typography>
              {patient.phone}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">Email: </Typography>
              {patient.email}
            </Box>
            {patient.todayAppointment && patient.todayAppointment.map((item) => (
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: '14px',
                mt: 1,
                bgcolor: 'var(--color-bg-paper)',
                borderRadius: 1,
                border: '1px solid var(--color-primary-main)',
              }}>
                <Box>
                  <Typography>
                    Appoinment at <b>{dayjs(item.date).format('HH:mm')}</b>
                  </Typography>
                  <Typography>
                    With <b>Dr. {item.doctorName}</b>
                  </Typography>
                </Box>
                <Button
                  onClick={() => {
                    onAppointmentCheckIn(item.appointmentId);
                    reset();
                  }}
                  sx={{
                    textTransform: 'none'
                  }}>
                  Check in
                </Button>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Typography color="var(--color-text-secondary)">
              Patient not found
            </Typography>
            <Button
              sx={{
                display: 'flex',
                gap: 1,
                textTransform: 'none'
              }}
              onClick={() => navigate('/receptionist/patients/create-patient')}>
              Add Patient
              <ArrowRight />
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{
        alignSelf: 'center',
        paddingTop: '16px',
        paddingBottom: '0px',
        gap: '10px',
      }}>
        <Button
          onClick={handleCancel}
          sx={{
            fontSize: "14px",
            fontWeight: "bold",
            color: 'var(--color-text-placeholder)',
            textTransform: "none",
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={reset}
          sx={{
            fontSize: "14px",
            fontWeight: "bold",
            color: 'var(--color-text-secondary)',
            textTransform: "none",
          }}
        >
          Reset
        </Button>

        {patientFound &&
          <Button
            variant="contained"
            onClick={() => {
              onConfirm(patient.patientId);
              reset();
            }}
            sx={{
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Confirm reception
          </Button>
        }
      </DialogActions>
    </Dialog >
  );
}
