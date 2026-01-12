import React from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Event, Person, MedicalServices, Notes, VisibilityOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import { useAuth } from "../../../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

// 1. Define Interface based on your Java Entity & JSON structure
export interface MedicalRecordDTO {
  recordId: number;
  doctorId: number;        // From public int getDoctorId()
  doctorName: string;      // From public String getDoctorName()
  examinateDate: string;   // Java Date -> String ISO
  symptoms: string;
  diagnosis: string;
  diseaseType: {           // Assuming RefDiseaseType is an object, adjust if it's just an ID or Name
    diseaseTypeId: number;
    diseaseTypeName: string;
  } | null;
  orderedServices: string;
  notes: string;
}

interface MedicalRecordsTabProps {
  patientId: number;
  medicalRecords: MedicalRecordDTO[]; // Recieved from parent component
}

export default function MedicalRecordsTab({ patientId, medicalRecords }: MedicalRecordsTabProps) {
  const role = useAuth();
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Medical Records History
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {medicalRecords.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: '#f9fafb',
            borderRadius: 2,
            border: '1px dashed #ccc'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No medical Record
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Examinate date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', width: '25%' }}>Symptoms and Diagnotics</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', width: '20%' }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', width: '15%' }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">Action</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {medicalRecords.map((row) => (
                <TableRow
                  key={row.recordId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, ':hover': { bgcolor: '#fdfdfd' }, verticalAlign: 'top' }}
                >
                  {/* ID */}
                  <TableCell component="th" scope="row">
                    #{row.recordId}
                  </TableCell>

                  {/* Exam Date */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Event fontSize="small" color="action" sx={{ width: 16 }} />
                      <Typography variant="body2" fontWeight={500}>
                        {row.examinateDate ? dayjs(row.examinateDate).format("DD/MM/YYYY") : "N/A"}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Doctor */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: '#e3f2fd', color: '#1976d2', fontSize: 14 }}
                      >
                        {row.doctorName ? row.doctorName.charAt(0) : <Person />}
                      </Avatar>
                      <Typography variant="body2">
                        Dr. {row.doctorName}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Diagnosis & Symptoms */}
                  <TableCell>
                    <Stack spacing={0.5}>
                      {row.diseaseType && (
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', display: 'block' }}>
                          [{row.diseaseType.diseaseTypeName}]
                        </Typography>
                      )}
                      <Typography variant="body2" fontWeight={600}>
                        {row.diagnosis || "No diagnotics"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 500 }}>Symptoms:</span> {row.symptoms || "N/A"}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Ordered Services */}
                  <TableCell>
                    {row.orderedServices ? (
                      <Box display="flex" gap={1} alignItems="start">
                        <MedicalServices fontSize="small" color="action" sx={{ mt: 0.3, width: 16 }} />
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {row.orderedServices}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">None</Typography>
                    )}
                  </TableCell>

                  {/* Notes */}
                  <TableCell>
                    {row.notes ? (
                      <Tooltip title={row.notes} arrow placement="top">
                        <Box display="flex" gap={1} alignItems="center" sx={{ cursor: 'pointer' }}>
                          <Notes fontSize="small" color="action" sx={{ width: 16 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.notes}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">-</Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Detail">
                      <IconButton
                        onClick={() => {
                          let prefix = "";
                          if (role.role == "Admin") prefix = "admin";
                          if (role.role == "Receptionist") prefix = "receptionist";
                          if (role.role == "Doctor") prefix = "doctor";
                          navigate(`/${prefix}/medical-records/${row.recordId}`)
                        }}
                        sx={{
                          color: 'var(--color-primary-main)',
                          border: '1px solid currentColor',
                          borderRadius: 1.5,
                          height: 32,
                          width: 32,
                          padding: 0,
                          opacity: 0.8,
                          '&:hover': {
                            opacity: 1,
                            bgcolor: 'rgba(25, 118, 210, 0.04)'
                          }
                        }}
                      >
                        <VisibilityOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
