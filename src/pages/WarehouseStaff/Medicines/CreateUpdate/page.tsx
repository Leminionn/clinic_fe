import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
   Box,
   Card,
   Typography,
   Button,
   TextField,
   Select,
   MenuItem,
   FormControl,
   InputLabel,
   Grid,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import {
   warehouseMedicineById,
   warehouseMedicineCreate,
   warehouseMedicineUpdate,
} from "../../../../api/urls";
import {
   type MedicineRequest,
   EMedicineUnit,
   EMedicineStorageCondition,
} from "../../../../types/Medicine";

export default function MedicineCreateUpdatePage() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const isEditMode = Boolean(id);

   const [formData, setFormData] = useState<MedicineRequest>({
      medicineName: "",
      unit: EMedicineUnit.TABLET,
      concentration: "",
      form: "",
      manufacturer: "",
      usageInstructions: "",
      image: "",
      storageCondition: EMedicineStorageCondition.NORMAL,
   });
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (isEditMode && id) {
         const token = localStorage.getItem("accessToken");
         apiCall(
            warehouseMedicineById(Number(id)),
            "GET",
            token,
            null,
            (res: any) => {
               const medicine = res.data.medicine;
               setFormData({
                  medicineName: medicine.medicineName,
                  unit: medicine.unit,
                  concentration: medicine.concentration || "",
                  form: medicine.form || "",
                  manufacturer: medicine.manufacturer || "",
                  usageInstructions: medicine.usageInstructions || "",
                  image: medicine.image || "",
                  storageCondition: medicine.storageCondition,
               });
            },
            (err: any) => {
               console.error(err);
               showMessage("Error loading medicine information", "error");
            }
         );
      }
   }, [id, isEditMode]);

   const handleChange = (field: keyof MedicineRequest, value: any) => {
      setFormData((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleSubmit = () => {
      if (!formData.medicineName.trim()) {
         showMessage("Please enter medicine name", "error");
         return;
      }

      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const url = isEditMode
         ? warehouseMedicineUpdate(Number(id))
         : warehouseMedicineCreate;
      const method = isEditMode ? "PUT" : "POST";

      apiCall(
         url,
         method,
         token,
         JSON.stringify(formData),
         () => {
            showMessage(
               isEditMode
                  ? "Medicine updated successfully"
                  : "Medicine added successfully",
               "success"
            );
            navigate("/warehouse-staff/medicines");
         },
         (err: any) => {
            console.error(err);
            showMessage(
               err?.response?.data?.message ||
               `Error ${isEditMode ? "updating" : "adding"} medicine`,
               "error"
            );
            setLoading(false);
         }
      );
   };

   return (
      <Box sx={{ p: 3 }}>
         <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/warehouse-staff/medicines")}
            sx={{ mb: 2 }}
         >
            Back to List
         </Button>

         <Card sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
               {isEditMode ? "Edit Medicine" : "Add New Medicine"}
            </Typography>

            <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                  <TextField
                     label="Medicine Name *"
                     value={formData.medicineName}
                     onChange={(e) => handleChange("medicineName", e.target.value)}
                     fullWidth
                     required
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     label="Manufacturer"
                     value={formData.manufacturer}
                     onChange={(e) => handleChange("manufacturer", e.target.value)}
                     fullWidth
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                     <InputLabel>Unit *</InputLabel>
                     <Select
                        value={formData.unit}
                        onChange={(e) => handleChange("unit", e.target.value)}
                        label="Unit *"
                     >
                        {Object.values(EMedicineUnit).map((unit) => (
                           <MenuItem key={unit} value={unit}>
                              {unit}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Concentration"
                     value={formData.concentration}
                     onChange={(e) => handleChange("concentration", e.target.value)}
                     fullWidth
                     placeholder="e.g. 500mg, 10mg/ml"
                  />
               </Grid>

               <Grid item xs={12} md={4}>
                  <TextField
                     label="Dosage Form"
                     value={formData.form}
                     onChange={(e) => handleChange("form", e.target.value)}
                     fullWidth
                     placeholder="e.g. Tablet, Capsule"
                  />
               </Grid>

               <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                     <InputLabel>Storage Condition</InputLabel>
                     <Select
                        value={formData.storageCondition}
                        onChange={(e) =>
                           handleChange("storageCondition", e.target.value)
                        }
                        label="Storage Condition"
                     >
                        {Object.values(EMedicineStorageCondition).map((condition) => (
                           <MenuItem key={condition} value={condition}>
                              {condition}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </Grid>

               <Grid item xs={12} md={6}>
                  <TextField
                     label="Image URL"
                     value={formData.image}
                     onChange={(e) => handleChange("image", e.target.value)}
                     fullWidth
                     placeholder="https://example.com/image.jpg"
                  />
               </Grid>

               <Grid item xs={12}>
                  <TextField
                     label="Usage Instructions"
                     value={formData.usageInstructions}
                     onChange={(e) =>
                        handleChange("usageInstructions", e.target.value)
                     }
                     fullWidth
                     multiline
                     rows={3}
                  />
               </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
               <Button
                  variant="outlined"
                  onClick={() => navigate("/warehouse-staff/medicines")}
               >
                  Cancel
               </Button>
               <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSubmit}
                  disabled={loading}
               >
                  {isEditMode ? "Update" : "Add"}
               </Button>
            </Box>
         </Card>
      </Box>
   );
}
