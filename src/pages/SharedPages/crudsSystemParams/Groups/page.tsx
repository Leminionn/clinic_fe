import { useEffect, useState, useCallback } from "react";
import {
   Box,
   Card,
   Typography,
   Divider,
   TextField,
   InputAdornment,
   Button,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Chip,
} from "@mui/material";
import { Search, FolderTree } from "lucide-react";
import { Add } from "@mui/icons-material";
import SystemParamGroupsTable from "./SystemParamGroupsTable";
import CreateUpdateSystemParamGroup from "./CreateUpdateSystemParamGroup";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import {
   systemParamGroupsSearch,
   systemParamGroupsDelete,
} from "../../../../api/urls";
import type { SystemParamGroup } from "../../../../types/SystemParam";

const getToken = () => localStorage.getItem("accessToken");

export default function SystemParamGroupsList() {
   const [searchKey, setSearchKey] = useState("");
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
   const [isViewOpen, setIsViewOpen] = useState(false);
   const [deleteId, setDeleteId] = useState<number | null>(null);
   const [editData, setEditData] = useState<SystemParamGroup | null>(null);
   const [viewData, setViewData] = useState<SystemParamGroup | null>(null);
   const [data, setData] = useState<SystemParamGroup[]>([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(1);
   const [rowsPerPage, setRowsPerPage] = useState(7);
   const [totalItems, setTotalItems] = useState(0);

   const fetchList = useCallback(() => {
      setLoading(true);
      const query = `?page=${page - 1}&size=${rowsPerPage}${searchKey ? `&keyword=${encodeURIComponent(searchKey)}` : ""
         }`;
      apiCall(
         systemParamGroupsSearch(query),
         "GET",
         getToken(),
         null,
         (res: any) => {
            setData(res.content || []);
            setTotalItems(res.totalElements || 0);
            setLoading(false);
         },
         (err: any) => {
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

   const handleEdit = (group: SystemParamGroup) => {
      setEditData(group);
      setIsCreateOpen(true);
   };

   const handleView = (group: SystemParamGroup) => {
      setViewData(group);
      setIsViewOpen(true);
   };

   const handleCloseView = () => {
      setIsViewOpen(false);
      setViewData(null);
   };

   const handleConfirmDelete = () => {
      if (deleteId !== null) {
         apiCall(
            systemParamGroupsDelete(deleteId),
            "DELETE",
            getToken(),
            null,
            () => {
               showMessage("Parameter group deleted successfully");
               setIsDeleteOpen(false);
               setDeleteId(null);
               fetchList();
            },
            (err: any) => {
               console.error(err);
               showMessage("Failed to delete parameter group");
            }
         );
      }
   };

   const handleSearch = () => {
      setPage(1);
      fetchList();
   };

   const handleSaved = () => {
      showMessage(
         editData
            ? "Parameter group updated successfully"
            : "Parameter group created successfully"
      );
      setIsCreateOpen(false);
      setEditData(null);
      fetchList();
   };

   const handleCloseDialog = () => {
      setIsCreateOpen(false);
      setEditData(null);
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
         <Box sx={{ display: "flex", alignItems: "center", gap: 2, mx: 4, mb: 3 }}>
            <FolderTree size={28} />
            <Typography variant="h5" fontWeight="bold">
               System Parameter Groups
            </Typography>
         </Box>

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
                     gap: 2,
                  }}
               >
                  <Box sx={{ display: "flex", gap: 2 }}>
                     <TextField
                        placeholder="Search by code or name..."
                        value={searchKey}
                        onChange={(e) => setSearchKey(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === "Enter") handleSearch();
                        }}
                        size="small"
                        sx={{ minWidth: 350 }}
                        InputProps={{
                           startAdornment: (
                              <InputAdornment position="start">
                                 <Search size={18} />
                              </InputAdornment>
                           ),
                        }}
                     />
                     <Button
                        variant="outlined"
                        onClick={handleSearch}
                        sx={{ textTransform: "none" }}
                     >
                        Search
                     </Button>
                  </Box>

                  <Button
                     variant="contained"
                     startIcon={<Add />}
                     onClick={() => setIsCreateOpen(true)}
                     sx={{ textTransform: "none" }}
                  >
                     New Group
                  </Button>
               </Box>

               <Divider sx={{ my: 1 }} />

               {/* Info */}
               <Typography variant="body2" color="text.secondary" mb={1}>
                  Total: <strong>{totalItems}</strong> parameter groups
               </Typography>

               {/* Table */}
               <Box flex={1} overflow="hidden">
                  <SystemParamGroupsTable
                     data={data}
                     loading={loading}
                     page={page}
                     rowsPerPage={rowsPerPage}
                     totalItems={totalItems}
                     onPageChange={setPage}
                     onRowsPerPageChange={(rows) => {
                        setRowsPerPage(rows);
                        setPage(1);
                     }}
                     onDelete={handleDelete}
                     onEdit={handleEdit}
                     onView={handleView}
                  />
               </Box>
            </Card>
         </Box>

         {/* Create/Update Dialog */}
         <CreateUpdateSystemParamGroup
            open={isCreateOpen}
            onClose={handleCloseDialog}
            onSaved={handleSaved}
            editData={editData}
         />

         {/* Delete Dialog */}
         <AlertDialog
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
            onConfirm={handleConfirmDelete}
            title="Delete Parameter Group?"
            type="warning"
            buttonCancel="Cancel"
            buttonConfirm="Delete"
         />

         {/* View Dialog */}
         <Dialog open={isViewOpen} onClose={handleCloseView} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: "#1976d2", color: "white", fontWeight: "bold" }}>
               Parameter Group Details
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
               {viewData && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                     <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                        <Box>
                           <Typography variant="subtitle2" color="text.secondary">
                              Group Code
                           </Typography>
                           <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
                              {viewData.groupCode}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="subtitle2" color="text.secondary">
                              Group Name
                           </Typography>
                           <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
                              {viewData.groupName}
                           </Typography>
                        </Box>
                     </Box>
                     <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                           Status
                        </Typography>
                        <Chip
                           label={viewData.active ? "Active" : "Inactive"}
                           size="small"
                           sx={{
                              mt: 0.5,
                              bgcolor: viewData.active
                                 ? "var(--color-bg-success)"
                                 : "var(--color-bg-error)",
                              color: viewData.active
                                 ? "var(--color-text-success)"
                                 : "var(--color-text-error)",
                              fontWeight: 600,
                           }}
                        />
                     </Box>
                     {viewData.description && (
                        <Box>
                           <Typography variant="subtitle2" color="text.secondary">
                              Description
                           </Typography>
                           <Typography
                              variant="body2"
                              sx={{
                                 mt: 0.5,
                                 bgcolor: "#f5f5f5",
                                 p: 1.5,
                                 borderRadius: 1,
                              }}
                           >
                              {viewData.description}
                           </Typography>
                        </Box>
                     )}
                  </Box>
               )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
               <Button onClick={handleCloseView} variant="contained" color="primary">
                  Close
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
}
