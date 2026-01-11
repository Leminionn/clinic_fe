import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { useNavigate, useParams } from "react-router-dom";
import { showMessage } from "../../../../components/ActionResultMessage";
import PatientInformation from "./PatientInformation";
import MedicalInformation from "./MedicalInformation";
import { apiCall } from "../../../../api/api";
import { useAuth } from "../../../../auth/AuthContext";
import { ArrowBack } from "@mui/icons-material";
import type { Patient } from "../../../../types/Patient";
import PrescriptionInformation from "./PrescriptionInformation";
import ServiceInformation from "./ServiceInformation";

export interface Prescription {
  prescriptionId: number;
  notes: string;
  prescriptionDetail: PrescriptionDetail[];
}

export interface PrescriptionDetail {
  medicine: Medicine;
  quantity: number;
  dosage: string;
  days: number;
};

export interface Medicine {
  medicineId: number | null;
  medicineName: string;
  unit: string;
};

export interface Service {
  serviceId: number | null;
  serviceName: string;
}
export interface OrderedService extends Service {
  quantity: number;
}

export interface DiseaseType {
    diseaseTypeId: number;
    diseaseCode: string;
    diseaseName: string;
  };

export interface MedicalRecordDetail {
  recordId: number;
  examinateDate: string;
  patient: Patient,
  doctorId: number;
  doctorName: string;
  symptoms: string;
  diagnosis: string;
  diseaseType: DiseaseType | null;
  notes: string;
  orderedServices: OrderedService[];
  prescription: Prescription | null;
};

const NullMedicalRecordDetail = {
  recordId: 0,
  examinateDate: "",
  patient: {
    patientId: 0,
    fullName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    idCard: "",
    firstVisitDate: "",
  },
  doctorId: 0,
  doctorName: "",
  symptoms: "",
  diagnosis: "",
  diseaseType: {
    diseaseTypeId: 0,
    diseaseCode: "",
    diseaseName: "",
  },
  notes: "",
  orderedServices: [],
  prescription: {
    prescriptionId: 0,
    notes: "",
    prescriptionDetail: []
  },
}
const fakeMedicalRecord: MedicalRecordDetail = {
  recordId: 1,
  examinateDate: "2025-11-15T09:30:00",
  patient: {
    patientId: 1,
    fullName: "Nguyen Van An",
    dateOfBirth: "1995-04-12",
    gender: "Male",
    address: "12 Nguyen Trai, Ha Noi",
    phone: "0901234567",
    email: "an.nguyen@example.com",
    idCard: "012345678901",
    firstVisitDate: "2023-01-10",
  },
  doctorId: 1,
  doctorName: "Tran Van Nam",
  symptoms: "",
  diagnosis: "",
  diseaseType: {
    diseaseTypeId: 1,
    diseaseName: "Nhiễm trùng đường hô hấp trên cấp tính",
    diseaseCode: "J00",
  },
  notes: "",
  orderedServices: [
    { serviceId: 1, serviceName: "Xét nghiệm máu", quantity: 1, }
  ],
  prescription: {
    prescriptionId: 1,
    notes: "",
    prescriptionDetail: [
      {
        medicine: {
          medicineId: 1,
          medicineName: "Paracetamol 500mg",
          unit: "TABLET",
        },
        quantity: 2,
        dosage: "",
        days: 5,
      },
      {
        medicine: {
          medicineId: 3,
          medicineName: "Ibuprofen 200mg",
          unit: "BLISTER",
        },
        quantity: 10,
        dosage: "",
        days: 5,
      },
      {
        medicine: {
          medicineId: 5,
          medicineName: "Amoxicillin 500mg",
          unit: "BLISTER",
        },
        quantity: 5,
        dosage: "",
        days: 5,
      },
    ]
  },
}

export default function MedicalRecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [confirmType, setConfirmType] = useState<'medical_record' | 'prescription' | 'service'>('medical_record');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isMedicalRecordEditing, setIsMedicalRecordEditing] = useState(false);
  const [isPrescriptionEditing, setIsPrescriptionEditing] = useState(false);
  const [isServiceEditing, setIsServiceEditing] = useState(false);

  const [data, setData] = useState<MedicalRecordDetail | null>(fakeMedicalRecord);

  {/**
  useEffect(() => {
    let prefix = "";
    if (role.role == "Admin") prefix = "admin";
    if (role.role == "Receptionist") prefix = "receptionist";
    if (role.role == "Doctor") prefix = "doctor";
    const accessToken = localStorage.getItem("accessToken");
    apiCall(`${prefix}/get_MedicalRecord_by_id/${id}`, 'GET', accessToken ? accessToken : "", null,
      (data: any) => {
        setData(data.data);
      },
      (data: any) => {
        alert(data.message);
      });
    apiCall(`${prefix}/MedicalRecord_tabs/${id}`, 'GET', accessToken ? accessToken : "", null,
      (data: any) => {
        setMedicalRecordTabs(data.data);
      },
      (data: any) => {
        alert(data.message);
      }
    )
  }, []);
  */}

  const handleConfirmSaveMedicalRecord = () => {
    setConfirmType('medical_record');
    setConfirmMessage('Are you sure you want to save this medical record?');
    setIsConfirmDialogOpen(true);
  }

  const handleSaveMedicalRecord = () => {
    showMessage("The medical record has been successfully saved!");

    setIsConfirmDialogOpen(false);
  }

  const handleConfirmSavePrescription = () => {
    setConfirmType('prescription');
    setConfirmMessage('Are you sure you want to save this prescription?');
    setIsConfirmDialogOpen(true);
  }

  const handleSavePrescription = () => {
    showMessage("The prescription has been successfully saved!");

    setIsConfirmDialogOpen(false);
  }

  const handleConfirmSaveService = () => {
    setConfirmType('service');
    setConfirmMessage('Are you sure you want to save this prescription?');
    setIsConfirmDialogOpen(true);
  }

  const handleSaveService = () => {
    showMessage("The service list has been successfully saved!");

    setIsConfirmDialogOpen(false);
  }

  if (!data) {
    return (
      <Box display="flex" height="100%">
        <Card sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          m: '26px 50px',
          gap: 2,
          borderRadius: 2,
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",

        }}>
          <Typography>
            Medical record not found
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{
              mt: 2,
              gap: 1
            }}
          >
            <ArrowBack />
            Go back
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      gap: 3,
      height: '100%',
      overflowY: 'auto',
      "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "var(--color-text-secondary)", // QUAN TRỌNG
        color: "var(--color-text-secondary)",
      },
    }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => { navigate(-1) }}
            sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold" color="#1e293b">
            Medical Record #{data.recordId}
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        gap: '12px',
      }}>
        <Box flex={1}>
          <PatientInformation
            data={data.patient}
            onViewPatient={() => navigate(`/${role?.toLocaleLowerCase()}/patients/patient-detail/${data.patient.patientId}`)}
          />
        </Box>

        <Box flex={3}>
          <Card sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: 5,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          }}>
            <MedicalInformation
              initialData={data}
              isEditing={isMedicalRecordEditing}
              setIsEditing={setIsMedicalRecordEditing}
              onConfirmSave={handleConfirmSaveMedicalRecord}
            />

            <Divider />

            <PrescriptionInformation
              initialData={data.prescription}
              isEditing={isPrescriptionEditing}
              setIsEditing={setIsPrescriptionEditing}
              onConfirmSave={handleConfirmSavePrescription}
            />

            <Divider />

            <ServiceInformation
              initialData={data.orderedServices}
              isEditing={isServiceEditing}
              setIsEditing={setIsServiceEditing}
              onConfirmSave={handleConfirmSaveService}
            />
          </Card>
        </Box>
      </Box>

      <AlertDialog
        title={confirmMessage}
        type={"info"}
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="Cancel"
        buttonConfirm="Yes"
        onConfirm={() => {
          confirmType === 'medical_record' && handleSaveMedicalRecord()
          confirmType === 'prescription' && handleSavePrescription()
          confirmType === 'service' && handleSaveService()
        }}
      />
    </Box>
  );
}