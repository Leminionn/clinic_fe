import { useEffect, useState } from "react";
import {
   Box,
   Button,
   Card,
   TextField,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { staffSearch, staffDelete } from "../../../../api/urls";
import StaffTable from "./StaffTable";
import AlertDialog from "../../../../components/AlertDialog";

export default function StaffList() {
   const navigate = useNavigate();
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(1);
   const [rowsPerPage, setRowsPerPage] = useState(10);
   const [totalItems, setTotalItems] = useState(0);

   // Filters
   const [searchTerm, setSearchTerm] = useState("");
   const [roleFilter, setRoleFilter] = useState("ALL");
   const [statusFilter, setStatusFilter] = useState("ALL");

   // Confirm dialog
   const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
   const [deleteId, setDeleteId] = useState<number | null>(null);

   const fetchData = () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      // Build query string
      let query = `?page=${page - 1}&size=${rowsPerPage}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;
      if (roleFilter !== "ALL") query += `&role=${roleFilter}`;
      if (statusFilter !== "ALL") query += `&active=${statusFilter === "ACTIVE"}`;

      apiCall(
         staffSearch(query),
         "GET",
         token,
         null,
         (res: any) => {
            setData(res.data?.content || []);
            setTotalItems(res.data?.totalElements || 0);
            setLoading(false);
         },
         (err: any) => {
            console.error(err);
            showMessage("Cannot load staff list", "error");
            setLoading(false);
         }
      );
   };

   useEffect(() => {
      fetchData();
   }, [page, rowsPerPage]);

   // Trigger search on text change with debounce (like other sections)
   useEffect(() => {
      const t = setTimeout(() => {
         setPage(1);
         fetchData();
      }, 300);
      return () => clearTimeout(t);
   }, [searchTerm, roleFilter, statusFilter]);

   const handleDeleteConfirm = (id: number) => {
      setDeleteId(id);
      setIsConfirmDialogOpen(true);
   };

   const handleDelete = () => {
      if (!deleteId) return;

      const token = localStorage.getItem("accessToken");
      apiCall(
         staffDelete(deleteId),
         "DELETE",
         token,
         null,
         () => {
            showMessage("Staff deleted successfully!");
            setIsConfirmDialogOpen(false);
            setDeleteId(null);
            fetchData();
         },
         (err: any) => {
            console.error(err);
            showMessage(err?.message || "Cannot delete staff", "error");
         }
      );
   };

   return (
      <Box sx={{ p: 3 }}>
         <Box
            sx={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
               mb: 3,
            }}
         >
            <Typography variant="h5" fontWeight="bold">
               Manage Staff
            </Typography>
            <Button
               variant="contained"
               startIcon={<Add />}
               onClick={() => navigate("/admin/staff/create")}
            >
               Add Staff
            </Button>
         </Box>

         {/* Filters */}
         <Card sx={{ p: 2, mb: 2 }}>
            <Box
               sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-end",
                  flexWrap: "wrap",
               }}
            >
               <TextField
                  label="Search"
                  placeholder="Name, email, phone..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 250 }}
               />

               <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                     value={roleFilter}
                     label="Role"
                     onChange={(e) => setRoleFilter(e.target.value)}
                  >
                     <MenuItem value="ALL">All</MenuItem>
                     <MenuItem value="DOCTOR">Doctor</MenuItem>
                     <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
                     <MenuItem value="WAREHOUSE_STAFF">Warehouse Staff</MenuItem>
                  </Select>
               </FormControl>

               <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                     value={statusFilter}
                     label="Status"
                     onChange={(e) => setStatusFilter(e.target.value)}
                  >
                     <MenuItem value="ALL">All</MenuItem>
                     <MenuItem value="ACTIVE">Active</MenuItem>
                     <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
               </FormControl>
            </Box>
         </Card>

         {/* Table */}
         <Card sx={{ p: 2 }}>
            <StaffTable
               data={data}
               loading={loading}
               page={page}
               rowsPerPage={rowsPerPage}
               totalItems={totalItems}
               onPageChange={setPage}
               onRowsPerPageChange={setRowsPerPage}
               onDelete={handleDeleteConfirm}
            />
         </Card>

         {/* Delete Confirmation Dialog */}
         <AlertDialog
            title={"Are you sure you want to delete this staff member?"}
            type="error"
            open={isConfirmDialogOpen}
            setOpen={setIsConfirmDialogOpen}
            buttonCancel="Cancel"
            buttonConfirm="Delete"
            onConfirm={handleDelete}
         />
      </Box>
   );
}
