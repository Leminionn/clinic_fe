import { Avatar, Box, Button, Card, Checkbox, CircularProgress, FormControlLabel, InputAdornment, TextField, Typography } from "@mui/material";
import { ArrowRight, Mail, MapPin, Phone, Search } from "lucide-react";
import { useState } from "react";
import type { Patient } from "../../../../types/Patient";
import dayjs from "dayjs";
import { apiCall } from "../../../../api/api";
import { useNavigate } from "react-router-dom";

const fakePatient: Patient = {
  patientId: 1,
  fullName: "Nguyen Van An",
  dateOfBirth: "2025-10-11T09:30:00",
  gender: "Male",
  address: "12 Nguyen Trai, Ha Noi",
  phone: "0901234567",
  email: "an.nguyen@example.com",
  idCard: "012345678901",
  firstVisitDate: "2023-01-10",
}

export default function PatientInformation({
  onSelectPatient,
  onCreateNew,
}: {
  onSelectPatient: (patient: Patient) => void;
  onCreateNew: () => void;
}) {
  const [patientIdCard, setPatientIdCard] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notFound, setNotFound] = useState(false);
  const navigate= useNavigate();
  const handleSearch = async () => {
    if (!patientIdCard.trim()) return;

    setLoading(true);
    setNotFound(false);
    setPatient(null);

    
      let res = fakePatient;
      const accessToken = localStorage.getItem("accessToken");
      apiCall(`receptionist/find_patient?idCard=${patientIdCard}`,'GET',accessToken?accessToken:"",null,(data:any)=>{
        res = {
          patientId: data.data.patientId,
          address: data.data.address,
          firstVisitDate: dayjs(data.data.firstVisitDate).format("DD/MM/YYYY"), 
          fullName: data.data.fullName,
          dateOfBirth: dayjs(data.data.dateOfBirth).format("DD/MM/YYYY"),
          gender: data.data.gender,
          email: data.data.email,
          phone: data.data.phone,
          idCard: data.data.idCard
        };
        setPatient(res);
        setLoading(false);
      },(data:any)=>{
        if(data.statusCode==404){
          setNotFound(true);
          setLoading(false);
        }
        else {
          alert(data.message);
          navigate("/receptionist");
        }
      })
      
    
  };

  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      mb: 3,
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography sx={{ fontWeight: 'bold', mb: 2.5, }}>
        Patient Information
      </Typography>

      <TextField
        value={patientIdCard}
        onChange={(e) => setPatientIdCard(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search by patient id card"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={22} color="var(--color-text-secondary)" />
            </InputAdornment>
          ),
        }}
        sx={{
          bgcolor: "var(--color-bg-input)",
          borderRadius: 3,
          mb: 2,
          '& .MuiInputBase-root': {
            pl: '18px',
          },
          '& .MuiInputBase-input': {
            py: '10px',
            pl: 1,
            pr: 3
          },
          '& fieldset': {
            border: 'none'
          },
        }}
      />

      {/* LOADING */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress size={50} />
        </Box>
      ) : patient ? (
        <Box sx={{
          p: 2.5,
          borderRadius: 2,
          border: "1px solid #ddd",
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, }}>
            <Avatar alt={patient.fullName} sx={{ height: 60, width: 60, }} />
            <Box>
              <Typography fontWeight={600}>
                {patient.fullName}
              </Typography>
              <Typography fontSize={14} color="var(--color-text-secondary)">
                {patient.gender}, {dayjs(patient.dateOfBirth).format("DD/MM/YYYY")}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, color: 'var(--color-text-secondary)', }}>
            <Phone size={16} color="var(--color-text-primary)" />
            {patient.phone}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'var(--color-text-secondary)', }}>
            <Mail size={16} color="var(--color-text-primary)" />
            {patient.email}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: 'var(--color-text-secondary)', }}>
            <MapPin size={16} color="var(--color-text-primary)" />
            {patient.address}
          </Box>

          <FormControlLabel
            control={<Checkbox />}
            label="Select patient"
            sx={{
              mt: 2,
              "& .MuiCheckbox-root": {
                p: 0,
                pl: '9px',
                mr: 1,
              },
              "& .MuiFormControlLabel-label": {
                fontWeight: 'bold',
              },
            }}
            onClick={() => onSelectPatient(patient)}
          />
        </Box>
      ) : notFound && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 5,
        }}>
          <Typography color="var(--color-text-secondary)">
            Patient not found
          </Typography>
          <Button
            sx={{
              display: 'flex',
              gap: 1,
              textTransform: 'none'
            }}
            onClick={() => onCreateNew}>
            Add Patient
            <ArrowRight />
          </Button>
        </Box>
      )}
    </Card >
  );
}