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
import { medicalRecordGetById, medicalRecordUpdate, prescriptionCreate, prescriptionUpdate } from "../../../../api/urls";

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
  receptionId: number;
  receptionStatus?: string;
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
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const [data, setData] = useState<MedicalRecordDetail | null>(null);
  const [medicalRecordData, setMedicalRecordData] = useState<any>(null);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [serviceData, setServiceData] = useState<any>(null);

  // Fetch medical record detail khi component mount
  useEffect(() => {
    if (!id) return;

    const accessToken = localStorage.getItem("accessToken");
    const url = medicalRecordGetById(role?.toLowerCase() || "doctor", parseInt(id));

    apiCall(url, 'GET', accessToken || "", null,
      (response: any) => {
        const recordData = response.data;
        setData(recordData);
        setMedicalRecordData(recordData);
        setPrescriptionData(recordData.prescription);
        setServiceData(recordData.orderedServices);
        setLoading(false);
      },
      (error: any) => {
        showMessage(error.message || "Failed to load medical record", "error");
        setLoading(false);
      }
    );
  }, [id, role]);

  const handleCompleteExamination = () => {
    if (!data?.receptionId) return;

    setIsCompleting(true);
    const accessToken = localStorage.getItem("accessToken");

    const body = {
      receptionId: data.receptionId,
      newStatus: "DONE"
    };

    apiCall(`${role?.toLowerCase()}/reception/update`, 'PUT', accessToken || "", JSON.stringify(body),
      (response: any) => {
        showMessage("Examination completed successfully!", "success");
        setIsCompleting(false);
        navigate(-1);
      },
      (error: any) => {
        showMessage(error.message || "Failed to complete examination", "error");
        setIsCompleting(false);
      }
    );
  };

  const handleConfirmSaveMedicalRecord = () => {
    setConfirmType('medical_record');
    setConfirmMessage('Are you sure you want to save this medical record?');
    setIsConfirmDialogOpen(true);
  }

  const handleSaveMedicalRecord = (updatedData: any) => {
    if (!id) return;

    const accessToken = localStorage.getItem("accessToken");
    const url = medicalRecordUpdate(parseInt(id));

    // orderedServices on backend is expected as a STRING ("id:qty,id:qty").
    // Only include it if it's provided as array or string; convert array to string.
    let orderedServicesString: string | null = null;
    if (Array.isArray(updatedData.orderedServices)) {
      orderedServicesString = updatedData.orderedServices
        .map((s: any) => `${s.serviceId}:${s.quantity}`)
        .join(',');
    } else if (typeof updatedData.orderedServices === 'string' && updatedData.orderedServices.trim() !== '') {
      orderedServicesString = updatedData.orderedServices;
    }

    const body: any = {
      examinateDate: updatedData.examinateDate,
      symptoms: updatedData.symptoms,
      diagnosis: updatedData.diagnosis,
      diseaseTypeId: updatedData.diseaseType?.diseaseTypeId || null,
      notes: updatedData.notes
    };

    if (orderedServicesString !== null) {
      body.orderedServices = orderedServicesString;
    }

    apiCall(url, 'PUT', accessToken || "", JSON.stringify(body),
      (response: any) => {
        showMessage("The medical record has been successfully saved!");
        setIsConfirmDialogOpen(false);
        setIsMedicalRecordEditing(false);
        // Refresh data
        setData(prev => prev ? { ...prev, ...updatedData } : null);
      },
      (error: any) => {
        showMessage(error.message || "Failed to save medical record", "error");
        setIsConfirmDialogOpen(false);
      }
    );
  }

  const handleConfirmSavePrescription = () => {
    setConfirmType('prescription');
    setConfirmMessage('Are you sure you want to save this prescription?');
    setIsConfirmDialogOpen(true);
  }

  const handleSavePrescription = (updatedPrescription: any) => {
    if (!id || !data) return;

    const accessToken = localStorage.getItem("accessToken");

    // Chuẩn bị dữ liệu prescription details, lọc bỏ những dòng chưa chọn thuốc
    const prescriptionDetails = updatedPrescription.prescriptionDetail
      .filter((detail: any) => detail.medicine?.medicineId !== null)
      .map((detail: any) => ({
        prescriptionId: updatedPrescription.prescriptionId || 0,
        medicineId: detail.medicine.medicineId,
        quantity: detail.quantity,
        dosage: detail.dosage,
        days: detail.days
      }));

    const body = {
      recordId: parseInt(id),
      notes: updatedPrescription.notes || "",
      prescriptionDetails: prescriptionDetails
    };

    // Kiểm tra xem prescription đã tồn tại chưa
    const isNewPrescription = !updatedPrescription.prescriptionId;
    const url = isNewPrescription
      ? prescriptionCreate
      : prescriptionUpdate(updatedPrescription.prescriptionId);

    apiCall(url, isNewPrescription ? 'POST' : 'PUT', accessToken || "", JSON.stringify(body),
      (response: any) => {
        showMessage("The prescription has been successfully saved!");
        setIsConfirmDialogOpen(false);
        setIsPrescriptionEditing(false);

        // Backend trả về Prescription entity (không có prescriptionDetail đầy đủ)
        // Cần reload toàn bộ medical record để lấy full data
        const reloadUrl = medicalRecordGetById(role?.toLowerCase() || "doctor", parseInt(id));
        apiCall(reloadUrl, 'GET', accessToken || "", null,
          (reloadResponse: any) => {
            const recordData = reloadResponse.data;
            setData(recordData);
            setMedicalRecordData(recordData);
            setPrescriptionData(recordData.prescription);
            setServiceData(recordData.orderedServices);
          },
          (error: any) => {
            console.error("Failed to reload medical record:", error);
            // Fallback: dùng response ban đầu
            const savedPrescription = response.data || null;
            setPrescriptionData(savedPrescription);
            setData(prev => prev ? { ...prev, prescription: savedPrescription } : null);
          }
        );
      },
      (error: any) => {
        showMessage(error.message || "Failed to save prescription", "error");
        setIsConfirmDialogOpen(false);
      }
    );
  }

  const handleConfirmSaveService = () => {
    setConfirmType('service');
    setConfirmMessage('Are you sure you want to save the service list?');
    setIsConfirmDialogOpen(true);
  }

  const handleSaveService = (updatedServices: any) => {
    if (!id) return;

    const accessToken = localStorage.getItem("accessToken");
    const url = medicalRecordUpdate(parseInt(id));

    // Chuyển đổi mảng services thành chuỗi "serviceId:quantity,serviceId:quantity"
    const orderedServicesString = updatedServices
      .map((s: any) => `${s.serviceId}:${s.quantity}`)
      .join(',');

    const body = {
      orderedServices: orderedServicesString
    };

    apiCall(url, 'PUT', accessToken || "", JSON.stringify(body),
      (response: any) => {
        showMessage("The service list has been successfully saved!");
        setIsConfirmDialogOpen(false);
        setIsServiceEditing(false);
        // Refresh service data
        setServiceData(updatedServices);
        setData(prev => prev ? { ...prev, orderedServices: updatedServices } : null);
      },
      (error: any) => {
        showMessage(error.message || "Failed to save service list", "error");
        setIsConfirmDialogOpen(false);
      }
    );
  }

  if (!data || loading) {
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
            {loading ? "Loading medical record..." : "Medical record not found"}
          </Typography>
          {!loading && (
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
          )}
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

        {role === "Doctor" && data.receptionStatus === "IN_EXAMINATION" && (
          <Button
            variant="contained"
            onClick={handleCompleteExamination}
            disabled={isCompleting}
            sx={{
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            {isCompleting ? "Completing..." : "Complete Examination"}
          </Button>
        )}
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
              onSaveData={setMedicalRecordData}
            />

            <Divider />

            <PrescriptionInformation
              initialData={data.prescription}
              isEditing={isPrescriptionEditing}
              setIsEditing={setIsPrescriptionEditing}
              onConfirmSave={handleConfirmSavePrescription}
              onSaveData={setPrescriptionData}
            />

            <Divider />

            <ServiceInformation
              initialData={data.orderedServices}
              isEditing={isServiceEditing}
              setIsEditing={setIsServiceEditing}
              onConfirmSave={handleConfirmSaveService}
              onSaveData={setServiceData}
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
          if (confirmType === 'medical_record' && medicalRecordData) {
            handleSaveMedicalRecord(medicalRecordData);
          } else if (confirmType === 'prescription' && prescriptionData) {
            handleSavePrescription(prescriptionData);
          } else if (confirmType === 'service' && serviceData) {
            handleSaveService(serviceData);
          }
        }}
      />
    </Box>
  );
}
