import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { MedicineImportDetail } from "../../../../types/MedicineImport";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Edit } from "lucide-react";
import { ArrowBack } from "@mui/icons-material";
import MedicineImportDetailStatCards from "./StatCards";
import ImportItemsCard from "./ImportItemsCard";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { useAuth } from "../../../../auth/AuthContext";

interface ImportDetailItem {
  medicineId: number;
  medicineName: string;
  unit: string;
  quantity: number;
  quantityInStock: number;
  expiryDate: string;
  importPrice: number;
  editable: boolean;
  statusMessage: string;
}

interface ImportResponse {
  data: {
    importId: number;
    importDate: string;
    importerId: number;
    importerName: string;
    supplier: string;
    details: ImportDetailItem[];
    totalQuantity: number;
    totalValue: number;
    editable: boolean;
  };
}

export default function MedicineImportDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  
  const [data, setData] = useState<MedicineImportDetail>();
  const [loading, setLoading] = useState(true);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Xác định base URL theo role
  const getApiPrefix = () => {
    if (role === 'Admin') return 'admin';
    if (role === 'WarehouseStaff') return 'store_keeper';
    return 'api'; // fallback
  };

  const fetchImportData = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const apiPrefix = getApiPrefix();
    
    setLoading(true);
    apiCall(`${apiPrefix}/imports/${id}`, "GET", accessToken, null,
      (response: ImportResponse) => {
        const importData: MedicineImportDetail = {
          importId: response.data.importId,
          importDate: response.data.importDate,
          importer: {
            importerId: response.data.importerId,
            importerName: response.data.importerName,
          },
          supplier: response.data.supplier,
          importDetails: response.data.details.map((d) => ({
            medicine: {
              medicineId: d.medicineId,
              medicineName: d.medicineName,
              unit: d.unit,
            },
            quantity: d.quantity,
            quantityInStock: d.quantityInStock,
            expiryDate: d.expiryDate,
            importPrice: d.importPrice,
            editable: d.editable,
            statusMessage: d.statusMessage,
          })),
          totalQuantity: response.data.totalQuantity,
          totalValue: response.data.totalValue,
          editable: response.data.editable,
        };
        // Debug log - có thể xóa sau khi fix xong
        console.log('Import data:', importData);
        console.log('Import editable:', response.data.editable);
        console.log('Details editable:', response.data.details.map((d: { medicineId: number; editable: boolean; statusMessage: string }) => ({
          medicineId: d.medicineId,
          editable: d.editable,
          statusMessage: d.statusMessage
        })));
        setData(importData);
        setLoading(false);
      },
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to load import data", "error");
        setLoading(false);
        navigate(-1);
      }
    );
  };

  useEffect(() => {
    fetchImportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role]);

  const handleConfirmDelete = () => {
    setConfirmMessage('Are you sure you want to delete this medicine import?');
    setIsConfirmDialogOpen(true);
  }

  const handleDelete = () => {
    const accessToken = localStorage.getItem("accessToken");
    const apiPrefix = getApiPrefix();
    
    apiCall(`${apiPrefix}/imports/${id}`, "DELETE", accessToken, null,
      () => {
        showMessage("Deleted successfully!");
        setIsConfirmDialogOpen(false);
        navigate("..");
      },
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to delete import", "error");
        setIsConfirmDialogOpen(false);
      }
    );
  }

  if (loading) return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 2,
        height: "100%",
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

        {/* Admin luôn thấy nút Edit, WarehouseStaff chỉ thấy khi editable */}
        {/* Nút Delete chỉ hiển thị khi tất cả items đều chưa bán (all editable) */}
        {(role === 'Admin' || data.editable) && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                width: "140px",
                textTransform: 'none',
                gap: 2,
                boxShadow: 'none',
              }}
              onClick={() => { navigate("edit") }}
            >
              <Edit size={18} />
              Edit Import
            </Button>
            {/* Chỉ hiện nút Delete khi tất cả items đều editable (chưa bán) */}
            {data.importDetails?.every(item => item.editable !== false) && (
              <Button
                variant="contained"
                sx={{
                  width: "140px",
                  bgcolor: "var(--color-text-error)",
                  textTransform: 'none',
                  gap: 2,
                  boxShadow: 'none',
                }}
                onClick={() => { handleConfirmDelete() }}
              >
                Delete Import
              </Button>
            )}
          </Box>
        )}
      </Box>

      <MedicineImportDetailStatCards data={data} />

      <Box flex={1}>
        <ImportItemsCard data={data} />
      </Box>

      <AlertDialog
        title={confirmMessage}
        type={"error"}
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="Cancel"
        buttonConfirm="Yes"
        onConfirm={() => {
          handleDelete()
        }}
      />
    </Box>
  )
}