import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, TextField, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { useNavigate, useParams } from "react-router-dom";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { ArrowBack } from "@mui/icons-material";
import type { CreateUpdateImportDetail, CreateUpdateImportDetailUI, Medicine, UpdateMedicineImport } from "../../../../types/MedicineImport";
import { Plus, Save } from "lucide-react";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import ImportDetailTable from "./ImportDetailTable";

const mockMedicineImport: UpdateMedicineImport = {
  importId: 1001,
  importDate: "2026-01-10T08:45:00.000Z",
  importer: {
    importerId: 3,
    importerName: "Nguyen Thi Lan",
  },
  supplier: "Công ty Dược phẩm Minh Long",
  importDetails: [
    {
      medicineId: 1,
      quantity: 50,
      expiryDate: "2027-06-30T00:00:00.000Z",
      importPrice: 18000,
    },
    {
      medicineId: 1,
      quantity: 30,
      expiryDate: "2028-01-15T00:00:00.000Z",
      importPrice: 17500,
    },
    {
      medicineId: 3,
      quantity: 200,
      expiryDate: "2027-03-20T00:00:00.000Z",
      importPrice: 2200,
    },
    {
      medicineId: 5,
      quantity: 40,
      expiryDate: "2028-09-01T00:00:00.000Z",
      importPrice: 35000,
    },
  ],
};

// hàm thêm row id cho import details get về để hiện thị UI table không bị lỗi
const normalizeImportDetails = (details: CreateUpdateImportDetail[]) => {
  return details.map(item => ({
    ...item,
    rowId: uuidv4()
  }));
};

export default function EditImport() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [initialData, setInitialData] = useState<UpdateMedicineImport>();
  const [importDate, setImportDate] = useState(new Date().toISOString());
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<CreateUpdateImportDetailUI[]>([]);
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);

  const fetchImportData = async () => {
    //logic get import data         //fake
    setInitialData(mockMedicineImport);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    fetchImportData();
    if (!initialData) return;

    apiCall("warehouse/medicines/all", "GET", accessToken ? accessToken : "", null, (data: any) => {
      setMedicineList(data.data);
    }, (data: any) => {
      showMessage(data.message);
    })

    console.log(importDate)
  }, []);

  useEffect(() => {
    if (!initialData) return;
    setSupplier(initialData.supplier || "");
    setItems(normalizeImportDetails(initialData.importDetails || []));

  }, [initialData]);

  // Thêm dòng thuốc mới
  const handleAddDetail = () => {
    const newDetail: CreateUpdateImportDetailUI = {
      rowId: uuidv4(),
      medicineId: null,
      quantity: 1,
      importPrice: 0,
      expiryDate: new Date().toISOString(),
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
    if (items.some(item => item.quantity < 1 || item.importPrice < 0)) {
      showMessage("Quantity and unit cost must not be negative!", "error");
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
    const payload = {
      importDate: new Date(importDate).toISOString(),
      supplier: supplier,
      importDetails: items.map(({ rowId, ...rest }) => rest),
    }

    //logic save

    showMessage("The medicine import has been successfully saved!");

    setIsConfirmDialogOpen(false);
    navigate(`../${id}`);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.importPrice * item.quantity, 0);

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