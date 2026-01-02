import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
   Box,
   Card,
   Typography,
   Button,
   Chip,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   Switch,
   FormControlLabel,
   Grid,
} from "@mui/material";
import { ArrowBack, Edit } from "@mui/icons-material";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { warehouseMedicineById } from "../../../../api/urls";
import type { MedicineDetail } from "../../../../types/Medicine";

export default function MedicineDetailPage() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const [data, setData] = useState<MedicineDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [includeZeroQuantity, setIncludeZeroQuantity] = useState(false);

   const fetchDetail = () => {
      const token = localStorage.getItem("accessToken");
      apiCall(
         `${warehouseMedicineById(Number(id))}?includeZeroQuantity=${includeZeroQuantity}`,
         "GET",
         token,
         null,
         (res: any) => {
            setData(res.data);
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
         fetchDetail();
      }
   }, [id, includeZeroQuantity]);

   if (loading || !data) {
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
            onClick={() => navigate("/warehouse-staff/medicines")}
            sx={{ mb: 2 }}
         >
            Back to List
         </Button>

         {/* Medicine Info Card */}
         <Card sx={{ p: 3, mb: 3 }}>
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
               }}
            >
               <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Medicine Information
               </Typography>
               <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() =>
                     navigate(`/warehouse-staff/medicines/edit/${id}`)
                  }
               >
                  Edit
               </Button>
            </Box>

            <Grid container spacing={3}>
               {/* Row 1: Basic Info */}
               <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Medicine Name
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                     {data.medicine.medicineName}
                  </Typography>
               </Grid>

               <Grid item xs={6} md={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Unit
                  </Typography>
                  <Chip label={data.medicine.unit} size="medium" color="primary" variant="outlined" />
               </Grid>

               <Grid item xs={6} md={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Current Stock
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                     {data.medicine.totalQuantity || 0}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Current Price
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                     {data.currentPrice
                        ? new Intl.NumberFormat("vi-VN", {
                           style: "currency",
                           currency: "VND",
                        }).format(data.currentPrice)
                        : "No price"}
                  </Typography>
               </Grid>

               {/* Row 2: Details */}
               <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Concentration
                  </Typography>
                  <Typography variant="body1">
                     {data.medicine.concentration || "-"}
                  </Typography>
               </Grid>

               <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Dosage Form
                  </Typography>
                  <Typography variant="body1">
                     {data.medicine.form || "-"}
                  </Typography>
               </Grid>

               <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Manufacturer
                  </Typography>
                  <Typography variant="body1">
                     {data.medicine.manufacturer || "-"}
                  </Typography>
               </Grid>

               <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                     Storage Condition
                  </Typography>
                  <Typography variant="body1">
                     {data.medicine.storageCondition}
                  </Typography>
               </Grid>

               {/* Row 3: Usage Instructions (Full Width) */}
               {data.medicine.usageInstructions && (
                  <Grid item xs={12}>
                     <Typography variant="body2" color="textSecondary" gutterBottom>
                        Usage Instructions
                     </Typography>
                     <Typography variant="body1">
                        {data.medicine.usageInstructions}
                     </Typography>
                  </Grid>
               )}
            </Grid>
         </Card>

         {/* Inventory Batches Card */}
         <Card sx={{ p: 3, mb: 3 }}>
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
               }}
            >
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Inventory Batches
               </Typography>
               <FormControlLabel
                  control={
                     <Switch
                        checked={includeZeroQuantity}
                        onChange={(e) => setIncludeZeroQuantity(e.target.checked)}
                     />
                  }
                  label="Show zero stock batches"
               />
            </Box>

            <Table size="small">
               <TableHead>
                  <TableRow>
                     <TableCell>Import ID</TableCell>
                     <TableCell>Import Date</TableCell>
                     <TableCell>Supplier</TableCell>
                     <TableCell>Expiry Date</TableCell>
                     <TableCell align="right">Import Price</TableCell>
                     <TableCell align="right">Stock Quantity</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {data.inventories.length > 0 ? (
                     data.inventories.map((inv) => (
                        <TableRow key={inv.importId}>
                           <TableCell>{inv.importId}</TableCell>
                           <TableCell>
                              {new Date(inv.importDate).toLocaleDateString("vi-VN")}
                           </TableCell>
                           <TableCell>{inv.supplier}</TableCell>
                           <TableCell>
                              {new Date(inv.expiryDate).toLocaleDateString("vi-VN")}
                           </TableCell>
                           <TableCell align="right">
                              {new Intl.NumberFormat("vi-VN", {
                                 style: "currency",
                                 currency: "VND",
                              }).format(inv.importPrice)}
                           </TableCell>
                           <TableCell align="right">
                              <Box
                                 sx={{
                                    display: "inline-flex",
                                    borderRadius: 1,
                                    padding: "2px 14px",
                                    color: inv.quantityInStock > 0 ? "var(--color-text-success)" : "var(--color-text-error)",
                                    bgcolor: inv.quantityInStock > 0 ? "var(--color-bg-success)" : "var(--color-bg-error)",
                                    fontWeight: 600,
                                    fontSize: 16,
                                 }}
                              >
                                 {inv.quantityInStock}
                              </Box>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={6} align="center">
                           No inventory batches
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </Card>

         {/* Price History Card */}
         <Card sx={{ p: 3 }}>
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
               }}
            >
               <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Price History
               </Typography>
               <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/warehouse-staff/medicines/${id}/prices`)}
               >
                  Manage Prices
               </Button>
            </Box>

            <Table size="small">
               <TableHead>
                  <TableRow>
                     <TableCell>Effective Date</TableCell>
                     <TableCell align="right">Unit Price</TableCell>
                     <TableCell align="center">Status</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {data.priceHistory.length > 0 ? (
                     data.priceHistory.map((price) => {
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
                                 {new Date(price.effectiveDate).toLocaleDateString("vi-VN")}
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
                           </TableRow>
                        );
                     })
                  ) : (
                     <TableRow>
                        <TableCell colSpan={3} align="center">
                           No price history
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </Card>
      </Box>
   );
}
