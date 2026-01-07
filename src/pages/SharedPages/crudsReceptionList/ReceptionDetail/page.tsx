import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Grid, Typography, Box, Chip, Avatar, Divider, Button, Stack
} from '@mui/material';
import {
  Person, CalendarToday, Phone, Email, LocationOn, 
  Badge, ArrowBack, AssignmentTurnedIn
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../../../auth/AuthContext';
import { apiCall } from '../../../../api/api';

// --- Interfaces ---
interface Patient {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  idCard: string;
  address: string;
}

interface Staff {
  fullName: string;
  phone: string;
  email: string;
}

interface ReceptionDetailData {
  receptionId: number;
  receptionDate: string;
  status: string;
  patient: Patient;
  receptionist: Staff;
}
const fakeData: ReceptionDetailData = {
    receptionId: 1,
    receptionDate: "2025-01-05",
    status: "DONE",
    patient: {
      fullName: "Binh Le Dang 123",
      dateOfBirth: "2006-06-05",
      gender: "MALE",
      phone: "0823194",
      email: "email@gmail.com",
      idCard: "123456789",
      address: "Vinh Long",
    },
    receptionist: {
      fullName: "Receptionist 1",
      email: "receptionist3@example.com",
      phone: "0987123457",
    }
  };

export default function ReceptionDetail() {
  const navigate = useNavigate();
  const {id} = useParams();
  const {role} = useAuth();
  const [data, setData] = useState(fakeData);
  useEffect(()=>{
    let prefix="";
    if(role=="Receptionist") prefix="receptionist";
    if(role=="Admin") prefix="admin";
    if(role=="Doctor") prefix="doctor";
    const accessToken = localStorage.getItem("accessToken");
    apiCall(`${prefix}/reception/${id}`,"GET",accessToken?accessToken:"",null,(data:any)=>{
        const realData = {
            receptionId: data.data.receptionId,
            receptionDate: dayjs(data.data.receptionDate).format("DD/MM/YYYY"),
            status: data.data.status,
            patient: {
                fullName: data.data.patient.fullName,
                dateOfBirth: dayjs(data.data.patient.dateOfBirth).format("DD/MM/YYYY"),
                gender: data.data.patient.gender,
                phone: data.data.patient.phone,
                email: data.data.patient.email,
                idCard: data.data.patient.idCard,
                address: data.data.patient.address,
            },
            receptionist: {
                fullName: data.data.receptionist.fullName,
                email: data.data.receptionist.email,
                phone: data.data.receptionist.phone,
            }
        }
        setData(realData);
    },(data:any)=>{
        alert(data.message);
        navigate(`/${prefix}`);
    })
  },[id,role]);
  // Trong thực tế, bạn sẽ dùng receptionId từ URL để gọi API
  // const { id } = useParams();

  // Dữ liệu mẫu đã được lược bỏ các phần dư thừa
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'success';
      case 'IN_EXAMINATION': return 'warning';
      default: return 'default';
    }
  };

  const InfoItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)', color: 'primary.main', width: 40, height: 40 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
          {label.toUpperCase()}
        </Typography>
        <Typography variant="body1" fontWeight="500">
          {value || 'N/A'}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header & Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Back to list
        </Button>
        <Stack direction="row" spacing={2}>
          <Chip 
            label={`ID: #${data.receptionId}`} 
            variant="outlined" 
            sx={{ fontWeight: 'bold' }} 
          />
          <Chip 
            label={data.status} 
            color={getStatusColor(data.status)} 
            sx={{ fontWeight: 'bold' }} 
          />
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Patient Information Card */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e6ed' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Patient Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem icon={<Person />} label="Full Name" value={data.patient.fullName} />
                <InfoItem icon={<CalendarToday />} label="Date of Birth" value={dayjs(data.patient.dateOfBirth).format('DD/MM/YYYY')} />
                <InfoItem icon={<Badge />} label="ID Card" value={data.patient.idCard} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem icon={<Phone />} label="Phone Number" value={data.patient.phone} />
                <InfoItem icon={<Email />} label="Email Address" value={data.patient.email} />
                <InfoItem icon={<LocationOn />} label="Address" value={data.patient.address} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Reception & Staff Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e6ed', height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentTurnedIn /> Visit Details
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 4 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600">RECEPTION DATE</Typography>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {dayjs(data.receptionDate).format('DD/MM/YYYY')}
                </Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Handled By
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fbfcfe' }}>
                <Typography variant="body2" fontWeight="bold">{data.receptionist.fullName}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">{data.receptionist.email}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">{data.receptionist.phone}</Typography>
            </Paper>

            <Box sx={{ mt: 4 }}>
                <Button fullWidth variant="contained" color="primary" sx={{ borderRadius: 2, py: 1, fontWeight: 'bold' }}>
                    Print Reception Slip
                </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}