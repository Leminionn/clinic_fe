import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { MedicineImportDetail } from "../../../../types/MedicineImport";
import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { Edit } from "lucide-react";
import { ArrowBack } from "@mui/icons-material";
import MedicineImportDetailStatCards from "./StatCards";
import ImportItemsCard from "./ImportItemsCard";

const mockMedicineImport: MedicineImportDetail = {
  importId: 1001,
  importDate: "2026-01-10T08:45:00.000Z",
  importer: {
    importerId: 3,
    importerName: "Nguyen Thi Lan",
  },
  supplier: "Công ty Dược phẩm Minh Long",
  importDetails: [
    {
      medicine: {
        medicineId: 1,
        medicineName: "Paracetamol 500mg",
        unit: "TABLET",
      },
      quantity: 50,
      expiryDate: "2027-06-30T00:00:00.000Z",
      importPrice: 18000,
    },
    {
      medicine: {
        medicineId: 1,
        medicineName: "Paracetamol 500mg",
        unit: "TABLET",
      },
      quantity: 30,
      expiryDate: "2028-01-15T00:00:00.000Z",
      importPrice: 17500,
    },
    {
      medicine: {
        medicineId: 3,
        medicineName: "Amoxicillin 500mg",
        unit: "BLISTER",
      },
      quantity: 200,
      expiryDate: "2027-03-20T00:00:00.000Z",
      importPrice: 2200,
    },
    {
      medicine: {
        medicineId: 5,
        medicineName: "Vitamin C 500mg",
        unit: "BLISTER",
      },
      quantity: 40,
      expiryDate: "2028-09-01T00:00:00.000Z",
      importPrice: 35000,
    },
  ],
  totalQuantity: 320,
  totalValue: 50 * 18000 + 30 * 17500 + 200 * 2200 + 40 * 35000,
  editable: true
};

export default function MedicineImportDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MedicineImportDetail>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(mockMedicineImport)
  }, []);

  if (loading) return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 2,
      }}
    >
      <CircularProgress size={24} />
    </Box>
  )

  if (data) return (
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
          <Button
            startIcon={<ArrowBack />}
            onClick={() => { navigate(-1) }}
            sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Medicine Import #{data.importId}
          </Typography>
        </Box>

        {data.editable &&
          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              gap: 2,
              boxShadow: 'none',
            }}
            disabled={!data.editable}
            //onClick={() => { navigate("edit") }}
          >
            <Edit size={18} />
            Edit Import
          </Button>
        }
      </Box>

      <MedicineImportDetailStatCards data={data} />

      <Box flex={1}>
        <ImportItemsCard data={data} />
      </Box>

    </Box>
  )
}