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
import type { SystemParamGroup } from "../../../../types/SystemParam";

function getActiveColor(active: boolean) {
   return active
      ? { bg: "var(--color-bg-success)", text: "var(--color-text-success)" }
      : { bg: "var(--color-bg-error)", text: "var(--color-text-error)" };
}

interface SystemParamGroupsTableProps {
   data: SystemParamGroup[];
   loading: boolean;
   page: number;
   rowsPerPage: number;
   totalItems: number;
   onPageChange: (page: number) => void;
   onRowsPerPageChange: (rows: number) => void;
   onDelete: (id: number) => void;
   onEdit: (group: SystemParamGroup) => void;
}

export default function SystemParamGroupsTable({
   data,
   loading,
   page,
   rowsPerPage,
   totalItems,
   onPageChange,
   onRowsPerPageChange,
   onDelete,
   onEdit,
}: SystemParamGroupsTableProps) {
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
                  <TableCell sx={{ fontWeight: "bold" }}>Group Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Group Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                     Action
                  </TableCell>
               </TableRow>
            </TableHead>

            <TableBody>
               {loading ? (
                  <TableRow>
                     <TableCell colSpan={6} align="center">
                        <CircularProgress size={28} sx={{ my: 2 }} />
                     </TableCell>
                  </TableRow>
               ) : data.length > 0 ? (
                  data.map((row: SystemParamGroup, index: number) => {
                     const activeStyle = getActiveColor(row.active);
                     return (
                        <TableRow key={row.groupId} hover>
                           <TableCell sx={{ width: "5%", fontWeight: "bold" }}>
                              {(page - 1) * rowsPerPage + index + 1}
                           </TableCell>
                           <TableCell width="15%">{row.groupCode}</TableCell>
                           <TableCell width="20%">{row.groupName}</TableCell>
                           <TableCell
                              width="40%"
                              sx={{
                                 maxWidth: 300,
                                 whiteSpace: "nowrap",
                                 overflow: "hidden",
                                 textOverflow: "ellipsis",
                              }}
                           >
                              {row.description || "-"}
                           </TableCell>
                           <TableCell width="10%">
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
                                 onClick={() => onDelete(row.groupId)}
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
                     <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" py={4}>
                           No groups found
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
