import { Autocomplete, Box, Button, TextField, Typography } from "@mui/material"
import type { DiseaseType, MedicalRecordDetail } from "./MedicalRecordDetail"
import dayjs from "dayjs"
import { useAuth } from "../../../../auth/AuthContext";
import { useEffect, useState } from "react";
import { Edit, Save } from "lucide-react";
import { apiCall } from "../../../../api/api";
import { diseaseTypesGetActive, diseaseTypesGetActiveByDoctor } from "../../../../api/urls";

export default function MedicalInformation({
  initialData,
  isEditing = false,
  setIsEditing,
  onConfirmSave,
  onSaveData,
}: {
  initialData: MedicalRecordDetail,
  isEditing: boolean,
  setIsEditing: (isEditing: boolean) => void,
  onConfirmSave: () => void,
  onSaveData: (data: any) => void,
}) {
  const { role } = useAuth();
  const [data, setData] = useState<MedicalRecordDetail>(initialData);
  const [diseaseTypes, setDiseaseTypes] = useState<DiseaseType[]>([]);

  useEffect(() => {
    if (role !== "Doctor") return;

    const accessToken = localStorage.getItem("accessToken");

    apiCall(diseaseTypesGetActiveByDoctor, "GET", accessToken || "", null,
      (response: any) => {
        setDiseaseTypes(response.data || []);
      },
      (error: any) => {
        console.error("Failed to load disease types:", error);
      }
    );
  }, []);

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleCancel = () => {
    setData(initialData)
    setIsEditing(false)
  };

  const handleSave = () => {
    // Truyền data về parent component trước khi mở confirm dialog
    onSaveData(data);
    onConfirmSave();
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
          Medical Information
        </Typography>

        {role === "Doctor" &&
          <Box sx={{
            display: "flex",
            gap: 3,
          }}>
            {isEditing &&
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
            }

            <Button
              variant="contained"
              sx={{
                textTransform: 'none',
                width: '120px',
                boxShadow: 'none',
                gap: 2,
              }}
              onClick={() => {
                isEditing
                  ? handleSave()
                  : setIsEditing(true)
              }}
            >
              {isEditing ? <Save size={16} /> : <Edit size={16} />}
              {isEditing ? "Save" : "Edit"}
            </Button>
          </Box>
        }
      </Box>

      <Box sx={{
        display: 'flex',
        gap: 3
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          flex: 1,
        }}>
          <Typography sx={{
            color: 'var(--color-text-secondary)'
          }}>
            Doctor
          </Typography>
          <TextField
            value={data.doctorName}
            fullWidth
            disabled
          />
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          flex: 1,
        }}>
          <Typography sx={{
            color: 'var(--color-text-secondary)'
          }}>
            Examination Date
          </Typography>
          <TextField
            value={dayjs(data.examinateDate).format("DD/MM/YYYY - hh:mm:ss")}
            fullWidth
            disabled
          />
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        flex: 1,
      }}>
        <Typography sx={{
          color: 'var(--color-text-secondary)'
        }}>
          Symptoms
        </Typography>
        <TextField
          value={data.symptoms}
          onChange={(e) => setData(prev => ({ ...prev, symptoms: e.target.value }))}
          placeholder="Symptoms"
          fullWidth
          disabled={!isEditing}
        />
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        flex: 1,
      }}>
        <Typography sx={{
          color: 'var(--color-text-secondary)'
        }}>
          Diagnosis
        </Typography>
        <TextField
          value={data.diagnosis}
          onChange={(e) => setData(prev => ({ ...prev, diagnosis: e.target.value }))}
          placeholder="Diagnosis"
          fullWidth
          disabled={!isEditing}
        />
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        flex: 1,
      }}>
        <Typography sx={{
          color: 'var(--color-text-secondary)'
        }}>
          Disease Type
        </Typography>

        {!isEditing ? (
          <TextField
            value={data.diseaseType ? `${data.diseaseType.diseaseName} - ${data.diseaseType.diseaseCode}` : ''}
            placeholder="Select disease type..."
            fullWidth
            disabled
          />
        ) : (
          <Autocomplete
            options={diseaseTypes}
            getOptionLabel={(option) => `${option.diseaseName} - ${option.diseaseCode}`}
            value={diseaseTypes.find(type => type.diseaseTypeId === data.diseaseType?.diseaseTypeId) || null}
            onChange={(_, newValue) => {
              setData(prev => ({ ...prev, diseaseType: newValue }))
            }}
            disabled={!isEditing}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select disease type..." />
            )}
          />
        )}
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        flex: 1,
      }}>
        <Typography sx={{
          color: 'var(--color-text-secondary)'
        }}>
          Notes
        </Typography>
        <TextField
          value={data.notes}
          onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes"
          fullWidth
          disabled={!isEditing}
        />
      </Box>
    </Box>
  )
}
