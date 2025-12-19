import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Typography
} from "@mui/material";
import { Check } from "lucide-react";
import dayjs from "dayjs";
import SelectDate from "./SelectDate";
import PatientInformation from "./PatientInformation";
import SelectDoctor from "./SelectDoctor";
import SelectTimeSlot from "./SelectTimeSlots";
import type { Patient } from "../../../../types/Patient";
import AppointmentSummary from "./Summary";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import { apiCall } from "../../../../api/api";

export interface IDoctor {
  id: number;
  fullName: string;
  image: string;
}
function fromResponseToPatient(data:any) {
  return {
    patientId: data.patientId,
    address: data.address,
    firstVisitDate: dayjs(data.firstVisitDate).format("DD/MM/YYYY"),
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    email: data.email,
    phone: data.phone,
    idCard: data.idCard
  }
  
}
export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient>();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [isConfirmed, setIsSuccess] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(0);
  const {role} = useAuth();

  /*const doctorsList: IDoctor[] = [
    { id: 1, fullName: "Sarah Smith"},
    { id: 2, fullName: "Michael Johnson"},
    { id: 3, fullName: "Emily Lee", image: "https://picsum.photos/200/200?random=3" },
    { id: 4, fullName: "Robert Brown", image: "https://picsum.photos/200/200?random=4" },
  ];*/
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  const handleDoctorChange = (e: any) => {
    const doc = doctorsList.find((d) => d.id === e.target.value);
    setSelectedDoctor(doc);
  };

  const handleConfirmAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {

      return;
    }
    const accessToken = localStorage.getItem("accessToken");
    const body = {
      scheduleId: selectedSlotId
    }

    apiCall("patient/book_appointment","POST",accessToken?accessToken:"",JSON.stringify(body),(data:any)=>{
      setIsSuccess(true);
    },(data:any)=>{
      alert(data.message);
      navigate("/patient");
    })
    

  };
  function getPatient() {
    const accessToken = localStorage.getItem("accessToken");
      apiCall("patient/auth","GET",accessToken?accessToken:"",null,(data:any)=>{
        setPatient(fromResponseToPatient(data.data));
      },(data:any)=>{
        alert(data.message);
        navigate("/patient");
      })
  }
  function getListDoctor() {
    apiCall("unsecure/list_doctor","GET",null,null,(data:any)=>{
      
      setDoctorsList(data.data.map((item: { staffId: any; fullName: any; })=>{
        return {
        id:item.staffId,
        fullName:item.fullName
        }
      }))
    },(data:any)=>{
        alert(data.message);
        navigate("/patient");
      });
  }
  useEffect(()=>{
    if(role=="Patient") {
      getPatient();
    }
    getListDoctor();

  },[role])

  if (isConfirmed) return (
    <Box sx={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Card sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '450px',
        padding: '24px',
        gap: 1,
        borderRadius: 2,
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          height: 80,
          my: 2,
          borderRadius: 100,
          bgcolor: 'var(--color-bg-success)',
        }}>
          <Check size={36} color="var(--color-success-main)" />
        </Box>

        <Typography>Appointment Confirmed!</Typography>
        <Typography sx={{ color: 'var(--color-text-secondary)' }}>
          Your appointment has been successfully booked.
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          mt: 2,
          px: 3,
          py: 2,
          gap: 1,
          borderRadius: 2,
          bgcolor: 'var(--color-bg-input)',
        }}>
          <Box sx={{ display: 'flex', gap: 1, }}>
            <Typography color="var(--color-text-secondary)">Patient Name:</Typography>
            <Typography fontWeight={600}>{patient?.fullName}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, }}>
            <Typography color="var(--color-text-secondary)">Patient's Id Card:</Typography>
            <Typography fontWeight={600}>{patient?.idCard}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, }}>
            <Typography color="var(--color-text-secondary)">Doctor:</Typography>
            <Typography fontWeight={600}>Dr. {selectedDoctor.fullName}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, }}>
            <Typography color="var(--color-text-secondary)">Date:</Typography>
            <Typography fontWeight={600}>
              {dayjs(selectedDate).format("MMMM DD, YYYY")}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, }}>
            <Typography color="var(--color-text-secondary)">Time:</Typography>
            <Typography fontWeight={600}>
              {selectedTime}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            textTransform: 'none',
            mt: 2,
            fontWeight: 600,
            borderRadius: 3,
            boxShadow: 'none',
          }}
          onClick={() => navigate(-1)}
        >
          Back to Dashboard
        </Button>
      </Card>
    </Box>
  );

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Book New Appointment
      </Typography>

      <Box sx={{
        display: 'flex',
        flexDirection: { md: 'column', lg: 'row' },
        mx: 4,
        gap: 5,
      }}>
        {/* Left column */}
        <Box sx={{ flex: 1, }}>
          {role!="Patient"&&<PatientInformation
            onSelectPatient={setPatient}
            onCreateNew={() => { }}
          />}
          <SelectDoctor
            doctorsList={doctorsList}
            selectedDoctor={selectedDoctor}
            handleDoctorChange={handleDoctorChange}
          />
          <SelectDate
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
          />
        </Box>

        {/* Right column */}
        <Box sx={{ flex: 1, }}>
          <SelectTimeSlot
            selectedDoctor={selectedDoctor}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            setSelectedSlotId={setSelectedSlotId}
          />
          
          {patient && selectedDoctor && selectedDate && selectedTime && (
            <AppointmentSummary
              patient={patient}
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onConfirm={handleConfirmAppointment}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}