import { useEffect, useState } from "react";
import { Box, Button, Card, FormControlLabel, IconButton, Switch, TextField, Typography } from "@mui/material";
import { ChevronLeft } from "lucide-react";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { useNavigate, useParams } from "react-router-dom";
import { apiCall } from "../../../../api/api";
import { paymentMethodsCreate, paymentMethodsUpdate, paymentMethodsGetById } from "../../../../api/urls";

interface PaymentMethodForm {
  methodCode: string;
  methodName: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

const emptyForm: PaymentMethodForm = {
  methodCode: "",
  methodName: "",
  description: "",
  sortOrder: 0,
  active: true,
};

export default function CreateUpdatePaymentMethod() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<PaymentMethodForm>(emptyForm);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      // Fetch payment method data
      const token = localStorage.getItem("accessToken");
      apiCall(
        paymentMethodsGetById(Number(id)),
        "GET",
        token,
        null,
        (res: any) => {
          const pm = res.data;
          if (pm) {
            setData({
              methodCode: pm.methodCode || "",
              methodName: pm.methodName || "",
              description: pm.description || "",
              sortOrder: pm.sortOrder || 0,
              active: pm.active ?? true,
            });
          }
        },
        (err: any) => {
          console.error(err);
          showMessage("Failed to load payment method", "error");
        }
      );
    } else {
      setData(emptyForm);
      setIsEditMode(false);
    }
  }, [id]);

  const handleConfirm = () => {
    if (!data.methodCode.trim() || !data.methodName.trim()) {
      showMessage("Please fill in required fields (Code and Name)", "error");
      return;
    }
    setConfirmMessage(
      `Are you sure you want to ${isEditMode ? "update" : "add"} this payment method?`
    );
    setIsConfirmDialogOpen(true);
  };

  const handleSubmit = () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const payload = {
      methodCode: data.methodCode,
      methodName: data.methodName,
      description: data.description,
      sortOrder: data.sortOrder,
      isActive: data.active,
    };

    if (isEditMode && id) {
      apiCall(
        paymentMethodsUpdate(Number(id)),
        "PUT",
        token,
        JSON.stringify(payload),
        () => {
          setLoading(false);
          showMessage("Payment method updated successfully!");
          setIsConfirmDialogOpen(false);
          navigate(`../detail/${id}`);
        },
        (err: any) => {
          setLoading(false);
          console.error(err);
          showMessage(err?.message || "Failed to update payment method", "error");
        }
      );
    } else {
      apiCall(
        paymentMethodsCreate,
        "POST",
        token,
        JSON.stringify(payload),
        (res: any) => {
          setLoading(false);
          showMessage("Payment method added successfully!");
          setIsConfirmDialogOpen(false);
          const newId = res.data?.paymentMethodId;
          if (newId) {
            navigate(`../detail/${newId}`);
          } else {
            navigate("..");
          }
        },
        (err: any) => {
          setLoading(false);
          console.error(err);
          showMessage(err?.message || "Failed to create payment method", "error");
        }
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "26px 50px",
        gap: 3,
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* Header with back button */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => navigate("..")}>  
          <ChevronLeft />
        </IconButton>
        <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
          Payment Methods
        </Typography>
      </Box>

      <Box flex={1} p="6px">
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "30px 40px",
            gap: 1,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: "bold", mb: 2 }}>
            {isEditMode ? "Update Payment Method" : "Add New Payment Method"}
          </Typography>

          <Box m={1} display="flex" gap={5}>
            <Box flex={1}>
              <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                Method Code <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                value={data.methodCode}
                onChange={(e) => setData({ ...data, methodCode: e.target.value })}
                fullWidth
                placeholder="e.g., CASH, CARD, TRANSFER"
              />
            </Box>

            <Box flex={1}>
              <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                Method Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                value={data.methodName}
                onChange={(e) => setData({ ...data, methodName: e.target.value })}
                fullWidth
                placeholder="e.g., Cash Payment"
              />
            </Box>
          </Box>

          <Box m={1} display="flex" gap={5}>
            <Box flex={1}>
              <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                Sort Order
              </Typography>
              <TextField
                value={data.sortOrder}
                onChange={(e) => setData({ ...data, sortOrder: Number(e.target.value) })}
                fullWidth
                type="number"
              />
            </Box>

            <Box flex={1} display="flex" alignItems="center" pt={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.active}
                    onChange={(_, v) => setData({ ...data, active: v })}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>

          <Box m={1}>
            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
              Description
            </Typography>
            <TextField
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter description..."
            />
          </Box>

          <Box display="flex" justifyContent="center" gap={2} mt={5}>
            <Button
              variant="outlined"
              onClick={() => navigate("..")}
              sx={{
                textTransform: "none",
                fontSize: "16px",
                fontWeight: "bold",
                padding: "8px 40px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={loading}
              sx={{
                textTransform: "none",
                fontSize: "16px",
                fontWeight: "bold",
                padding: "8px 40px",
              }}
            >
              {loading ? "Saving..." : isEditMode ? "Save" : "Add Payment Method"}
            </Button>
          </Box>
        </Card>
      </Box>

      <AlertDialog
        title={confirmMessage}
        type="info"
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="Cancel"
        buttonConfirm="Yes"
        onConfirm={handleSubmit}
      />
    </Box>
  );
}
