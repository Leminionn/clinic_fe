import { useState } from "react";
import { Card, Box, Typography, Divider, } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import AppointmentToolbar from "./AppointmentToolbar";
import AppointmentTable from "./AppointmentTable";
import dayjs from "dayjs";

export default function AppointmentList() {
  const [searchKey, setSearchKey] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmType, setConfirmType] = useState<'error' | 'warning' | 'info'>('error');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEdit, setIsEdit]= useState(false);
  const handleConfirmCancel = (id: any) => {
    setSelectedId(id);
    setConfirmType('error');
    setConfirmMessage('Are you sure you want to cancel this appointment?');
    setIsConfirmDialogOpen(true);
  };

  const handleCancelAppointment = () => {
    showMessage("Appointment cancellation successful!");

    setIsConfirmDialogOpen(false);
    setSelectedId(null);
  }

  const handleConfirmCheckIn = (id: any) => {
    setSelectedId(id);
    setConfirmType('info');
    setConfirmMessage('Are you sure you want to admit this patient?');
    setIsConfirmDialogOpen(true);
  };

  const handleCheckIn = () => {
    showMessage("Checked in successful!");

    setIsConfirmDialogOpen(false);
    setSelectedId(null);
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
            ? handleCancelAppointment()
            : handleCheckIn()

        }}
      />
      
    </Box>
  );
}
