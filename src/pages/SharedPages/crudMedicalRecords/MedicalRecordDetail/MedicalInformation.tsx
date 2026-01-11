import { Autocomplete, Box, Button, TextField, Typography } from "@mui/material"
import type { DiseaseType, MedicalRecordDetail } from "./MedicalRecordDetail"
import dayjs from "dayjs"
import { useAuth } from "../../../../auth/AuthContext";
import { useState } from "react";
import { Edit, Save } from "lucide-react";

const fakeDiseaseTypes: DiseaseType[] = [
  {
    diseaseTypeId: 1,
    diseaseName: "Nhiễm trùng đường hô hấp trên cấp tính",
    diseaseCode: "J00",
  },
  {
    diseaseTypeId: 2,
    diseaseName: "Viêm họng cấp",
    diseaseCode: "J01",
  },
  {
    diseaseTypeId: 3,
    diseaseName: "Cúm mùa",
    diseaseCode: "J10",
  }
];

export default function MedicalInformation({
  initialData,
  isEditing = false,
  setIsEditing,
  onConfirmSave,

}: {
  initialData: MedicalRecordDetail,
  isEditing: boolean,
  setIsEditing: (isEditing: boolean) => void,
  onConfirmSave: () => void,
}) {
  const { role } = useAuth();
  const [data, setData] = useState<MedicalRecordDetail>(initialData);
  const [diseaseTypes, setDiseaseTypes] = useState<DiseaseType[]>(fakeDiseaseTypes);

  const handleCancel = () => {
    setData(initialData)
    setIsEditing(false)
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
                  ? onConfirmSave()
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
          placeholder="Symptoms"
          fullWidth
          disabled={false}
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
          placeholder="Diagnosis"
          fullWidth
          disabled={false}
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
          placeholder="Notes"
          fullWidth
          disabled={false}
        />
      </Box>
    </Box>
  )
}