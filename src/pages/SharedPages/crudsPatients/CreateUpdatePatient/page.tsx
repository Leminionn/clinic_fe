import { useEffect, useState } from "react";
import { Box, Button, Card, MenuItem, Select, TextField, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import type { PatientCreateDto } from "../../../../types/PatientCreateDto";
import { useNavigate, useParams } from "react-router-dom";
import { apiCall } from "../../../../api/api";
import { useAuth } from "../../../../auth/AuthContext";

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
  const role = useAuth();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [data, setData] = useState<PatientCreateDto>(NullPatient)

  useEffect(() => {
    let prefix="";
    if(role.role=="Admin") prefix="admin";
    if(role.role=="Receptionist") prefix="receptionist";
    if (patientId) {
      //logic get patient info

      //gắn tạm
      const accessToken = localStorage.getItem("accessToken");
    apiCall(`${prefix}/get_patient_by_id/${patientId}`,'GET',accessToken?accessToken:"",null,
      (data:any)=>{
        setData(data.data);
      },
      (data:any)=>{
        alert(data.message);
      });
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
    let prefix="";
    if(role.role=="Admin") prefix="admin";
    if(role.role=="Receptionist") prefix="receptionist";
    const accessToken = localStorage.getItem("accessToken");
    if (isEditMode) {
      
      apiCall(`${prefix}/update_patient/${patientId}`,'PUT',accessToken?accessToken:"",JSON.stringify(data),(data:any)=>{
        showMessage("Patient updated successfully!");
        setData(NullPatient);
        setIsConfirmDialogOpen(false);
        navigate(`../patient-detail/${patientId}`);
      },(data:any)=>{
        alert(data.message);
      })
      
    } else {
      apiCall(`${prefix}/create_patient`,'POST',accessToken?accessToken:"",JSON.stringify(data),(data:any)=>{
        showMessage("Patient created successfully!");
        setData(NullPatient);
        setIsConfirmDialogOpen(false);
        navigate(`../patients`);
      },(data:any)=>{
        alert(data.message);
      })
    }

    
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
                <MenuItem value="MALE">
                  Male
                </MenuItem>
                <MenuItem value="FEMALE">
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
