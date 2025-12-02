import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { Search } from "lucide-react";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PaymentMethodsTable from "./PaymentMethodsTable";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { paymentMethodsSearch, paymentMethodsDelete } from "../../../../api/urls";

function getStatusTextColor(status: string) {
  switch (status) {
    case "Active":
      return "var(--color-text-success)";
    case "Inactive":
      return "var(--color-text-error)";
    default:
      return "var(--color-text-secondary)";
  }
}

function getStatusBgColor(status: string) {
  switch (status) {
    case "Active":
      return "var(--color-bg-success)";
    case "Inactive":
      return "var(--color-bg-error)";
    default:
      return "transparent";
  }
}

interface PaymentMethod {
  paymentMethodId: number;
  methodCode: string;
  methodName: string;
  description: string;
  sortOrder: number;
  active: boolean;
}

export default function PaymentMethodsList() {
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [data, setData] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [totalItems, setTotalItems] = useState(0);

  const fetchList = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    let query = `?page=${page - 1}&size=${rowsPerPage}`;
    if (searchKey) {
      query += `&keyword=${encodeURIComponent(searchKey)}`;
    }
    if (filterStatus !== "") {
      query += `&isActive=${filterStatus === "Active"}`;
    }
    apiCall(
      paymentMethodsSearch(query),
      "GET",
      token,
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
  }, [page, rowsPerPage, searchKey, filterStatus]);

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
                  width: "280px",
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

              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                displayEmpty
                sx={{
                  "& fieldset": {
                    borderRadius: 3,
                    borderWidth: 1.6,
                    borderColor: "var(--color-primary-main)",
                  },
                  "& .MuiInputBase-input": {
                    display: "flex",
                    width: "120px",
                    alignItems: "center",
                    paddingY: "8px",
                    paddingLeft: "24px",
                  },
                }}
              >
                <MenuItem value="">
                  <Box sx={{ padding: "2px 10px" }}>All status</Box>
                </MenuItem>
                {["Active", "Inactive"].map((item) => (
                  <MenuItem key={item} value={item}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        borderRadius: 1,
                        padding: "2px 10px",
                        color: getStatusTextColor(item),
                        bgcolor: getStatusBgColor(item),
                      }}
                    >
                      {item}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add sx={{ height: 24, width: 24 }} />}
              onClick={() => navigate("create")}
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

      <AlertDialog
        title="Are you sure you want to delete this payment method?"
        type="error"
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
        buttonCancel="Cancel"
        buttonConfirm="Delete"
        onConfirm={() => {
          if (!deleteId) return;
          const token = localStorage.getItem("accessToken");
          apiCall(
            paymentMethodsDelete(deleteId),
            "DELETE",
            token,
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
