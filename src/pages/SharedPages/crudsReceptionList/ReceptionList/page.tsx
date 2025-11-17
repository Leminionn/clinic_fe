import { useState } from "react";
import { Card, Box, Typography, Divider, } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import NewReceptionForm from "./NewReception";
import ReceptionToolbar from "./ReceptionToolbar";
import ReceptionTable from "./ReceptionTable";
import dayjs from "dayjs";

export default function ReceptionList() {
  const [searchKey, setSearchKey] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [filterStatus, setFilterStatus] = useState("");
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleConfirmDelete = (id: any) => {
    setDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Reception List
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
          <ReceptionToolbar
            searchKey={searchKey}
            onChangeSearchKey={setSearchKey}
            date={selectedDate}
            onChangeDate={setSelectedDate}
            status={filterStatus}
            onChangeStatus={setFilterStatus}
            onOpenNewForm={() => setIsNewFormOpen(true)}
          />

          <Divider />

          <Box flex={1} mt={3}>
            <ReceptionTable />
          </Box>
        </Card>
      </Box>

      <NewReceptionForm
        open={isNewFormOpen}
        onClose={() => setIsNewFormOpen(false)}
        onConfirm={(patientId: number) => {
          showMessage("Received patient successfully!");

          setIsNewFormOpen(false);
        }}
        onAppointmentCheckIn={(appointmentId: number) => {
          showMessage("Checked in successfully!");

          setIsNewFormOpen(false);
        }}
      />

      <AlertDialog
        title="Are you sure you want to delete this patient?"
        type="error"
        open={isDeleteConfirmOpen}
        setOpen={setIsDeleteConfirmOpen}
        buttonCancel="Cancel"
        buttonConfirm="Delete"
        onConfirm={() => {
          if (!deleteId) return;

          showMessage("Patient deletion successful!");

          setIsDeleteConfirmOpen(false);
          setDeleteId(null);
        }}
      />
    </Box>
  );
}
