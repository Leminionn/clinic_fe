import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
  Avatar,
  Divider,
  TextField,
  InputAdornment
} from "@mui/material";
import { Check, Phone, Mail, MapPin, Search } from "lucide-react";
import { Person } from "@mui/icons-material";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import SelectDate from "../AppointmentBooking.tsx/SelectDate";
import SelectDoctor from "../AppointmentBooking.tsx/SelectDoctor";
import SelectTimeSlot from "../AppointmentBooking.tsx/SelectTimeSlots";
import AppointmentSummary from "../AppointmentBooking.tsx/Summary";
import type { Patient } from "../../../../types/Patient";
import { useAuth } from "../../../../auth/AuthContext";
import { apiCall } from "../../../../api/api";

// --- DTO Interfaces ---
interface AppointmentDetailResponse {
  appointmentId: number;
  patient: Patient;
  doctor: {
    staffId: number;
    fullName: string;
    image?: string;
  };
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm:ss
       // ID của slot thời gian hiện tại
}

export default function AppointmentUpdate() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { appointmentId } = useParams(); // Lấy ID từ URL

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(0);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [patientIdCard, setPatientIdCard] = useState("");
  const [notFound, setNotFound] = useState(false);

  // --- Fetch Data ---

  // 1. Lấy danh sách bác sĩ (để hiển thị trong SelectDoctor)
  const getListDoctor = () => {
    apiCall("unsecure/list_doctor", "GET", null, null, (data: any) => {
      setDoctorsList(data.data.map((item: { staffId: any; fullName: any; }) => ({
        id: item.staffId,
        fullName: item.fullName
      })));
    }, (data: any) => {
      console.error(data.message);
    });
  };
  function getDetailResponse(res:any) {
    return {
        appointmentId: res.appointmentId,
  patient: {
    patientId: res.patient.patientId,
    address: res.patient.address,
    firstVisitDate: dayjs(res.patient.firstVisitDate).format("DD/MM/YYYY"),
    fullName: res.patient.fullName,
    dateOfBirth: dayjs(res.patient.dateOfBirth).format("DD/MM/YYYY"),
    gender: res.patient.gender,
    email: res.patient.email,
    phone: res.patient.phone,
    idCard: res.patient.idCard
  },
  doctor: {
    staffId: res.doctorId,
    fullName: res.doctorName
    
  },
  appointmentDate:  dayjs(res.appointmentDate).format("YYYY-MM-DD"), // YYYY-MM-DD
  appointmentTime: res.appointmentTime // HH:mm:ss
  
    }
  }
  // 2. Lấy chi tiết Appointment và điền vào form
  const getAppointmentDetail = () => {
    if (!appointmentId) return;
    
    // Xác định prefix URL dựa trên role
    let prefix = "";
    if (role === "Admin") prefix = "admin";
    if (role === "Receptionist") prefix = "receptionist";
    if (role === "Doctor") prefix = "doctor";
    if (role === "Patient") prefix = "patient";

    const accessToken = localStorage.getItem("accessToken");
    let url="";
    if(role=="Patient") url=`patient/appointment/${appointmentId}`;
    else url=`${prefix}/appointment_by_id/${appointmentId}`;
    // Gọi API lấy chi tiết
    apiCall(url, 'GET', accessToken ? accessToken : "", null, (res: any) => {
      const data = getDetailResponse(res.data);
      
      // -- PREFILL DATA --
      setPatient(data.patient);
      setPatientIdCard(data.patient.idCard);
      
      // Format ngày để khớp với SelectDate (YYYY-MM-DD)
      setSelectedDate(dayjs(data.appointmentDate).format("YYYY-MM-DD"));
      
      // Format giờ để khớp với SelectTimeSlot (HH:mm AM/PM hoặc HH:mm)
      // Giả sử API trả về HH:mm:ss, ta cắt lấy HH:mm. 
      // Lưu ý: SelectTimeSlot của bạn đang dùng logic so sánh chuỗi chính xác (ví dụ "08:00 AM"), 
      // nên bạn cần đảm bảo format này khớp với output của SelectTimeSlots.tsx.
      // Ở đây tôi giả định logic hiển thị time sẽ tự khớp nếu chuỗi giống nhau.
      setSelectedTime(data.appointmentTime.substring(0, 5)); 
      
      

      // Set Doctor object (cần id và fullName để SelectDoctor hiển thị đúng)
      setSelectedDoctor({
        id: data.doctor.staffId,
        fullName: data.doctor.fullName
      });

      setLoading(false);
    }, (err: any) => {
      alert("Failed to load appointment: " + err.message);
      navigate(-1);
    });
  };
  const getSlotId=()=>{
    if(!appointmentId) return;
    apiCall(`unsecure/appointment/scheduleId/${appointmentId}`,'GET',null,null,(data:any)=>{
      setSelectedSlotId(data.data);
    },(data:any)=>{
      alert(data.message);
      
      navigate(role=="Receptionist"?"/receptionist":"/patient");
    })
  }

  useEffect(() => {
    getListDoctor();
    getSlotId();
    getAppointmentDetail();
    
  }, [appointmentId, role]);

  // --- Handlers ---

  const handleDoctorChange = (e: any) => {
    const doc = doctorsList.find((d) => d.id === e.target.value);
    setSelectedDoctor(doc);
    // Khi đổi bác sĩ, reset giờ và slot
    setSelectedTime("");
    setSelectedSlotId(0);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    // Khi đổi ngày, reset giờ và slot
    setSelectedTime("");
    setSelectedSlotId(0);
  };

  const handleUpdateAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !selectedSlotId) {
      alert("Please select all required fields.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    
    // Body request cho Update (thường cần appointmentId và thông tin schedule mới)
    const body = {
      
      scheduleId: selectedSlotId,
      patientId: patient?.patientId
      // patientId thường không đổi trong update, nhưng nếu API cần thì bỏ vào:
      // patientId: patient?.patientId 
    };

    const prefix = role === "Patient" ? "patient" : "receptionist"; 
    // Giả sử endpoint update là /update_appointment
    const url = `${prefix}/appointment/update/${appointmentId}`; 

    apiCall(url, "PUT", accessToken ? accessToken : "", JSON.stringify(body), (data: any) => {
      setIsSuccess(true);
    }, (data: any) => {
      alert(data.message);
    });
  };

  // --- Render Loading ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // --- Render Success Screen ---
  if (isSuccess) return (
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

        <Typography variant="h6" fontWeight="bold">Update Successful!</Typography>
        <Typography sx={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          The appointment has been successfully updated.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{
            textTransform: 'none',
            mt: 3,
            fontWeight: 600,
            borderRadius: 3,
            boxShadow: 'none',
          }}
          onClick={() => navigate(-1)}
        >
          Back to Detail page
        </Button>
      </Card>
    </Box>
  );

  function handleSearch(): void {
     if (!patientIdCard.trim()) return;
    
        setLoading(true);
        setNotFound(false);
        setPatient(null);
    
        
          let res = patient;
          const accessToken = localStorage.getItem("accessToken");
          apiCall(`receptionist/find_patient?idCard=${patientIdCard}`,'GET',accessToken?accessToken:"",null,(data:any)=>{
            res = {
              patientId: data.data.patientId,
              address: data.data.address,
              firstVisitDate: dayjs(data.data.firstVisitDate).format("DD/MM/YYYY"), 
              fullName: data.data.fullName,
              dateOfBirth: dayjs(data.data.dateOfBirth).format("DD/MM/YYYY"),
              gender: data.data.gender,
              email: data.data.email,
              phone: data.data.phone,
              idCard: data.data.idCard
            };
            setPatient(res);
            setLoading(false);
          },(data:any)=>{
            if(data.statusCode==404){
              setNotFound(true);
              setLoading(false);
            }
            else {
              alert(data.message);
              navigate("/receptionist");
            }
          })
  }

  // --- Main Render ---
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Update Appointment #{appointmentId}
      </Typography>
      

      <Box sx={{
        display: 'flex',
        flexDirection: { md: 'column', lg: 'row' },
        mx: 4,
        gap: 5,
      }}>
        {/* Left column */}
        <Box sx={{ flex: 1 }}>
          {/* Patient Info Card (Read-only mode) */}
          { (
            <Card sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
            }}>
              <Typography sx={{ fontWeight: 'bold', mb: 2 }}>Patient Information</Typography>
              { role=="Receptionist"&&<TextField
        value={patientIdCard}
        onChange={(e) => setPatientIdCard(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search by patient id card"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={22} color="var(--color-text-secondary)" />
            </InputAdornment>
          ),
        }}
        sx={{
          bgcolor: "var(--color-bg-input)",
          borderRadius: 3,
          mb: 2,
          '& .MuiInputBase-root': {
            pl: '18px',
          },
          '& .MuiInputBase-input': {
            py: '10px',
            pl: 1,
            pr: 3
          },
          '& fieldset': {
            border: 'none'
          },
        }}
      />}
      {
        role=="Receptionist"&&notFound&&<h3>Patient not found</h3>
      }
      {!notFound&&patient&&
      <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.light', color: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{patient.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{patient.gender}, {patient.idCard}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                  <Phone size={16} /> <Typography variant="body2">{patient.phone}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                  <Mail size={16} /> <Typography variant="body2">{patient.email}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                  <MapPin size={16} /> <Typography variant="body2">{patient.address}</Typography>
                </Box>
              </Box>
              </Box>}
            </Card>
          )}

          <SelectDoctor
            doctorsList={doctorsList}
            selectedDoctor={selectedDoctor}
            handleDoctorChange={handleDoctorChange}
          />
          
          <SelectDate
            selectedDate={selectedDate}
            onChangeDate={handleDateChange}
          />
        </Box>
        
        {/* Right column */}
        <Box sx={{ flex: 1 }}>
            {
                selectedDoctor&&
          <SelectTimeSlot
            selectedDoctor={selectedDoctor}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            setSelectedSlotId={setSelectedSlotId}
            selectedSlotId={selectedSlotId}
          />}
          
          {patient && selectedDoctor && selectedDate && selectedTime && (
            <AppointmentSummary
              patient={patient}
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onConfirm={handleUpdateAppointment}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}