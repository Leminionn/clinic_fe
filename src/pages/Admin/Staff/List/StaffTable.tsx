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
import { DeleteOutline, Edit, Visibility, CalendarMonth } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface StaffTableProps {
   data: any[];
   loading: boolean;
   page: number;
   rowsPerPage: number;
   totalItems: number;
   onPageChange: (page: number) => void;
   onRowsPerPageChange: (rows: number) => void;
   onDelete: (id: number) => void;
}

function getRoleColor(role: string) {
   const roleMap: any = {
      DOCTOR: { bg: "#e3f2fd", text: "#1976d2" },
      RECEPTIONIST: { bg: "#f3e5f5", text: "#7b1fa2" },
      WAREHOUSE_STAFF: { bg: "#e8f5e9", text: "#388e3c" },
   };
   return roleMap[role] || { bg: "#f5f5f5", text: "#757575" };
}

function getRoleLabel(role: string) {
   const labels: any = {
      DOCTOR: "Doctor",
      RECEPTIONIST: "Receptionist",
      WAREHOUSE_STAFF: "Warehouse Staff",
   };
   return labels[role] || role;
}

export default function StaffTable({
   data,
   loading,
   page,
   rowsPerPage,
   totalItems,
   onPageChange,
   onRowsPerPageChange,
   onDelete,
}: StaffTableProps) {
   const navigate = useNavigate();
   const role = localStorage.getItem("role")?.toLowerCase() || "admin";

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
                  <TableCell sx={{ fontWeight: "bold" }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>ID Card</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                     Actions
                  </TableCell>
               </TableRow>
            </TableHead>

            <TableBody>
               {loading ? (
                  <TableRow>
                     <TableCell colSpan={8} align="center">
                        <CircularProgress size={28} sx={{ my: 2 }} />
                     </TableCell>
                  </TableRow>
               ) : data.length > 0 ? (
                  data.map((row: any, index: number) => {
                     const roleStyle = getRoleColor(row.role);
                     return (
                        <TableRow key={row.staffId} hover>
                           <TableCell sx={{ width: "5%", fontWeight: "bold" }}>
                              {(page - 1) * rowsPerPage + index + 1}
                           </TableCell>
                           <TableCell width="18%">{row.fullName}</TableCell>
                           <TableCell width="12%">
                              <Chip
                                 label={getRoleLabel(row.role)}
                                 size="small"
                                 sx={{
                                    backgroundColor: roleStyle.bg,
                                    color: roleStyle.text,
                                    fontWeight: 500,
                                 }}
                              />
                           </TableCell>
                           <TableCell width="18%">{row.email}</TableCell>
                           <TableCell width="12%">{row.phone}</TableCell>
                           <TableCell width="12%">{row.idCard}</TableCell>
                           <TableCell width="10%">
                              <Chip
                                 label={row.active ? "Active" : "Inactive"}
                                 size="small"
                                 sx={{
                                    backgroundColor: row.active
                                       ? "var(--color-bg-success)"
                                       : "var(--color-bg-error)",
                                    color: row.active
                                       ? "var(--color-text-success)"
                                       : "var(--color-text-error)",
                                    fontWeight: 500,
                                 }}
                              />
                           </TableCell>
                           <TableCell width="13%" align="center">
                              <IconButton
                                 size="small"
                                 onClick={() =>
                                    navigate(`/admin/staff/${row.staffId}`)
                                 }
                                 sx={{ color: "var(--color-text-secondary)" }}
                              >
                                 <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton
                                 size="small"
                                 onClick={() =>
                                    navigate(`/admin/staff/edit/${row.staffId}`, { state: { from: window.location.pathname } })
                                 }
                                 sx={{ color: "var(--color-text-secondary)" }}
                              >
                                 <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                 size="small"
                                 onClick={() =>
                                    navigate(`/admin/staff/schedule/${row.staffId}`)
                                 }
                                 sx={{ color: "var(--color-text-secondary)" }}
                              >
                                 <CalendarMonth fontSize="small" />
                              </IconButton>
                              <IconButton
                                 size="small"
                                 onClick={() => onDelete(row.staffId)}
                                 sx={{ color: "var(--color-text-error)" }}
                              >
                                 <DeleteOutline fontSize="small" />
                              </IconButton>
                           </TableCell>
                        </TableRow>
                     );
                  })
               ) : (
                  <TableRow>
                     <TableCell colSpan={8} align="center">
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{ py: 3 }}
                        >
                           No data
                        </Typography>
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>

         {/* Pagination */}
         <Box
            sx={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
               mt: 2,
               p: 1,
            }}
         >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
               <Typography variant="body2" color="text.secondary">
                  Show:
               </Typography>
               <Select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                  sx={{ minWidth: 80 }}
               >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
               </Select>
               <Typography variant="body2" color="text.secondary">
                  of {totalItems} records
               </Typography>
            </Box>

            <Pagination
               count={Math.ceil(totalItems / rowsPerPage)}
               page={page}
               onChange={(_, value) => onPageChange(value)}
               color="primary"
               shape="rounded"
            />
         </Box>
      </Box>
   );
}
