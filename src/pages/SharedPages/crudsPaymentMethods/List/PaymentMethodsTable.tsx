import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function getActiveColor(active: boolean) {
  return active
    ? { bg: "var(--color-bg-success)", text: "var(--color-text-success)" }
    : { bg: "var(--color-bg-error)", text: "var(--color-text-error)" };
}

interface PaymentMethodsTableProps {
  data: any[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onDelete: (id: number) => void;
}

export default function PaymentMethodsTable({
  data,
  loading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
}: PaymentMethodsTableProps) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Table
        sx={{
          "& .MuiTableCell-root": {
            padding: "9px 0px",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Sort Order</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Action
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <CircularProgress size={28} sx={{ my: 2 }} />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((row: any, index: number) => {
              const activeStyle = getActiveColor(row.active);
              return (
                <TableRow key={row.paymentMethodId} hover>
                  <TableCell sx={{ width: "5%", fontWeight: "bold" }}>
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell width="12%">{row.methodCode}</TableCell>
                  <TableCell width="18%">{row.methodName}</TableCell>
                  <TableCell
                    width="30%"
                    sx={{
                      maxWidth: 250,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={row.description}
                  >
                    {row.description}
                  </TableCell>
                  <TableCell width="10%">{row.sortOrder}</TableCell>
                  <TableCell width="12%">
                    <Box
                      sx={{
                        display: "inline-flex",
                        borderRadius: 1,
                        padding: "2px 10px",
                        color: activeStyle.text,
                        bgcolor: activeStyle.bg,
                      }}
                    >
                      {row.active ? "Active" : "Inactive"}
                    </Box>
                  </TableCell>
                  <TableCell width="13%" align="center">
                    <IconButton
                      onClick={() =>
                        navigate(`update/${row.paymentMethodId}`)
                      }
                      sx={{
                        color: "var(--color-primary-contrast)",
                        bgcolor: "var(--color-primary-main)",
                        borderRadius: 1.2,
                        height: 32,
                        width: 32,
                        mr: 1,
                      }}
                      title="Edit"
                    >
                      <Edit sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => onDelete(row.paymentMethodId)}
                      sx={{
                        color: "var(--color-text-error)",
                        border: "1px solid var(--color-text-error)",
                        borderRadius: 1.2,
                        height: 32,
                        width: 32,
                        mr: 1,
                      }}
                      title="Delete"
                    >
                      <DeleteOutline sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        navigate(`detail/${row.paymentMethodId}`)
                      }
                      sx={{
                        color: "var(--color-text-info)",
                        border: "1px solid var(--color-primary-main)",
                        borderRadius: 1.2,
                        height: 32,
                        width: 32,
                      }}
                      title="View Detail"
                    >
                      <Typography>i</Typography>
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mr: 5,
          mt: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: "var(--color-text-secondary)" }}>
            Show
          </Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            sx={{
              "& .MuiInputBase-input": {
                width: "20px",
                py: "6px",
              },
            }}
          >
            {[7, 10, 15].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
          <Typography sx={{ color: "var(--color-text-secondary)" }}>
            results
          </Typography>
        </Box>

        <Pagination
          count={Math.ceil(totalItems / rowsPerPage)}
          page={page}
          onChange={(_, val) => onPageChange(val)}
          color="primary"
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": {
              color: "var(--color-primary-main)",
              "&.Mui-selected": {
                color: "#fff",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
