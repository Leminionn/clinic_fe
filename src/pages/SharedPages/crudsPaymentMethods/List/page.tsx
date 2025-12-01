import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { Search } from "lucide-react";
import { Add } from "@mui/icons-material";
import PaymentMethodsTable from "./PaymentMethodsTable";
import CreatePaymentMethod from "../Create/CreatePaymentMethod";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { paymentMethodsSearch, paymentMethodsDelete } from "../../../../api/urls";

interface PaymentMethod {
  paymentMethodId: number;
  methodCode: string;
  methodName: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

export default function PaymentMethodsList() {
  const [searchKey, setSearchKey] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [totalItems, setTotalItems] = useState(0);

  const fetchList = useCallback(() => {
    setLoading(true);
    const query = `?page=${page - 1}&size=${rowsPerPage}${searchKey ? `&keyword=${encodeURIComponent(searchKey)}` : ""}`;
    apiCall(
      paymentMethodsSearch(query),
      "GET",
      null,
      null,
      (res) => {
        setData(res.data?.content || []);
        setTotalItems(res.data?.totalElements || 0);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
  }, [page, rowsPerPage, searchKey]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleSearch = () => {
    setPage(1);
    fetchList();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "26px 50px",
        height: "100%",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Payment Methods
      </Typography>

      <Box flex={1} p="6px">
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "24px 30px",
            gap: 1,
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              <TextField
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by code or name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={22} color="var(--color-text-secondary)" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "var(--color-primary-light)",
                  borderRadius: 3,
                  width: "300px",
                  "& .MuiInputBase-root": {
                    pl: "18px",
                  },
                  "& .MuiInputBase-input": {
                    py: "10px",
                    pl: 1,
                    pr: 3,
                  },
                  "& fieldset": {
                    border: "none",
                  },
                }}
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<Add sx={{ height: 24, width: 24 }} />}
              onClick={() => setIsCreateOpen(true)}
              sx={{
                borderRadius: 1,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              New Payment Method
            </Button>
          </Box>

          <Divider />

          <Box flex={1} mt={3}>
            <PaymentMethodsTable
              data={data}
              loading={loading}
              page={page}
              rowsPerPage={rowsPerPage}
              totalItems={totalItems}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              onDelete={handleDelete}
            />
          </Box>
        </Card>
      </Box>

      <CreatePaymentMethod
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={() => {
          showMessage("Saved successfully!");
          setIsCreateOpen(false);
          fetchList();
        }}
      />

      <AlertDialog
        title="Are you sure you want to delete this payment method?"
        type="error"
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
        buttonCancel="Cancel"
        buttonConfirm="Delete"
        onConfirm={() => {
          if (!deleteId) return;
          apiCall(
            paymentMethodsDelete(deleteId),
            "DELETE",
            null,
            null,
            () => {
              showMessage("Deleted successfully!");
              setIsDeleteOpen(false);
              setDeleteId(null);
              fetchList();
            },
            (err) => {
              console.error(err);
            }
          );
        }}
      />
    </Box>
  );
}
