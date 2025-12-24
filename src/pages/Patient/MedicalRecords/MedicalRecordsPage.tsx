import React, { useEffect, useState } from "react";
import {
   Box,
   Card,
   CardContent,
   Typography,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Paper,
   Button,
   Chip,
   CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../api/api";
import type { MedicalRecord } from "../../../types/MedicalRecord";

const MedicalRecordsPage: React.FC = () => {
   const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
   const token = localStorage.getItem("accessToken");

   useEffect(() => {
      fetchMedicalRecords();
   }, []);

   const fetchMedicalRecords = () => {
      setLoading(true);
      apiCall(
         "patient/medical_records",
         "GET",
         token,
         null,
         (data: any) => {
            setMedicalRecords(data.data || []);
            setLoading(false);
         },
         (error: any) => {
            console.error("Failed to fetch medical records:", error);
            setLoading(false);
         }
      );
   };

   const handleViewDetail = (recordId: number) => {
      navigate(`/patient/medical-record/${recordId}`);
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

   return (
      <Box sx={{ padding: 3 }}>
         <Card>
            <CardContent>
               <Typography variant="h5" gutterBottom fontWeight="bold">
                  Medical Records History
               </Typography>
               <Typography variant="body2" color="text.secondary" gutterBottom>
                  View all your medical examination records
               </Typography>

               {medicalRecords.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                     <Typography variant="body1" color="text.secondary">
                        No medical records found
                     </Typography>
                  </Box>
               ) : (
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                     <Table>
                        <TableHead>
                           <TableRow>
                              <TableCell><strong>Examination Date</strong></TableCell>
                              <TableCell><strong>Doctor</strong></TableCell>
                              <TableCell><strong>Diagnosis</strong></TableCell>
                              <TableCell><strong>Disease Type</strong></TableCell>
                              <TableCell><strong>Actions</strong></TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {medicalRecords.map((record) => (
                              <TableRow key={record.recordId}>
                                 <TableCell>
                                    {new Date(record.examinateDate).toLocaleDateString(
                                       "en-US"
                                    )}
                                 </TableCell>
                                 <TableCell>{record.doctorName}</TableCell>
                                 <TableCell>{record.diagnosis || "N/A"}</TableCell>
                                 <TableCell>
                                    {record.diseaseType ? (
                                       <Chip
                                          label={record.diseaseType.diseaseName}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                       />
                                    ) : (
                                       "N/A"
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    <Button
                                       variant="contained"
                                       size="small"
                                       onClick={() => handleViewDetail(record.recordId)}
                                    >
                                       View Details
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </TableContainer>
               )}
            </CardContent>
         </Card>
      </Box>
   );
};

export default MedicalRecordsPage;
