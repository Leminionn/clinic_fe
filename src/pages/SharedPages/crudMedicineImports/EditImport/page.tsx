import { useEffect, useState } from "react";
import { Box, Button, Card, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { useNavigate, useParams } from "react-router-dom";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { ArrowBack } from "@mui/icons-material";
import type { CreateUpdateImportDetailUI, Medicine, MedicineImportDetail, ImportItem } from "../../../../types/MedicineImport";
import { Plus, Save } from "lucide-react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import ImportDetailTable from "./ImportDetailTable";
import { useAuth } from "../../../../auth/AuthContext";

// Interface for API response
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

// Hàm chuyển đổi dữ liệu từ API response sang UI format
const normalizeImportDetails = (details: ImportItem[]): CreateUpdateImportDetailUI[] => {
  return details.map(item => ({
    rowId: uuidv4(),
    medicineId: item.medicine.medicineId,
    quantity: item.quantity,
    expiryDate: item.expiryDate,
    importPrice: item.importPrice,
    editable: item.editable ?? true, // Mặc định true nếu không có
    statusMessage: item.statusMessage ?? "",
    quantityInStock: item.quantityInStock ?? item.quantity,
  }));
};

export default function EditImport() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();

  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [initialData, setInitialData] = useState<MedicineImportDetail>();
  const [importDate, setImportDate] = useState(new Date().toISOString());
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<CreateUpdateImportDetailUI[]>([]);
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);

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
        setInitialData(importData);
        setImportDate(importData.importDate);
        setSupplier(importData.supplier || "");
        setItems(normalizeImportDetails(importData.importDetails || []));
        setLoading(false);
      },
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to load import data", "error");
        setLoading(false);
        navigate(-1);
      }
    );
  };

  const fetchMedicineList = async () => {
    const accessToken = localStorage.getItem("accessToken");
    apiCall("warehouse/medicines/all", "GET", accessToken, null, 
      (response: { data: Medicine[] }) => {
        setMedicineList(response.data);
      }, 
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to load medicine list", "error");
      }
    );
  };

  useEffect(() => {
    fetchImportData();
    fetchMedicineList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, role]);

  // Thêm dòng thuốc mới - mặc định ngày hết hạn là 6 tháng sau
  const handleAddDetail = () => {
    const defaultExpiryDate = dayjs().add(6, 'month').toISOString();
    const newDetail: CreateUpdateImportDetailUI = {
      rowId: uuidv4(),
      medicineId: null,
      quantity: 1,
      importPrice: 0,
      expiryDate: defaultExpiryDate,
      editable: true, // Dòng mới luôn editable
      statusMessage: "Có thể sửa/xóa",
    };
    setItems(prev => ([...prev, newDetail]));
  };

  // Xóa dòng thuốc (chỉ cho phép nếu editable)
  const handleRemoveDetail = (rowId: string) => {
    const itemToRemove = items.find(d => d.rowId === rowId);
    if (itemToRemove && itemToRemove.editable === false) {
      showMessage("Không thể xóa thuốc này vì đã bán!", "error");
      return;
    }
    setItems(prev => (prev?.filter(d => d.rowId !== rowId)));
  };

  const handleDetailChange = (rowId: string, field: keyof CreateUpdateImportDetailUI, value: any) => {
    const itemToChange = items.find(d => d.rowId === rowId);
    // Chỉ cho phép thay đổi nếu item editable
    if (itemToChange && itemToChange.editable === false) {
      showMessage("Không thể sửa thuốc này vì đã bán!", "error");
      return;
    }
    setItems(prev => (prev.map(detail =>
      detail.rowId === rowId ? { ...detail, [field]: value } : detail
    )));
  };

  const handleConfirmSaveMedicineImport = () => {
    if (!importDate) {
      showMessage("Import date not entered!", "error");
      return;
    }
    if (!supplier.trim()) {
      showMessage("Supplier not entered!", "error");
      return;
    }
    // Chỉ validate các item editable
    const editableItems = items.filter(item => item.editable !== false);
    if (editableItems.some(item => !item.medicineId)) {
      showMessage("The medicine type for some items have not been selected!", "error");
      return;
    };
    if (editableItems.some(item => item.quantity < 1 || item.importPrice < 0)) {
      showMessage("Quantity and unit cost must not be negative!", "error");
      return;
    };
    if (editableItems.some(item => !item.expiryDate)) {
      showMessage("The expiration dates for some items have not been selected!", "error");
      return;
    };

    setConfirmMessage('Are you sure you want to save this medicine import?');
    setIsConfirmDialogOpen(true);
  }

  const handleSaveMedicineImport = () => {
    const accessToken = localStorage.getItem("accessToken");
    const apiPrefix = getApiPrefix();
    
    const payload = {
      importDate: new Date(importDate).toISOString().split('T')[0],
      supplier: supplier,
      details: items.map(({ rowId, editable, statusMessage, quantityInStock, ...rest }) => rest),
    };

    apiCall(`${apiPrefix}/imports/${id}`, "PUT", accessToken, JSON.stringify(payload),
      () => {
        showMessage("The medicine import has been successfully saved!");
        setIsConfirmDialogOpen(false);
        navigate(`../${id}`);
      },
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to save medicine import", "error");
        setIsConfirmDialogOpen(false);
      }
    );
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.importPrice * item.quantity, 0);

  if (loading) {
    return (
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (initialData) return (
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
          <Typography variant="h5" fontWeight="bold">
            Edit Import #{initialData.importId}
          </Typography>
        </Box>

        {/* Chỉ ẩn nút Save khi WarehouseStaff và import đã quá 3 ngày */}
        {(role === 'Admin' || initialData.editable !== false) && (
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
        )}
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
                {initialData.importer.importerName}
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
              {/* Chỉ ẩn nút Add Item khi WarehouseStaff và import đã quá 3 ngày */}
              {(role === 'Admin' || initialData.editable !== false) && (
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
              )}
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