import { useState } from "react";
import { Card, Box, Typography, Divider, } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import AppointmentToolbar from "./AppointmentToolbar";
import AppointmentTable from "./AppointmentTable";
import dayjs from "dayjs";
import { apiCall } from "../../../../api/api";
import { useAuth } from "../../../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AppointmentList() {
  const [searchKey, setSearchKey] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmType, setConfirmType] = useState<'error' | 'warning' | 'info'>('error');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEdit, setIsEdit]= useState(false);
  const {role}= useAuth();
  const navigate = useNavigate();
  const handleConfirmCancel = (id: any) => {
    setSelectedId(id);
    setConfirmType('error');
    setConfirmMessage('Are you sure you want to cancel this appointment?');
    setIsConfirmDialogOpen(true);
  };

  const handleCancelAppointment = (id:any) => {
     const accessToken = localStorage.getItem("accessToken");
    const url = role=="Receptionist"?`receptionist/change_appointment_status/${id}?status=CANCELLED`:`patient/change_appointment_status/${id}?status=CANCELLED`;
    apiCall(url,"GET",accessToken?accessToken:"",null,(data:any)=>{
      showMessage("Appointment cancellation successful!");
    setIsConfirmDialogOpen(false);
    setSelectedId(null);
    },(data:any)=>{
      alert(data.message);
      navigate(role=="Receptionist"?"/receptionist":"/patient");
    })

    
  }

  const handleConfirmCheckIn = (id: any) => {
    setSelectedId(id);
    setConfirmType('info');
    setConfirmMessage('Are you sure you want to admit this patient?');
    setIsConfirmDialogOpen(true);
  };

  const handleCheckIn = (id:any) => {
    const accessToken = localStorage.getItem("accessToken");
    const url = `receptionist/change_appointment_status/${id}?status=CONFIRMED`;
    apiCall(url,"GET",accessToken?accessToken:"",null,(data:any)=>{
      showMessage("Checked in successful!");
      setIsConfirmDialogOpen(false);
      setSelectedId(null);
    },(data:any)=>{
      alert(data.message);
      navigate("/receptionist");
    })
    
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Appointments
      </Typography>
      
      <Box flex={1} p="6px">
        <Card sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 48px',
          gap: 1,
          borderRadius: 2,
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
        }}>
          <AppointmentToolbar
            searchKey={searchKey}
            onChangeSearchKey={setSearchKey}
            date={selectedDate}
            onChangeDate={setSelectedDate}
            status={filterStatus}
            onChangeStatus={setFilterStatus}
          />

          <Divider />

          <Box flex={1} mt={2}>
            <AppointmentTable
              handleCancel={handleConfirmCancel}
              handleCheckIn={handleConfirmCheckIn}
              selectedStatus={filterStatus}
              selectedDate={selectedDate}
              patientName={searchKey}
            />
          </Box>
        </Card>
      </Box>

      <AlertDialog
        title={confirmMessage}
        type={confirmType}
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="No"
        buttonConfirm="Yes"
        onConfirm={() => {
          if (!selectedId) return;

          confirmType === 'error'
            ? handleCancelAppointment(selectedId)
            : handleCheckIn(selectedId)

        }}
      />
      
    </Box>
  );
}
