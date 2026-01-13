import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, TextField, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { ArrowBack } from "@mui/icons-material";
import type { CreateUpdateImportDetailUI, Medicine } from "../../../../types/MedicineImport";
import { Plus, Save } from "lucide-react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import ImportDetailTable from "./ImportDetailTable";
import { useAuth } from "../../../../auth/AuthContext";

// Payload interface for creating import (importerId is handled by backend from auth token)
interface CreateImportPayload {
  importDate: string;
  supplier: string;
  details: Array<{
    medicineId: number | null;
    quantity: number;
    importPrice: number;
    expiryDate: string;
  }>;
}

export default function CreateImport() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Lấy thông tin importer - backend sẽ tự động lấy từ token
  // Hiển thị username đã lưu trong localStorage
  const importerName = localStorage.getItem("username") ?? "Current User";

  // Xác định base URL theo role
  const getApiPrefix = () => {
    if (role === 'Admin') return 'admin';
    if (role === 'WarehouseStaff') return 'store_keeper';
    return 'api'; // fallback
  };

  const [importDate, setImportDate] = useState(new Date().toISOString());
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<CreateUpdateImportDetailUI[]>([]);
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    apiCall("warehouse/medicines/all", "GET", accessToken ? accessToken : "", null, 
      (response: { data: Medicine[] }) => {
        setMedicineList(response.data);
      }, 
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to load medicines", "error");
      }
    );

  }, []);

  // Thêm dòng thuốc mới - mặc định ngày hết hạn là 6 tháng sau
  const handleAddDetail = () => {
    const defaultExpiryDate = dayjs().add(6, 'month').toISOString();
    const newDetail: CreateUpdateImportDetailUI = {
      rowId: uuidv4(),
      medicineId: null,
      quantity: 1,
      importPrice: 0,
      expiryDate: defaultExpiryDate,
    };
    setItems(prev => ([...prev, newDetail]));
  };

  // Xóa dòng thuốc
  const handleRemoveDetail = (rowId: string) => {
    setItems(prev => (prev?.filter(d => d.rowId !== rowId)));
  };

  const handleDetailChange = (rowId: string, field: keyof CreateUpdateImportDetailUI, value: any) => {
    setItems(prev => (prev.map(detail =>
      detail.rowId === rowId ? { ...detail, [field]: value } : detail
    )));
  };

  const handleConfirmSaveMedicineImport = () => {
    if (!importDate.trim()) {
      showMessage("Import date not entered!", "error");
      return;
    }
    if (!supplier.trim()) {
      showMessage("Supplier not entered!", "error");
      return;
    }
    if (items.some(item => !item.medicineId)) {
      showMessage("The medicine type for some items have not been selected!", "error");
      return;
    };
    if (items.some(item => item.quantity < 1)) {
      showMessage("Quantity must be at least 1!", "error");
      return;
    };
    if (items.some(item => item.importPrice <= 0)) {
      showMessage("Unit cost must be greater than 0!", "error");
      return;
    };
    if (items.some(item => !item.expiryDate)) {
      showMessage("The expiration dates for some items have not been selected!", "error");
      return;
    };

    setConfirmMessage('Are you sure you want to save this medicine import?');
    setIsConfirmDialogOpen(true);
  }

  const handleSaveMedicineImport = () => {
    const accessToken = localStorage.getItem("accessToken");
    const apiPrefix = getApiPrefix();
    
    // Backend will get importerId from the authenticated token
    const payload: CreateImportPayload = {
      importDate: new Date(importDate).toISOString().split('T')[0], // Backend expects Date format
      supplier: supplier,
      details: items.map(({ rowId, ...rest }) => ({
        medicineId: rest.medicineId,
        quantity: rest.quantity,
        importPrice: rest.importPrice,
        expiryDate: rest.expiryDate,
      })),
    }

    apiCall(`${apiPrefix}/imports`, "POST", accessToken, JSON.stringify(payload),
      (response: { data?: { importId?: number } }) => {
        showMessage("The medicine import has been successfully saved!");
        setIsConfirmDialogOpen(false);
        // Navigate to the created import detail page
        const createdImportId = response.data?.importId;
        if (createdImportId) {
          navigate(`../${createdImportId}`);
        } else {
          navigate('..');
        }
      },
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to create import", "error");
        setIsConfirmDialogOpen(false);
      }
    );
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.importPrice * item.quantity, 0);

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
            onClick={() => { navigate("..") }}
            sx={{ mr: 2, textTransform: 'none', color: 'text.secondary' }}
          >
            Back
          </Button>
          <Typography variant="h5" fontWeight="bold">
            New Import
          </Typography>
        </Box>

        <Button
          variant="contained"
          sx={{
            textTransform: 'none',
            gap: 2,
            boxShadow: 'none',
          }}
          disabled={items.length === 0}
          onClick={handleConfirmSaveMedicineImport}
        >
          <Save size={18} />
          Save Import
        </Button>
      </Box>

      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}>
        <Box sx={{
          display: "flex",
          gap: 3,
        }}>
          <Card sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: 1,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
              Import Information
            </Typography>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1
            }}>
              <Typography fontSize={18}>
                Importer:
              </Typography>
              <Typography fontSize={18} fontWeight="bold">
                {importerName}
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2
            }}>
              <Typography fontSize={18}>
                Import Date:
              </Typography>
              <TextField
                type="date"
                value={dayjs(importDate).format("YYYY-MM-DD")}
                onChange={(e) => setImportDate(e.target.value)}
                inputProps={{ max: dayjs().format("YYYY-MM-DD") }}
                sx={{ minWidth: 180 }}
              />
            </Box>
          </Card>

          <Card sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: 3,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
              Supplier
            </Typography>
            <TextField
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              placeholder="Enter supplier"
            />
          </Card>
        </Box>

        <Box flex={1}>
          <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: 3,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
                Import Items
              </Typography>
              <Button
                variant="contained"
                sx={{
                  textTransform: 'none',
                  gap: 2,
                  boxShadow: 'none',
                }}
                onClick={handleAddDetail}
              >
                <Plus size={18} />
                Add Item
              </Button>
            </Box>

            <ImportDetailTable
              data={items}
              medicineList={medicineList}
              onDetailChange={handleDetailChange}
              onRemoveDetail={handleRemoveDetail}
            />

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'flex-end',
              mt: 1,
              gap: 1.2,
            }}>
              <Box sx={{
                display: 'flex',
                width: '300px',
                justifyContent: 'space-between',

              }}>
                <Typography>
                  Total Medicine Updated:
                </Typography>
                <Typography>
                  {items.length}
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                width: '300px',
                justifyContent: 'space-between',
                mb: 1,
              }}>
                <Typography>
                  Total Items Imported:
                </Typography>
                <Typography>
                  {totalItems}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{
                display: 'flex',
                width: '300px',
                justifyContent: 'space-between',
                mt: 1,
              }}>
                <Typography fontWeight='bold' fontSize={18}>
                  Total Cost
                </Typography>
                <Typography fontWeight='bold' fontSize={18}>
                  {totalValue.toLocaleString()} đ
                </Typography>
              </Box>
            </Box>
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
          handleSaveMedicineImport()
        }}
      />
    </Box>
  );
}