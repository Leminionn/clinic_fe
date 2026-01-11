import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, TextField, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { ArrowBack } from "@mui/icons-material";
import type { CreateImportDetailUI, Medicine } from "../../../../types/MedicineImport";
import { Plus, Save } from "lucide-react";
import dayjs from "dayjs";
import ImportDetailTable from "./ImportDetailTable";

export default function CreateImport() {
  const navigate = useNavigate();
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const importer = { staffId: 1, fullName: "Nguyễn Văn An" }; //fake
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<CreateImportDetailUI[]>([]);
  const [notes, setNotes] = useState("");
  const [medicineList, setMedicineList] = useState<Medicine[]>([]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    apiCall("warehouse/medicines/all", "GET", accessToken ? accessToken : "", null, (data: any) => {
      setMedicineList(data.data);
    }, (data: any) => {
      showMessage(data.message);
    })

  }, []);

  // Thêm dòng thuốc mới
  const handleAddDetail = () => {
    const newDetail: CreateImportDetailUI = {
      rowId: new Date().toISOString(),
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

  const handleDetailChange = (rowId: string, field: keyof CreateImportDetailUI, value: any) => {
    setItems(prev => (prev.map(detail =>
      detail.rowId === rowId ? { ...detail, [field]: value } : detail
    )));
  };

  const handleConfirmSaveMedicineImport = () => {
    if (!supplier.trim()) {
      showMessage("Supplier not entered!", "error");
      return;
    } 
    if (items.some(item => item.quantity < 1 || item.importPrice < 0)){
      showMessage("Quantity and unit cost must not be negative!", "error");
      return;
    };
    if (items.some(item => !item.expiryDate)){
      showMessage("The expiration dates for some items have not been selected!", "error");
      return;
    };
    setConfirmMessage('Are you sure you want to save this medicine import?');
    setIsConfirmDialogOpen(true);
  }

  const handleSaveMedicineImport = () => {

    showMessage("The medicine import has been successfully saved!");

    setIsConfirmDialogOpen(false);
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
            onClick={() => { navigate(-1) }}
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
                {importer.fullName}
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
              <Typography fontSize={18} fontWeight="bold">
                {dayjs(new Date()).format("DD/MM/YYYY")}
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              gap: 2,
            }}>
              <Typography fontSize={18}>
                Supplier:
              </Typography>
              <TextField
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter supplier"
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
              Notes
            </Typography>
            <TextField
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              placeholder="Add any additional notes about this import order..."
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