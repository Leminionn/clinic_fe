import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, IconButton, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, } from "lucide-react";
import type { Patient } from "../../../../types/Patient";
import { showMessage } from "../../../../components/ActionResultMessage";
import PatientInformation from "./PatientInformation";
import VisitHistory from "./VisitHistory";
import { apiCall } from "../../../../api/api";
import { useAuth } from "../../../../auth/AuthContext";

const fakePatient = {
  patientId: 1,
  fullName: "Nguyen Van An",
  dateOfBirth: "1995-04-12",
  gender: "Male",
  address: "12 Nguyen Trai, Ha Noi",
  phone: "0901234567",
  email: "an.nguyen@example.com",
  idCard: "012345678901",
  firstVisitDate: "2023-01-10",
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmType, setConfirmType] = useState<'error' | 'warning' | 'info'>('error');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [patientTabs,setPatientTabs] = useState<any>(null);
  const role = useAuth();
  const [data, setData] = useState<Patient>({
    patientId: 0,
    fullName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    idCard: "",
    firstVisitDate: "",
  })

  useEffect(() => {
    let prefix="";
    if(role.role=="Admin") prefix="admin";
    if(role.role=="Receptionist") prefix="receptionist";
    if(role.role=="Doctor") prefix="doctor";
    const accessToken = localStorage.getItem("accessToken");
    apiCall(`${prefix}/get_patient_by_id/${id}`,'GET',accessToken?accessToken:"",null,
      (data:any)=>{
        setData(data.data);
      },
      (data:any)=>{
        alert(data.message);
      });
    apiCall(`${prefix}/patient_tabs/${id}`,'GET',accessToken?accessToken:"",null,
      (data:any)=>{
        setPatientTabs(data.data);
      },
      (data:any)=>{
        alert(data.message);
      }
    )
  }, []);

  const handleConfirmDeletePatient = () => {
    setConfirmType('error');
    setConfirmMessage('Are you sure you want to delete this patient?');
    setIsConfirmDialogOpen(true);
  }

  const handleDeletePatient = () => {
    let prefix="";
    if(role.role=="Admin") prefix="admin";
    if(role.role=="Receptionist") prefix="receptionist";
    const accessToken = localStorage.getItem("accessToken");
    apiCall(`${prefix}/delete_patient/${id}`,'DELETE',accessToken,null,
      (data:any)=>{
        showMessage("Patient deleted successfully!");

        setIsConfirmDialogOpen(false);
        navigate(`/${prefix}/patients`);
      },
      (data:any)=>{
        alert(data.message);
      }
    )
    
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      gap: 3,
      height: '100%',
      overflowY: 'auto',
    }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={() => {
              navigate('..');
            }}
          >
            <ChevronLeft />
          </IconButton>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', }}>
            Patients
          </Typography>
        </Box>

       {role.role!="Doctor"&&<Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={handleConfirmDeletePatient}
            sx={{
              alignSelf: 'center',
              textTransform: "none",
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '6px 40px',
            }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
                  onClick={() => { navigate(`../update-patient/${id}`) }}
            sx={{
              alignSelf: 'center',
              textTransform: "none",
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '6px 40px',
            }}
          >
            Edit
          </Button>
        </Box>}
      </Box>

      <Box display="flex" p="6px">
        <PatientInformation data={data} />
      </Box>

      <Box display="flex" p="6px" width="100%">
       {patientTabs? <VisitHistory patientId={data.patientId} patientTabs={patientTabs}/>:
       <div></div>}
      </Box>

      <AlertDialog
        title={confirmMessage}
        type={confirmType}
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="Cancel"
        buttonConfirm="Yes"
        onConfirm={() => {
          confirmType === 'error' && handleDeletePatient()
        }}
      />

    </Box>

  );
}
