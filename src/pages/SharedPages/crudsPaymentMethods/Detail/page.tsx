import { useEffect, useState } from "react";
import { Box, Button, Card, IconButton, Typography } from "@mui/material";
import AlertDialog from "../../../../components/AlertDialog";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { paymentMethodsGetById, paymentMethodsDelete } from "../../../../api/urls";

interface PaymentMethod {
  paymentMethodId: number;
  methodCode: string;
  methodName: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

export default function PaymentMethodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("accessToken");
    apiCall(
      paymentMethodsGetById(Number(id)),
      "GET",
      token,
      null,
      (res: any) => {
        setData(res.data || null);
        setLoading(false);
      },
      (err: any) => {
        console.error(err);
        setLoading(false);
        showMessage("Failed to load payment method", "error");
      }
    );
  }, [id]);

  const handleConfirmDelete = () => {
    setConfirmMessage("Are you sure you want to delete this payment method?");
    setIsConfirmDialogOpen(true);
  };

  const handleDelete = () => {
    const token = localStorage.getItem("accessToken");
    apiCall(
      paymentMethodsDelete(Number(id)),
      "DELETE",
      token,
      null,
      () => {
        showMessage("Payment method deleted successfully!");
        setIsConfirmDialogOpen(false);
        navigate(-1);
      },
      (err: any) => {
        console.error(err);
        showMessage(err?.message || "Failed to delete payment method", "error");
      }
    );
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={4}>
        <Typography>Payment method not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to list
        </Button>
      </Box>
    );
  }

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
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate(-1)}>
            <ChevronLeft />
          </IconButton>
          <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
            Payment Methods
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "6px 40px",
            }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`../update/${id}`)}
            sx={{
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "6px 40px",
            }}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Payment Method Information */}
      <Box display="flex" p="6px">
        <Card
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "30px 40px",
            gap: 2,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: "bold", mb: 2 }}>
            Payment Method Information
          </Typography>

          <Box display="flex" gap={5}>
            <Box flex={1}>
              <Typography color="text.secondary" fontSize={14}>
                Method Code
              </Typography>
              <Typography fontSize={16} fontWeight="500">
                {data.methodCode}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography color="text.secondary" fontSize={14}>
                Method Name
              </Typography>
              <Typography fontSize={16} fontWeight="500">
                {data.methodName}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={5}>
            <Box flex={1}>
              <Typography color="text.secondary" fontSize={14}>
                Sort Order
              </Typography>
              <Typography fontSize={16} fontWeight="500">
                {data.sortOrder}
              </Typography>
            </Box>

            <Box flex={1}>
              <Typography color="text.secondary" fontSize={14}>
                Status
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  borderRadius: 1,
                  padding: "2px 12px",
                  mt: 0.5,
                  color: data.active
                    ? "var(--color-text-success)"
                    : "var(--color-text-error)",
                  bgcolor: data.active
                    ? "var(--color-bg-success)"
                    : "var(--color-bg-error)",
                }}
              >
                {data.active ? "Active" : "Inactive"}
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography color="text.secondary" fontSize={14}>
              Description
            </Typography>
            <Typography fontSize={16} fontWeight="500">
              {data.description || "-"}
            </Typography>
          </Box>
        </Card>
      </Box>

      <AlertDialog
        title={confirmMessage}
        type="error"
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="Cancel"
        buttonConfirm="Yes"
        onConfirm={handleDelete}
      />
    </Box>
  );
}
