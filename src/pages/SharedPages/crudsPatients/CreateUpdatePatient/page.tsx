import { useEffect, useState } from "react";
import { Box, Button, Card, MenuItem, Select, TextField, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import type { PatientCreateDto } from "../../../../types/PatientCreateDto";
import { useNavigate, useParams } from "react-router-dom";

const fakePatient: PatientCreateDto = {
  fullName: "Nguyen Van An",
  dateOfBirth: "1995-04-12",
  gender: "Male",
  address: "12 Nguyen Trai, Ha Noi",
  phone: "0901234567",
  email: "an.nguyen@gmail.com",
  idCard: "012345678901",
  firstVisitDate: "2023-01-10",
}

const NullPatient: PatientCreateDto = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  idCard: "",
  firstVisitDate: "",
}

export default function CreateUpdatePatient() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [data, setData] = useState<PatientCreateDto>(NullPatient)

  useEffect(() => {
    if (patientId) {
      //logic get patient info

      //gắn tạm
      setData(fakePatient);
      setIsEditMode(true);
    }
    else {
      setData(NullPatient);
      setIsEditMode(false);
    }
  }, [patientId]);

  const handleConfirm = () => {
    setConfirmMessage(
      'Are you sure you want to '
      + (isEditMode ? 'update' : 'add')
      + ' this patient?'
    );
    setIsConfirmDialogOpen(true);
  }

  const handleSubmit = () => {
    if (isEditMode) {
      showMessage("Patient updated successfully!");
    } else {
      showMessage("Patient added successfully!");
    }

    setData(NullPatient);
    setIsConfirmDialogOpen(false);
    navigate(`../patient-detail/1`);
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 56px',
      height: '100%',
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        {isEditMode ? 'Update Patient Information' : 'Add New Patient'}
      </Typography>

      <Box flex={1} p="6px">
        <Card sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 40px',
          gap: 1,
          borderRadius: 2,
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
        }}>

          <Typography sx={{ fontSize: '20px', fontWeight: 'bold', mb: 2 }}>
            Patient Information
          </Typography>

          <Box m={1} display="flex" gap={5}>
            <Box flex={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Patient's Full Name
              </Typography>

              <TextField
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
                fullWidth
              />
            </Box>

            <Box flex={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Citizen Identification Number
              </Typography>

              <TextField
                value={data.idCard}
                onChange={(e) => setData({ ...data, idCard: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>

          <Box m={1} display="flex" gap={5}>
            <Box flex={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Date of Birth
              </Typography>

              <TextField
                value={data.dateOfBirth}
                onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
                fullWidth
                type="date"
              />
            </Box>

            <Box flex={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Gender
              </Typography>
              <Select
                value={data.gender}
                onChange={(e) => setData({ ...data, gender: e.target.value })}
                fullWidth
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                <MenuItem value="Male">
                  Male
                </MenuItem>
                <MenuItem value="Female">
                  Female
                </MenuItem>
              </Select>
            </Box>

            <Box flex={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                First Visit
              </Typography>
              <TextField
                value={data.firstVisitDate}
                onChange={(e) => setData({ ...data, firstVisitDate: e.target.value })}
                fullWidth
                type="date"
              />
            </Box>
          </Box>

          <Box m={1} display="flex" gap={5}>
            <Box flex={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Phone Number
              </Typography>
              <TextField
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                fullWidth
                type="tel"
              />
            </Box>

            <Box flex={1}>
              <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Email
              </Typography>
              <TextField
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                fullWidth
                type="email"
              />
            </Box>
          </Box>

          <Box m={1}>
            <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
              Address
            </Typography>
            <TextField
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              fullWidth
            />
          </Box>

          <Button
            variant="contained"
            onClick={() => handleConfirm()}
            sx={{
              alignSelf: 'center',
              mt: 5,
              textTransform: "none",
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '8px 40px',
            }}
          >
            {isEditMode ? 'Save' : 'Add Patient'}
          </Button>
        </Card>
      </Box>

      <AlertDialog
        title={confirmMessage}
        type="info"
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="Cancel"
        buttonConfirm="Yes"
        onConfirm={() => handleSubmit()}
      />
    </Box>
  );
}
