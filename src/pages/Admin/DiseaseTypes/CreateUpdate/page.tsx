import { useEffect, useState } from "react";
import { Box, Button, Card, FormControlLabel, IconButton, Switch, TextField, Typography, Checkbox, FormGroup } from "@mui/material";
import { ChevronLeft } from "lucide-react";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { useNavigate, useParams } from "react-router-dom";
import { apiCall } from "../../../../api/api";
import { diseaseTypesGetById, diseaseTypesCreate, diseaseTypesUpdate } from "../../../../api/urls";

interface DiseaseTypeForm {
   diseaseCode: string;
   diseaseName: string;
   description: string;
   isChronic: boolean;
   isContagious: boolean;
   isActive: boolean;
}

const emptyForm: DiseaseTypeForm = {
   diseaseCode: "",
   diseaseName: "",
   description: "",
   isChronic: false,
   isContagious: false,
   isActive: true,
};

export default function CreateUpdateDiseaseType() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [isEditMode, setIsEditMode] = useState(false);
   const [confirmMessage, setConfirmMessage] = useState("");
   const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
   const [loading, setLoading] = useState(false);

   const [data, setData] = useState<DiseaseTypeForm>(emptyForm);

   useEffect(() => {
      if (id) {
         setIsEditMode(true);
         const token = localStorage.getItem("accessToken");
         apiCall(
            diseaseTypesGetById(Number(id)),
            "GET",
            token,
            null,
            (res: any) => {
               const dt = res.data;
               if (dt) {
                  setData({
                     diseaseCode: dt.diseaseCode || "",
                     diseaseName: dt.diseaseName || "",
                     description: dt.description || "",
                     isChronic: dt.chronic ?? false,
                     isContagious: dt.contagious ?? false,
                     isActive: dt.active ?? true,
                  });
               }
            },
            (err: any) => {
               console.error(err);
               showMessage("Failed to load disease type", "error");
            }
         );
      } else {
         setData(emptyForm);
         setIsEditMode(false);
      }
   }, [id]);

   const handleConfirm = () => {
      if (!data.diseaseCode.trim() || !data.diseaseName.trim()) {
         showMessage("Please fill in required fields (Code and Name)", "error");
         return;
      }
      setConfirmMessage(
         `Are you sure you want to ${isEditMode ? "update" : "add"} this disease type?`
      );
      setIsConfirmDialogOpen(true);
   };

   const handleSubmit = () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const payload = {
         diseaseCode: data.diseaseCode,
         diseaseName: data.diseaseName,
         description: data.description,
         isChronic: data.isChronic,
         isContagious: data.isContagious,
         isActive: data.isActive,
      };

      if (isEditMode && id) {
         apiCall(
            diseaseTypesUpdate(Number(id)),
            "PUT",
            token,
            JSON.stringify(payload),
            () => {
               setLoading(false);
               showMessage("Disease type updated successfully!");
               setIsConfirmDialogOpen(false);
               navigate(`../detail/${id}`);
            },
            (err: any) => {
               setLoading(false);
               console.error(err);
               showMessage(err?.message || "Failed to update disease type", "error");
            }
         );
      } else {
         apiCall(
            diseaseTypesCreate,
            "POST",
            token,
            JSON.stringify(payload),
            (res: any) => {
               setLoading(false);
               showMessage("Disease type added successfully!");
               setIsConfirmDialogOpen(false);
               const newId = res.data?.diseaseTypeId;
               if (newId) {
                  navigate(`../detail/${newId}`);
               } else {
                  navigate("..");
               }
            },
            (err: any) => {
               setLoading(false);
               console.error(err);
               showMessage(err?.message || "Failed to create disease type", "error");
            }
         );
      }
   };

   return (
      <Box
         sx={{
            display: "flex",
            flexDirection: "column",
            padding: "26px 50px",
            gap: 3,
            height: "100%",
            overflowY: "auto",
         }}
      >
         {/* Header with back button */}
         <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => navigate("..")}>
               <ChevronLeft />
            </IconButton>
            <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
               Disease Types
            </Typography>
         </Box>

         <Box flex={1} p="6px">
            <Card
               sx={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "30px 40px",
                  gap: 1,
                  borderRadius: 2,
                  boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
               }}
            >
               <Typography sx={{ fontSize: "20px", fontWeight: "bold", mb: 2 }}>
                  {isEditMode ? "Update Disease Type" : "Add New Disease Type"}
               </Typography>

               <Box m={1} display="flex" gap={5}>
                  <Box flex={1}>
                     <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                        Disease Code <span style={{ color: "red" }}>*</span>
                     </Typography>
                     <TextField
                        value={data.diseaseCode}
                        onChange={(e) => setData({ ...data, diseaseCode: e.target.value })}
                        fullWidth
                        placeholder="e.g., ICD-10-A00"
                     />
                  </Box>

                  <Box flex={1}>
                     <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                        Disease Name <span style={{ color: "red" }}>*</span>
                     </Typography>
                     <TextField
                        value={data.diseaseName}
                        onChange={(e) => setData({ ...data, diseaseName: e.target.value })}
                        fullWidth
                        placeholder="e.g., Cholera"
                     />
                  </Box>
               </Box>

               <Box m={1}>
                  <Typography sx={{ fontSize: "16px", fontWeight: "bold" }}>
                     Description
                  </Typography>
                  <TextField
                     value={data.description}
                     onChange={(e) => setData({ ...data, description: e.target.value })}
                     fullWidth
                     multiline
                     rows={3}
                     placeholder="Enter description..."
                  />
               </Box>

               <Box m={1} display="flex" gap={5}>
                  <Box flex={1}>
                     <FormGroup>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 checked={data.isChronic}
                                 onChange={(e) => setData({ ...data, isChronic: e.target.checked })}
                              />
                           }
                           label="Chronic Disease"
                        />
                        <Typography variant="caption" color="text.secondary" ml={4}>
                           Long-term or recurring condition
                        </Typography>
                     </FormGroup>
                  </Box>

                  <Box flex={1}>
                     <FormGroup>
                        <FormControlLabel
                           control={
                              <Checkbox
                                 checked={data.isContagious}
                                 onChange={(e) => setData({ ...data, isContagious: e.target.checked })}
                              />
                           }
                           label="Contagious Disease"
                        />
                        <Typography variant="caption" color="text.secondary" ml={4}>
                           Can be transmitted from person to person
                        </Typography>
                     </FormGroup>
                  </Box>
               </Box>

               <Box m={1} display="flex" alignItems="center">
                  <FormControlLabel
                     control={
                        <Switch
                           checked={data.isActive}
                           onChange={(_, v) => setData({ ...data, isActive: v })}
                        />
                     }
                     label="Active"
                  />
               </Box>

               <Box display="flex" justifyContent="center" gap={2} mt={5}>
                  <Button
                     variant="outlined"
                     onClick={() => navigate("..")}
                     sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "bold",
                        padding: "8px 40px",
                     }}
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="contained"
                     onClick={handleConfirm}
                     disabled={loading}
                     sx={{
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: "bold",
                        padding: "8px 40px",
                     }}
                  >
                     {loading ? "Saving..." : isEditMode ? "Save" : "Add Disease Type"}
                  </Button>
               </Box>
            </Card>
         </Box>

         <AlertDialog
            title={confirmMessage}
            type="info"
            open={isConfirmDialogOpen}
            setOpen={setIsConfirmDialogOpen}
            buttonCancel="Cancel"
            buttonConfirm="Yes"
            onConfirm={handleSubmit}
         />
      </Box>
   );
}
