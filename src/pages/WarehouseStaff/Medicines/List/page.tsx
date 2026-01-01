import { useEffect, useState, useCallback } from "react";
import {
   Box,
   Card,
   Typography,
   TextField,
   InputAdornment,
   Button,
   Select,
   MenuItem,
   FormControl,
   InputLabel,
} from "@mui/material";
import { Search } from "lucide-react";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MedicinesTable from "./MedicinesTable";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import {
   warehouseMedicines,
   warehouseMedicineDelete,
   warehouseMedicineManufacturers,
} from "../../../../api/urls";
import type { Medicine } from "../../../../types/Medicine";
import { EMedicineUnit } from "../../../../types/Medicine";

export default function MedicinesList() {
   const navigate = useNavigate();
   const [searchKey, setSearchKey] = useState("");
   const [filterUnit, setFilterUnit] = useState("");
   const [filterManufacturer, setFilterManufacturer] = useState("");
   const [manufacturers, setManufacturers] = useState<string[]>([]);
   const [isDeleteOpen, setIsDeleteOpen] = useState(false);
   const [deleteId, setDeleteId] = useState<number | null>(null);
   const [data, setData] = useState<Medicine[]>([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(1);
   const [rowsPerPage, setRowsPerPage] = useState(10);
   const [totalItems, setTotalItems] = useState(0);

   // Fetch manufacturers for filter
   useEffect(() => {
      const token = localStorage.getItem("accessToken");
      apiCall(
         warehouseMedicineManufacturers,
         "GET",
         token,
         null,
         (res: any) => {
            setManufacturers(res.data || []);
         },
         (err: any) => {
            console.error("Failed to fetch manufacturers:", err);
         }
      );
   }, []);

   const fetchList = useCallback(() => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      let query = `?page=${page - 1}&size=${rowsPerPage}`;
      if (searchKey) {
         query += `&keyword=${encodeURIComponent(searchKey)}`;
      }
      if (filterUnit) {
         query += `&unit=${filterUnit}`;
      }
      if (filterManufacturer) {
         query += `&manufacturer=${encodeURIComponent(filterManufacturer)}`;
      }

      apiCall(
         warehouseMedicines(query),
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
            showMessage("Error loading medicine list", "error");
            setLoading(false);
         }
      );
   }, [page, rowsPerPage, searchKey, filterUnit, filterManufacturer]);

   useEffect(() => {
      fetchList();
   }, [fetchList]);

   const handleDelete = (id: number) => {
      setDeleteId(id);
      setIsDeleteOpen(true);
   };

   const confirmDelete = () => {
      if (deleteId === null) return;
      const token = localStorage.getItem("accessToken");
      apiCall(
         warehouseMedicineDelete(deleteId),
         "DELETE",
         token,
         null,
         () => {
            showMessage("Medicine deleted successfully", "success");
            fetchList();
            setIsDeleteOpen(false);
            setDeleteId(null);
         },
         (err: any) => {
            console.error(err);
            showMessage(
               err?.response?.data?.message || "Error deleting medicine",
               "error"
            );
            setIsDeleteOpen(false);
         }
      );
   };

   const handleView = (id: number) => {
      navigate(`/warehouse-staff/medicines/${id}`);
   };

   const handleEdit = (id: number) => {
      navigate(`/warehouse-staff/medicines/edit/${id}`);
   };

   return (
      <Box sx={{ p: 3 }}>
         <Card sx={{ p: 3 }}>
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
               }}
            >
               <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Medicine List
               </Typography>
               <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/warehouse-staff/medicines/create")}
               >
                  Add Medicine
               </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
               <TextField
                  placeholder="Search by medicine name..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <Search size={20} />
                        </InputAdornment>
                     ),
                  }}
               />

               <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                     value={filterUnit}
                     onChange={(e) => setFilterUnit(e.target.value)}
                     label="Unit"
                  >
                     <MenuItem value="">All</MenuItem>
                     {Object.values(EMedicineUnit).map((unit) => (
                        <MenuItem key={unit} value={unit}>
                           {unit}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>

               <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Manufacturer</InputLabel>
                  <Select
                     value={filterManufacturer}
                     onChange={(e) => setFilterManufacturer(e.target.value)}
                     label="Manufacturer"
                  >
                     <MenuItem value="">All</MenuItem>
                     {manufacturers.map((manufacturer) => (
                        <MenuItem key={manufacturer} value={manufacturer}>
                           {manufacturer}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </Box>

            <MedicinesTable
               data={data}
               loading={loading}
               page={page}
               rowsPerPage={rowsPerPage}
               totalItems={totalItems}
               onPageChange={setPage}
               onRowsPerPageChange={setRowsPerPage}
               onView={handleView}
               onEdit={handleEdit}
               onDelete={handleDelete}
            />
         </Card>

         <AlertDialog
            open={isDeleteOpen}
            setOpen={setIsDeleteOpen}
            onConfirm={confirmDelete}
            title="Confirm delete this medicine?"
            type="warning"
            buttonCancel="Cancel"
            buttonConfirm="Delete"
         />
      </Box>
   );
}
