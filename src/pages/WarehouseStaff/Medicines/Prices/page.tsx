import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
   Box,
   Card,
   Typography,
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   IconButton,
   Collapse,
   TextField,
   Grid,
   Alert,
} from "@mui/material";
import {
   ArrowBack,
   Add,
   DeleteOutline,
   Edit,
   ExpandLess,
} from "@mui/icons-material";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import {
   warehouseMedicineById,
   warehouseMedicinePriceAdd,
   warehouseMedicinePriceUpdate,
   warehouseMedicinePriceDelete,
} from "../../../../api/urls";
import type { MedicineDetail, MedicinePriceRequest } from "../../../../types/Medicine";
import AlertDialog from "../../../../components/AlertDialog";

export default function PriceManagementPage() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [formOpen, setFormOpen] = useState(false);
   const [editMode, setEditMode] = useState(false);
   const [originalPrice, setOriginalPrice] = useState<MedicinePriceRequest | null>(null);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [priceToDelete, setPriceToDelete] = useState<MedicinePriceRequest | null>(null);

   // Form state
   const [effectiveDate, setEffectiveDate] = useState(
      new Date().toISOString().split("T")[0]
   );
   const [unitPrice, setUnitPrice] = useState("");

   const fetchData = () => {
      const token = localStorage.getItem("accessToken");
      apiCall(
         `${warehouseMedicineById(Number(id))}?includeZeroQuantity=false`,
         "GET",
         token,
         null,
         (res: any) => {
            setMedicine(res.data);
            setLoading(false);
         },
         (err: any) => {
            console.error(err);
            showMessage("Error loading medicine information", "error");
            setLoading(false);
         }
      );
   };

   useEffect(() => {
      if (id) {
         fetchData();
      }
   }, [id]);

   const handleAddNew = () => {
      setEditMode(false);
      setOriginalPrice(null);
      setEffectiveDate(new Date().toISOString().split("T")[0]);
      setUnitPrice("");
      setFormOpen(true);
   };

   const handleEditClick = (price: MedicinePriceRequest) => {
      // Check if price is already applied
      const priceDate = new Date(price.effectiveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      priceDate.setHours(0, 0, 0, 0);

      if (priceDate <= today) {
         showMessage("Cannot edit price that has already been applied. Only future prices can be edited.", "error");
         return;
      }

      setEditMode(true);
      setOriginalPrice(price);
      setEffectiveDate(price.effectiveDate);
      setUnitPrice(price.unitPrice.toString());
      setFormOpen(true);
   };

   const handleCancelForm = () => {
      setFormOpen(false);
      setEditMode(false);
      setOriginalPrice(null);
      setEffectiveDate(new Date().toISOString().split("T")[0]);
      setUnitPrice("");
   };

   const handleSubmit = () => {
      if (!effectiveDate || !unitPrice) {
         showMessage("Please fill in all fields", "error");
         return;
      }

      const price = parseFloat(unitPrice);
      if (isNaN(price) || price <= 0) {
         showMessage("Price must be a positive number", "error");
         return;
      }

      const token = localStorage.getItem("accessToken");
      const priceData: MedicinePriceRequest = {
         effectiveDate,
         unitPrice: price,
      };

      if (editMode && originalPrice) {
         // Update existing price
         apiCall(
            warehouseMedicinePriceUpdate(Number(id)),
            "PUT",
            token,
            JSON.stringify({
               oldPrice: originalPrice,
               newPrice: priceData,
            }),
            () => {
               showMessage("Price updated successfully", "success");
               handleCancelForm();
               fetchData();
            },
            (err: any) => {
               console.error(err);
               const errorMessage = err?.response?.data?.message || "Failed to update price. Please try again.";
               showMessage(errorMessage, "error");
            }
         );
      } else {
         // Add new price
         apiCall(
            warehouseMedicinePriceAdd(Number(id)),
            "POST",
            token,
            JSON.stringify(priceData),
            () => {
               showMessage("Price added successfully", "success");
               handleCancelForm();
               fetchData();
            },
            (err: any) => {
               console.error(err);
               const errorMessage = err?.response?.data?.message || "Failed to add price. Please try again.";
               showMessage(errorMessage, "error");
            }
         );
      }
   };

   const handleDeleteClick = (price: MedicinePriceRequest) => {
      // Check if price is already applied
      const priceDate = new Date(price.effectiveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      priceDate.setHours(0, 0, 0, 0);

      if (priceDate <= today) {
         showMessage("Cannot delete price that has already been applied. Only future prices can be deleted.", "error");
         return;
      }

      setPriceToDelete(price);
      setDeleteDialogOpen(true);
   };

   const confirmDelete = () => {
      if (!priceToDelete) return;

      const token = localStorage.getItem("accessToken");
      apiCall(
         warehouseMedicinePriceDelete(Number(id)),
         "DELETE",
         token,
         JSON.stringify(priceToDelete),
         () => {
            showMessage("Price deleted successfully", "success");
            setDeleteDialogOpen(false);
            setPriceToDelete(null);
            fetchData();
         },
         (err: any) => {
            console.error(err);
            const errorMessage = err?.response?.data?.message || "Failed to delete price. Please try again.";
            showMessage(errorMessage, "error");
            setDeleteDialogOpen(false);
         }
      );
   };

   if (loading || !medicine) {
      return (
         <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>Loading...</Typography>
         </Box>
      );
   }

   return (
      <Box sx={{ p: 3 }}>
         <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/warehouse-staff/medicines/${id}`)}
            sx={{ mb: 2 }}
         >
            Back to Medicine Detail
         </Button>

         {/* Medicine Summary Card */}
         <Card sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
               <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                     Medicine Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                     {medicine.medicine.medicineName}
                  </Typography>
               </Grid>
               <Grid item xs={6} md={2}>
                  <Typography variant="body2" color="textSecondary">
                     Current Stock
                  </Typography>
                  <Typography variant="h6" color="primary">
                     {medicine.medicine.totalQuantity || 0}
                  </Typography>
               </Grid>
               <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary">
                     Current Price
                  </Typography>
                  <Typography variant="h6" color="success.main">
                     {medicine.currentPrice
                        ? new Intl.NumberFormat("vi-VN", {
                           style: "currency",
                           currency: "VND",
                        }).format(medicine.currentPrice)
                        : "No price"}
                  </Typography>
               </Grid>
            </Grid>
         </Card>

         {/* Price Management Card */}
         <Card sx={{ p: 3 }}>
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
               }}
            >
               <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Price Management
               </Typography>
               <Button
                  variant="contained"
                  startIcon={formOpen ? <ExpandLess /> : <Add />}
                  onClick={formOpen ? handleCancelForm : handleAddNew}
               >
                  {formOpen ? "Cancel" : "Add New Price"}
               </Button>
            </Box>

            {/* Inline Form */}
            <Collapse in={formOpen}>
               <Card sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                     {editMode ? "Edit Price" : "Add New Price"}
                  </Typography>
                  <Grid container spacing={2}>
                     <Grid item xs={12} md={4}>
                        <TextField
                           label="Effective Date"
                           type="date"
                           value={effectiveDate}
                           onChange={(e) => setEffectiveDate(e.target.value)}
                           InputLabelProps={{ shrink: true }}
                           inputProps={{
                              min: (() => {
                                 const today = new Date();
                                 const year = today.getFullYear();
                                 const month = String(today.getMonth() + 1).padStart(2, '0');
                                 const day = String(today.getDate()).padStart(2, '0');
                                 return `${year}-${month}-${day}`;
                              })()
                           }}
                           fullWidth
                           required
                        />
                     </Grid>
                     <Grid item xs={12} md={4}>
                        <TextField
                           label="Unit Price"
                           type="number"
                           value={unitPrice}
                           onChange={(e) => setUnitPrice(e.target.value)}
                           inputProps={{ min: 0, step: 1000 }}
                           fullWidth
                           required
                           helperText="Price must be greater than import price"
                        />
                     </Grid>
                     <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button variant="outlined" onClick={handleCancelForm} fullWidth>
                           Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSubmit} fullWidth>
                           Save
                        </Button>
                     </Grid>
                  </Grid>
               </Card>
            </Collapse>

            <Alert severity="info" sx={{ mb: 2 }}>
               * Can only delete/edit prices with future effective date (prices that haven't become effective yet)
            </Alert>

            {/* Price List Table */}
            <Table>
               <TableHead>
                  <TableRow>
                     <TableCell sx={{ fontWeight: "bold" }}>Effective Date</TableCell>
                     <TableCell align="right" sx={{ fontWeight: "bold" }}>Unit Price</TableCell>
                     <TableCell align="center" sx={{ fontWeight: "bold" }}>Status</TableCell>
                     <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {medicine.priceHistory.length > 0 ? (
                     medicine.priceHistory.map((price) => {
                        const priceDate = new Date(price.effectiveDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        priceDate.setHours(0, 0, 0, 0);

                        const isApplied = priceDate <= today;
                        const statusBg = isApplied ? "var(--color-bg-success)" : "var(--color-bg-warning)";
                        const statusText = isApplied ? "var(--color-text-success)" : "var(--color-text-warning)";

                        return (
                           <TableRow key={price.effectiveDate}>
                              <TableCell>
                                 {new Date(price.effectiveDate).toLocaleDateString("en-GB")}
                              </TableCell>
                              <TableCell align="right">
                                 {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                 }).format(price.unitPrice)}
                              </TableCell>
                              <TableCell align="center">
                                 <Box
                                    sx={{
                                       display: "inline-flex",
                                       borderRadius: 1,
                                       padding: "2px 10px",
                                       color: statusText,
                                       bgcolor: statusBg,
                                    }}
                                 >
                                    {isApplied ? "Applied" : "Not Applied"}
                                 </Box>
                              </TableCell>
                              <TableCell align="center">
                                 <IconButton
                                    onClick={() =>
                                       handleEditClick({
                                          effectiveDate: price.effectiveDate,
                                          unitPrice: price.unitPrice,
                                       })
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
                                    onClick={() =>
                                       handleDeleteClick({
                                          effectiveDate: price.effectiveDate,
                                          unitPrice: price.unitPrice,
                                       })
                                    }
                                    sx={{
                                       color: "var(--color-text-error)",
                                       border: "1px solid var(--color-text-error)",
                                       borderRadius: 1.2,
                                       height: 32,
                                       width: 32,
                                    }}
                                    title="Delete"
                                 >
                                    <DeleteOutline sx={{ fontSize: 20 }} />
                                 </IconButton>
                              </TableCell>
                           </TableRow>
                        );
                     })
                  ) : (
                     <TableRow>
                        <TableCell colSpan={4} align="center">
                           No price history
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </Card>

         <AlertDialog
            open={deleteDialogOpen}
            setOpen={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            title="Confirm delete this price?"
            type="warning"
            buttonCancel="Cancel"
            buttonConfirm="Delete"
         />
      </Box>
   );
}
