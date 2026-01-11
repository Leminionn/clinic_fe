import React, { useEffect, useState } from "react";
import {
   Box,
   Card,
   CardContent,
   Typography,
   Divider,
   Button,
   Chip,
   CircularProgress,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Paper,
   Stack,
   Collapse,
} from "@mui/material";
import { ChevronLeft, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { apiCall } from "../../../api/api";
import type {
   MedicalRecord,
   Prescription,
   PrescriptionDetail,
} from "../../../types/MedicalRecord";

const MedicalRecordDetailPage: React.FC = () => {
   const { recordId } = useParams<{ recordId: string }>();
   const navigate = useNavigate();
   const token = localStorage.getItem("accessToken");

   const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
      null
   );
   const [loading, setLoading] = useState(true);
   const [expandedDetails, setExpandedDetails] = useState(false);

   useEffect(() => {
      if (recordId) {
         fetchMedicalRecordDetail();
      }
   }, [recordId]);

   const fetchMedicalRecordDetail = () => {
      setLoading(true);
      apiCall(
         `patient/medical-records/${recordId}`,
         "GET",
         token,
         null,
         (data: any) => {
            const record = data.data;
            setMedicalRecord(record);

            // New DTO structure already includes prescription
            if (record.prescription) {
               setPrescription(record.prescription);
               setPrescriptionDetails(record.prescription.prescriptionDetail || []);
            }

            setLoading(false);
         },
         (error: any) => {
            console.error("Failed to fetch medical record:", error);
            setLoading(false);
         }
      );
   };

   // const handleOpenRecordDialog = () => {
   //    setExpandedDetails(!expandedDetails);
   // };

   const handleOpenRecordDialog = () => {
      setExpandedDetails(!expandedDetails);
   };

   if (loading) {
      return (
         <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
         >
            <CircularProgress />
         </Box>
      );
   }

   if (!medicalRecord) {
      return (
         <Box sx={{ padding: 3 }}>
            <Typography>Medical record not found</Typography>
         </Box>
      );
   }

   return (
      <Box sx={{ padding: 3 }}>
         {/* Header with Back Button */}
         <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Button
               startIcon={<ChevronLeft />}
               onClick={() => navigate(-1)}
               variant="outlined"
            >
               Back
            </Button>
            <Typography variant="h5" fontWeight="bold">
               Medical Record Details
            </Typography>
         </Box>

         <Card sx={{ mb: 3 }}>
            <CardContent>
               <Typography variant="h6" gutterBottom fontWeight="600">
                  Examination Information
               </Typography>
               <Divider sx={{ my: 2 }} />

               <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                        Examination Date
                     </Typography>
                     <Typography variant="body1" gutterBottom>
                        {new Date(medicalRecord.examinateDate).toLocaleDateString(
                           "en-US"
                        )}
                     </Typography>
                  </Box>
                  <Box>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                        Doctor
                     </Typography>
                     <Typography variant="body1" gutterBottom>
                        {medicalRecord.doctorName}
                     </Typography>
                  </Box>
                  <Box>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                        Symptoms
                     </Typography>
                     <Typography variant="body1" gutterBottom>
                        {medicalRecord.symptoms || "N/A"}
                     </Typography>
                  </Box>
                  <Box>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                        Diagnosis
                     </Typography>
                     <Typography variant="body1" gutterBottom>
                        {medicalRecord.diagnosis || "N/A"}
                     </Typography>
                  </Box>
                  <Box>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                        Disease Type
                     </Typography>
                     {medicalRecord.diseaseType ? (
                        <Chip
                           label={`${medicalRecord.diseaseType.diseaseName} (${medicalRecord.diseaseType.diseaseCode})`}
                           color="primary"
                           variant="outlined"
                        />
                     ) : (
                        <Typography variant="body1">N/A</Typography>
                     )}
                  </Box>
                  <Box>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                        Ordered Services
                     </Typography>
                     {Array.isArray(medicalRecord.orderedServices) && medicalRecord.orderedServices.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                           {medicalRecord.orderedServices.map((service, index) => (
                              <Chip
                                 key={index}
                                 label={`${service.serviceName || 'Unknown Service'} (x${service.quantity})`}
                                 color="secondary"
                                 variant="outlined"
                                 size="small"
                                 sx={{ mb: 0.5 }}
                              />
                           ))}
                        </Stack>
                     ) : (
                        <Typography variant="body1" gutterBottom>
                           No services ordered
                        </Typography>
                     )}
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                     <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                        Notes
                     </Typography>
                     <Typography variant="body1" gutterBottom>
                        {medicalRecord.notes || "N/A"}
                     </Typography>
                  </Box>
               </Box>

               {/* Additional Information - Hidden from patients as these are internal/technical details */}
               {/* <Box sx={{ mt: 3 }}>
                  <Button
                     variant="outlined"
                     color="primary"
                     onClick={handleOpenRecordDialog}
                     endIcon={expandedDetails ? <ExpandLess /> : <ExpandMore />}
                  >
                     {expandedDetails ? "Hide" : "View"} Additional Record Details
                  </Button>
               </Box> */}

               {/* Expandable Additional Details */}
               {/* <Collapse in={expandedDetails} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                     <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Additional Information
                     </Typography>
                     <Divider sx={{ my: 1 }} />
                     <Stack spacing={2} sx={{ mt: 2 }}>
                        <Box>
                           <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                              Record ID
                           </Typography>
                           <Typography variant="body1">{medicalRecord.recordId}</Typography>
                        </Box>
                        <Box>
                           <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                              Doctor ID
                           </Typography>
                           <Typography variant="body1">{medicalRecord.doctorId}</Typography>
                        </Box>
                        <Box>
                           <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                              Doctor Name
                           </Typography>
                           <Typography variant="body1">
                              {medicalRecord.doctorName}
                           </Typography>
                        </Box>
                        {medicalRecord.diseaseType && (
                           <>
                              <Box>
                                 <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                                    Disease Type ID
                                 </Typography>
                                 <Typography variant="body1">
                                    {medicalRecord.diseaseType.diseaseTypeId}
                                 </Typography>
                              </Box>
                              <Box>
                                 <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                                    ICD Code
                                 </Typography>
                                 <Typography variant="body1">
                                    {medicalRecord.diseaseType.diseaseCode}
                                 </Typography>
                              </Box>
                           </>
                        )}
                     </Stack>
                  </Box>
               </Collapse> */}
            </CardContent>
         </Card>

         {/* Prescription Section */}
         {medicalRecord?.prescription && (
            <Card>
               <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                     Prescription
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                     <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                           Prescription Date
                        </Typography>
                        <Typography variant="body1">
                           {new Date(medicalRecord.prescription.prescriptionDate).toLocaleDateString(
                              "en-US"
                           )}
                        </Typography>
                     </Box>
                     <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                           Prescription Notes
                        </Typography>
                        <Typography variant="body1">
                           {medicalRecord.prescription.notes || "N/A"}
                        </Typography>
                     </Box>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom fontWeight="600">
                     Medications
                  </Typography>
                  {!medicalRecord.prescription.prescriptionDetail || medicalRecord.prescription.prescriptionDetail.length === 0 ? (
                     <Typography variant="body2" color="text.secondary">
                        No medications in this prescription
                     </Typography>
                  ) : (
                     <TableContainer component={Paper}>
                        <Table>
                           <TableHead>
                              <TableRow>
                                 <TableCell><strong>Medicine Name</strong></TableCell>
                                 <TableCell><strong>Quantity</strong></TableCell>
                                 <TableCell><strong>Unit</strong></TableCell>
                                 <TableCell><strong>Dosage</strong></TableCell>
                                 <TableCell><strong>Duration</strong></TableCell>
                                 <TableCell><strong>Status</strong></TableCell>
                              </TableRow>
                           </TableHead>
                           <TableBody>
                              {medicalRecord.prescription.prescriptionDetail.map((detail, index) => (
                                 <TableRow key={index}>
                                    <TableCell>{detail.medicine.medicineName}</TableCell>
                                    <TableCell>{detail.quantity}</TableCell>
                                    <TableCell>{detail.medicine.unit}</TableCell>
                                    <TableCell>{detail.dosage}</TableCell>
                                    <TableCell>{detail.days} days</TableCell>
                                    <TableCell>
                                       <Chip
                                          label={
                                             detail.dispenseStatus === "DISPENSED" ? "Dispensed" :
                                                detail.dispenseStatus === "PENDING" ? "Pending" :
                                                   detail.dispenseStatus === "CANCELLED" ? "Cancelled" : detail.dispenseStatus
                                          }
                                          size="small"
                                          color={
                                             detail.dispenseStatus === "DISPENSED" ? "success" :
                                                detail.dispenseStatus === "PENDING" ? "warning" : "default"
                                          }
                                       />
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </TableContainer>
                  )}
               </CardContent>
            </Card>
         )}

         {!medicalRecord?.prescription && (
            <Card>
               <CardContent>
                  <Typography variant="body2" color="text.secondary">
                     No prescription available for this medical record
                  </Typography>
               </CardContent>
            </Card>
         )}
      </Box>
   );
};

export default MedicalRecordDetailPage;
