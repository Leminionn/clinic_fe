import { Autocomplete, Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { type Medicine, type PrescriptionDetail } from "./MedicalRecordDetail"
import { useEffect, useState } from "react"
import { DeleteOutline } from "@mui/icons-material";
import { Edit, Plus, Save } from "lucide-react";
import { apiCall } from "../../../../api/api";
import { useAuth } from "../../../../auth/AuthContext";
import { showMessage } from "../../../../components/ActionResultMessage";
import { doctorGetMedicines, adminGetMedicines } from "../../../../api/urls";

const NullPrescription: PrescriptionRequest = {
  notes: "",
  prescriptionDetail: []
}

interface PrescriptionRequest {
  notes: string;
  prescriptionDetail: PrescriptionDetail[]
}

export default function PrescriptionInformation({
  initialData,
  isEditing = false,
  setIsEditing,
  onConfirmSave,
  onSaveData,
}: {
  initialData: PrescriptionRequest | null,
  isEditing: boolean,
  setIsEditing: (isEditing: boolean) => void,
  onConfirmSave: () => void,
  onSaveData: (data: any) => void,
}) {
  const { role } = useAuth();
  const [data, setData] = useState<PrescriptionRequest>(initialData || NullPrescription);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Update data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      // Khi prescription bị xóa hết hoặc null, reset về NullPrescription
      setData(NullPrescription);
    }
  }, [initialData]);

  const handleSave = () => {
    onSaveData(data);
    onConfirmSave();
  };

  useEffect(() => {
    if (role !== "Doctor") return;

    const accessToken = localStorage.getItem("accessToken");

    apiCall(doctorGetMedicines, "GET", accessToken ? accessToken : "", null, (data: any) => {
      setMedicines(data.data);
    }, (data: any) => {
      showMessage(data.message);
    })

  }, []);

  // Thêm dòng thuốc mới
  const handleAddDetail = () => {
    const newDetail: PrescriptionDetail = {
      medicine: {
        medicineId: null,
        medicineName: "",
        unit: "",
      },
      quantity: 1,
      dosage: '',
      days: 1
    };
    setData(prev => ({
      ...prev,
      prescriptionDetail: [...prev.prescriptionDetail, newDetail]
    }));
  };

  // Xóa dòng thuốc theo index (an toàn khi medicine có null)
  const handleRemoveDetail = (index: number) => {
    setData(prev => ({
      ...prev,
      prescriptionDetail: prev.prescriptionDetail.filter((_, i) => i !== index)
    }));
  };

  // Thay đổi thông tin trong dòng thuốc theo index
  const handleDetailChange = (index: number, field: keyof PrescriptionDetail, value: any) => {
    setData(prev => ({
      ...prev,
      prescriptionDetail: prev.prescriptionDetail.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      )
    }));
  };

  const handleCancel = () => {
    setData(initialData || NullPrescription)
    setIsEditing(false)
  };

  if (data) return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
          Prescription
        </Typography>

        {role === "Doctor" &&
          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              minWidth: '120px',
              boxShadow: 'none',
              gap: 2,
            }}
            onClick={() => {
              isEditing
                ? handleAddDetail()
                : setIsEditing(true)
            }}
          >
            {isEditing ? <Plus size={16} /> : <Edit size={16} />}
            {isEditing ? "Add medicine" : "Edit"}
          </Button>
        }
      </Box>

      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table sx={{ minWidth: 700 }} size="small">
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Medicine Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Dosage</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.prescriptionDetail.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  {role === "Doctor" ? 'No medicine, press "Add medicine" to add' : 'No medicine'}
                </TableCell>
              </TableRow>
            ) : (
              data.prescriptionDetail.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>

                  <TableCell width="30%">
                    {!isEditing ? (
                      <TextField
                        value={row.medicine?.medicineName ? `${row.medicine.medicineName}${row.medicine.unit ? ` (${row.medicine.unit.toLowerCase()})` : ''}` : ''}
                        size="small"
                        variant="standard"
                        disabled
                        fullWidth
                      />
                    ) : (
                      <Autocomplete
                        options={medicines}
                        getOptionDisabled={(option) =>
                          data.prescriptionDetail
                            .map(detail => detail.medicine?.medicineId)
                            .includes(option.medicineId)
                        }
                        getOptionLabel={(option) => {
                          if (!option || !option.medicineName) return '';
                          return `${option.medicineName}${option.unit ? ` (${option.unit.toLowerCase()})` : ''}`;
                        }}
                        value={medicines.find(m => m.medicineId === row.medicine?.medicineId) || null}
                        onChange={(_, newValue) => {
                          if (newValue) {
                            handleDetailChange(index, 'medicine', newValue);
                          } else {
                            // Khi xóa thuốc, set lại thành null object để giữ row
                            handleDetailChange(index, 'medicine', { medicineId: null, medicineName: '', unit: '' });
                          }
                        }}
                        disabled={!isEditing}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select medicine..." size="small" variant="standard" />
                        )}
                      />
                    )}
                  </TableCell>

                  <TableCell width="10%">
                    <TextField
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      size="small"
                      variant="standard"
                      disabled={!isEditing}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>

                  <TableCell width="10%">{row.medicine?.unit ? row.medicine.unit.toLowerCase() : ''}</TableCell>

                  <TableCell width="10%">
                    <TextField
                      type="number"
                      value={row.days}
                      onChange={(e) => handleDetailChange(index, 'days', parseInt(e.target.value) || 0)}
                      size="small"
                      variant="standard"
                      disabled={!isEditing}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      value={row.dosage}
                      onChange={(e) => handleDetailChange(index, 'dosage', e.target.value)}
                      size="small"
                      variant="standard"
                      disabled={!isEditing}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      color="error"
                      size="small"
                      disabled={!isEditing}
                      onClick={() => handleRemoveDetail(index)}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TextField
        value={data.notes}
        onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
        label="Notes"
        disabled={!isEditing}
        sx={{
          mt: 2
        }}
      />

      {isEditing && role === "Doctor" &&
        <Box sx={{
          display: "flex",
          gap: 3,
          alignSelf: 'flex-end',
        }}>
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              width: '120px',
              boxShadow: 'none'
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              width: '120px',
              boxShadow: 'none',
              gap: 2,
            }}
            onClick={handleSave}
          >
            <Save size={16} />
            Save
          </Button>
        </Box>
      }
    </Box>
  )
}
