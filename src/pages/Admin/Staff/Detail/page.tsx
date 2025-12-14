import { useEffect, useState } from "react";
import { Box, Button, Card, Typography, Chip, Grid, Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Edit, CalendarMonth } from "@mui/icons-material";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { staffGetById, staffDelete } from "../../../../api/urls";
import AlertDialog from "../../../../components/AlertDialog";

interface StaffDetail {
   staffId: number;
   fullName: string;
   dateOfBirth: string;
   gender: string;
   email: string;
   phone: string;
   idCard: string;
   address: string;
   role: string;
   specialization?: string;
   hireDate: string;
   active: boolean;
}

function getRoleLabel(role: string) {
   const labels: any = {
      DOCTOR: "Doctor",
      RECEPTIONIST: "Receptionist",
      WAREHOUSE_STAFF: "Warehouse Staff",
   };
   return labels[role] || role;
}

function getGenderLabel(gender: string) {
   const labels: any = {
      MALE: "Male",
      FEMALE: "Female",
      OTHER: "Other",
   };
   return labels[gender] || gender;
}

export default function StaffDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [data, setData] = useState<StaffDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

   useEffect(() => {
      if (!id) return;

      const token = localStorage.getItem("accessToken");
      apiCall(
         staffGetById(Number(id)),
         "GET",
         token,
         null,
         (res: any) => {
            setData(res.data || null);
            setLoading(false);
         },
         (err: any) => {
            console.error(err);
            setLoading(false);
            showMessage("Cannot load staff information", "error");
         }
      );
   }, [id]);

   const handleDeleteConfirm = () => {
      setIsConfirmDialogOpen(true);
   };

   const handleDelete = () => {
      const token = localStorage.getItem("accessToken");
      apiCall(
         staffDelete(Number(id)),
         "DELETE",
         token,
         null,
         () => {
            showMessage("Staff deleted successfully!");
            setIsConfirmDialogOpen(false);
            // Navigate back to the appropriate list based on role
            if (data?.role) {
               const roleRoutes: any = {
                  DOCTOR: "/admin/staff/doctors",
                  RECEPTIONIST: "/admin/staff/receptionists",
                  WAREHOUSE_STAFF: "/admin/staff/warehouse-staffs",
               };
               navigate(roleRoutes[data.role] || "/admin/staff/doctors");
            } else {
               navigate(-1);
            }
         },
         (err: any) => {
            console.error(err);
            showMessage(err?.message || "Cannot delete staff", "error");
         }
      );
   };

   if (loading) {
      return (
         <Box p={4} display="flex" justifyContent="center" alignItems="center">
            <Typography>Loading...</Typography>
         </Box>
      );
   }

   if (!data) {
      return (
         <Box p={4}>
            <Typography>Staff not found</Typography>
         </Box>
      );
   }

   return (
      <Box sx={{ p: 3 }}>
         {/* Header */}
         <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Button
               startIcon={<ChevronLeft />}
               onClick={() => navigate(-1)}
            >
               Back
            </Button>
            <Typography variant="h5" fontWeight="bold">
               Staff Details
            </Typography>
         </Box>

         {/* Content */}
         <Card sx={{ p: 3 }}>
            {/* Action Buttons */}
            <Box
               sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mb: 3,
               }}
            >
               <Button
                  variant="outlined"
                  startIcon={<CalendarMonth />}
                  onClick={() => navigate(`/admin/staff/schedule/${id}`)}
               >
                  View Schedule
               </Button>
               <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/admin/staff/edit/${id}`)}
               >
                  Edit
               </Button>
               <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteConfirm}
               >
                  Delete
               </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Staff Information */}
            <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.fullName}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Role
                  </Typography>
                  <Box mb={2}>
                     <Chip
                        label={getRoleLabel(data.role)}
                        size="small"
                        sx={{ mt: 0.5 }}
                     />
                  </Box>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {new Date(data.dateOfBirth).toLocaleDateString("en-US")}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Gender
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {getGenderLabel(data.gender)}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.email}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Phone
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.phone}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     ID Card
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.idCard}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Hire Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {new Date(data.hireDate).toLocaleDateString("en-US")}
                  </Typography>
               </Grid>

               {data.role === "DOCTOR" && data.specialization && (
                  <Grid item xs={12} md={6}>
                     <Typography variant="subtitle2" color="text.secondary">
                        Specialization
                     </Typography>
                     <Typography variant="body1" fontWeight={500} mb={2}>
                        {data.specialization}
                     </Typography>
                  </Grid>
               )}

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.address}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Status
                  </Typography>
                  <Box mb={2}>
                     <Chip
                        label={data.active ? "Active" : "Inactive"}
                        size="small"
                        color={data.active ? "success" : "error"}
                        sx={{ mt: 0.5 }}
                     />
                  </Box>
               </Grid>
            </Grid>
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
