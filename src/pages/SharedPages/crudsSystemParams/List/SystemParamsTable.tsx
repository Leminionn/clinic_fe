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
  Chip,
} from "@mui/material";
import { DeleteOutline, Edit } from "@mui/icons-material";
import type { SystemParam } from "../../../../types/SystemParam";

function getActiveColor(active: boolean) {
  return active
    ? { bg: "var(--color-bg-success)", text: "var(--color-text-success)" }
    : { bg: "var(--color-bg-error)", text: "var(--color-text-error)" };
}

function getDataTypeColor(dataType: string) {
  const colors: Record<string, string> = {
    STRING: "#2196f3",
    NUMBER: "#4caf50",
    BOOLEAN: "#ff9800",
    DATE: "#9c27b0",
    DECIMAL: "#00bcd4",
  };
  return colors[dataType] || "#757575";
}

interface SystemParamsTableProps {
  data: SystemParam[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onDelete: (id: number) => void;
  onEdit: (param: SystemParam) => void;
}

export default function SystemParamsTable({
  data,
  loading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  onEdit,
}: SystemParamsTableProps) {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

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
            <TableCell sx={{ fontWeight: "bold" }}>Group</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Param Code</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Param Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Effective From</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }} align="center">
              Action
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} align="center">
                <CircularProgress size={28} sx={{ my: 2 }} />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((row: SystemParam, index: number) => {
              const activeStyle = getActiveColor(row.active);
              return (
                <TableRow key={row.paramId} hover>
                  <TableCell sx={{ width: "4%", fontWeight: "bold" }}>
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell width="10%">
                    <Chip
                      label={row.groupName || row.groupCode}
                      size="small"
                      sx={{
                        bgcolor: "#e3f2fd",
                        color: "#1976d2",
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell width="12%">{row.paramCode}</TableCell>
                  <TableCell width="15%">{row.paramName}</TableCell>
                  <TableCell
                    width="15%"
                    sx={{
                      maxWidth: 150,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {row.paramValue}
                  </TableCell>
                  <TableCell width="8%">
                    <Chip
                      label={row.dataType}
                      size="small"
                      sx={{
                        bgcolor: getDataTypeColor(row.dataType),
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "0.7rem",
                      }}
                    />
                  </TableCell>
                  <TableCell width="8%">{row.unit || "-"}</TableCell>
                  <TableCell width="10%">
                    {row.effectiveFrom
                      ? new Date(row.effectiveFrom).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell width="8%">
                    <Box
                      sx={{
                        backgroundColor: activeStyle.bg,
                        color: activeStyle.text,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        textAlign: "center",
                        display: "inline-block",
                      }}
                    >
                      {row.active ? "Active" : "Inactive"}
                    </Box>
                  </TableCell>
                  <TableCell width="10%" align="center">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(row)}
                      sx={{ color: "#5ba2d0" }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(row.paramId)}
                      sx={{ color: "#d32f2f" }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={10} align="center">
                <Typography variant="body2" color="text.secondary" py={4}>
                  No parameters found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">Rows per page:</Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 70 }}
            >
              {[5, 7, 10, 15, 20].map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
