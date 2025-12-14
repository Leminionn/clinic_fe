import { useEffect, useState } from "react";
import {
   Box,
   Button,
   Card,
   TextField,
   Typography,
   Select,
   MenuItem,
   FormControl,
   InputLabel,
   Grid,
   Switch,
   FormControlLabel,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import {
   staffGetById,
   staffCreate,
   staffUpdate,
} from "../../../../api/urls";
import AlertDialog from "../../../../components/AlertDialog";

interface StaffForm {
   fullName: string;
   dateOfBirth: string;
   gender: string;
   email: string;
   phone: string;
   idCard: string;
   address: string;
   role: string;
   specialization: string;
   hireDate: string;
   active: boolean;
}

const emptyForm: StaffForm = {
   fullName: "",
   dateOfBirth: "",
   gender: "MALE",
   email: "",
   phone: "",
   idCard: "",
   address: "",
   role: "RECEPTIONIST",
   specialization: "",
   hireDate: new Date().toISOString().split("T")[0],
   active: true,
};

export default function CreateUpdateStaff() {
   const { id } = useParams();
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const [isEditMode, setIsEditMode] = useState(false);
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState<StaffForm>(emptyForm);
   const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
   const [confirmMessage, setConfirmMessage] = useState("");

   useEffect(() => {
      if (id) {
         setIsEditMode(true);
         const token = localStorage.getItem("accessToken");
         apiCall(
            staffGetById(Number(id)),
            "GET",
            token,
            null,
            (res: any) => {
               const staff = res.data;
               if (staff) {
                  setData({
                     fullName: staff.fullName || "",
                     dateOfBirth: staff.dateOfBirth?.split("T")[0] || "",
                     gender: staff.gender || "MALE",
                     email: staff.email || "",
                     phone: staff.phone || "",
                     idCard: staff.idCard || "",
                     address: staff.address || "",
                     role: staff.role || "RECEPTIONIST",
                     specialization: staff.specialization || "",
                     hireDate: staff.hireDate?.split("T")[0] || "",
                     active: staff.active ?? true,
                  });
               }
            },
            (err: any) => {
               console.error(err);
               showMessage("Cannot load staff information", "error");
            }
         );
      } else {
         // Get role from query params if provided
         const roleParam = searchParams.get("role");
         setData({
            ...emptyForm,
            role: roleParam || "RECEPTIONIST",
         });
         setIsEditMode(false);
      }
   }, [id, searchParams]);

   const handleChange = (field: keyof StaffForm, value: any) => {
      setData((prev) => ({ ...prev, [field]: value }));
   };

   const validateForm = () => {
      if (!data.fullName.trim()) {
         showMessage("Please enter full name", "error");
         return false;
      }
      if (!data.email.trim()) {
         showMessage("Please enter email", "error");
         return false;
      }
      if (!data.phone.trim()) {
         showMessage("Please enter phone number", "error");
         return false;
      }
      if (!data.idCard.trim()) {
         showMessage("Please enter ID card", "error");
         return false;
      }
      if (!data.dateOfBirth) {
         showMessage("Please select date of birth", "error");
         return false;
      }
      if (!data.hireDate) {
         showMessage("Please select hire date", "error");
         return false;
      }
      if (data.role === "DOCTOR" && !data.specialization.trim()) {
         showMessage("Please enter specialization for doctor", "error");
         return false;
      }
      return true;
   };

   const handleConfirm = () => {
      if (!validateForm()) return;

      setConfirmMessage(
         `Are you sure you want to ${isEditMode ? "update" : "create"} this staff?`
      );
      setIsConfirmDialogOpen(true);
   };

   const handleSubmit = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const payload = {
         fullName: data.fullName,
         dateOfBirth: data.dateOfBirth,
         gender: data.gender,
         email: data.email,
         phone: data.phone,
         idCard: data.idCard,
         address: data.address,
         role: data.role,
         specialization: data.role === "DOCTOR" ? data.specialization : undefined,
         hireDate: data.hireDate,
         active: data.active,
      };

      const url = isEditMode ? staffUpdate(Number(id)) : staffCreate;
      const method = isEditMode ? "PUT" : "POST";

      try {
         await apiCall(
            url,
            method,
            token,
            JSON.stringify(payload),
            () => {
               showMessage(
                  `${isEditMode ? "Update" : "Create"} staff successfully!`
               );
               setIsConfirmDialogOpen(false);
               // Navigate back to the appropriate list based on role
               const roleRoutes: any = {
                  DOCTOR: "/admin/staff/doctors",
                  RECEPTIONIST: "/admin/staff/receptionists",
                  WAREHOUSE_STAFF: "/admin/staff/warehouse-staffs",
               };
               navigate(roleRoutes[data.role] || "/admin/staff/doctors");
            },
            (err: any) => {
               console.error(err);
               showMessage(
                  err?.message ||
                  `Cannot ${isEditMode ? "update" : "create"} staff`,
                  "error"
               );
            }
         );
      } catch (err: any) {
         console.error("Unhandled API error", err);
         showMessage("An error occurred while calling the API", "error");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Box sx={{ p: 3 }}>
         {/* Header */}
         <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Button
               startIcon={<ChevronLeft />}
               onClick={() => navigate("/admin/staff")}
            >
               Back
            </Button>
            <Typography variant="h5" fontWeight="bold">
               {isEditMode ? "Edit Staff" : "Add New Staff"}
            </Typography>
         </Box>

         {/* Form */}
         <Card sx={{ p: 3 }}>
            <Grid container spacing={3}>
               {/* Full Name */}
               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Full Name"
                     required
                     value={data.fullName}
                     onChange={(e) => handleChange("fullName", e.target.value)}
                  />
               </Grid>

               {/* Role */}
               <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                     <InputLabel>Role</InputLabel>
                     <Select
                        value={data.role}
                        label="Role"
                        onChange={(e) => handleChange("role", e.target.value)}
                     >
                        <MenuItem value="DOCTOR">Doctor</MenuItem>
                        <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
                        <MenuItem value="WAREHOUSE_STAFF">Warehouse Staff</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>

               {/* Date of Birth */}
               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Date of Birth"
                     type="date"
                     required
                     value={data.dateOfBirth}
                     onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                     InputLabelProps={{ shrink: true }}
                  />
               </Grid>

               {/* Gender */}
               <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                     <InputLabel>Gender</InputLabel>
                     <Select
                        value={data.gender}
                        label="Gender"
                        onChange={(e) => handleChange("gender", e.target.value)}
                     >
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>

               {/* Email */}
               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Email"
                     type="email"
                     required
                     value={data.email}
                     onChange={(e) => handleChange("email", e.target.value)}
                  />
               </Grid>

               {/* Phone */}
               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Phone"
                     required
                     value={data.phone}
                     onChange={(e) => handleChange("phone", e.target.value)}
                  />
               </Grid>

               {/* ID Card */}
               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="ID Card"
                     required
                     value={data.idCard}
                     onChange={(e) => handleChange("idCard", e.target.value)}
                  />
               </Grid>

               {/* Hire Date */}
               <Grid item xs={12} md={6}>
                  <TextField
                     fullWidth
                     label="Hire Date"
                     type="date"
                     required
                     value={data.hireDate}
                     onChange={(e) => handleChange("hireDate", e.target.value)}
                     InputLabelProps={{ shrink: true }}
                  />
               </Grid>

               {/* Specialization (Only for Doctor) */}
               {data.role === "DOCTOR" && (
                  <Grid item xs={12} md={6}>
                     <TextField
                        fullWidth
                        label="Specialization"
                        required
                        value={data.specialization}
                        onChange={(e) =>
                           handleChange("specialization", e.target.value)
                        }
                     />
                  </Grid>
               )}

               {/* Position removed - handled by backend only */}

               {/* Address */}
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Address"
                     multiline
                     rows={2}
                     value={data.address}
                     onChange={(e) => handleChange("address", e.target.value)}
                  />
               </Grid>

               {/* Active Status */}
               <Grid item xs={12}>
                  <FormControlLabel
                     control={
                        <Switch
                           checked={data.active}
                           onChange={(e) => handleChange("active", e.target.checked)}
                        />
                     }
                     label="Active"
                  />
               </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
               <Button variant="outlined" onClick={() => navigate("/admin/staff")}>
                  Cancel
               </Button>
               <Button
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={loading}
               >
                  {isEditMode ? "Update" : "Create"}
               </Button>
            </Box>
         </Card>

         {/* Confirmation Dialog */}
         <AlertDialog
            title={confirmMessage}
            type="info"
            open={isConfirmDialogOpen}
            setOpen={setIsConfirmDialogOpen}
            buttonCancel="Cancel"
            buttonConfirm={isEditMode ? "Update" : "Create"}
            onConfirm={handleSubmit}
         />
      </Box>
   );
}
