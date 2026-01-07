import React, { useState, useEffect, useRef } from 'react';
import { 
    Typography, Box, Button, Container, Paper, TextField, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Stack, Divider, Tooltip,
    Grid,
    ButtonGroup
} from '@mui/material';
import { 
    ExitToApp, Search, HowToReg, PlayCircleOutline, 
    History, PersonAdd, AccessTime, Today, AddLocationAlt,
    AssignmentInd, AppRegistration
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AlertDialog from './alert';
import { showMessage } from '../../../components/ActionResultMessage'; 
import { apiCall } from '../../../api/api';
import dayjs from 'dayjs';
import NewReceptionForm from '../../SharedPages/crudsReceptionList/ReceptionList/NewReception';

// --- Types ---
interface Appointment {
    id: string;
    patientName: string;
    time: string;
    status: string;
}

export default function ReceptionistDashboard() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [isNewFormOpen, setIsNewFormOpen] = useState(false);

    // --- Logic gọi API (Giữ nguyên) ---
    const fetchTodayAppointments = () => {
        const today = dayjs().format("YYYY-MM-DD");
        const url = `receptionist/all_receptions?pageNumber=0&pageSize=1000&date=${today}`;
        const accessToken = localStorage.getItem("accessToken");
        apiCall(url, "GET", accessToken ? accessToken : "", null, (data: any) => {
            const appointmentData = data.data.content.map((item: any) => {
                return {
                    id: item.receptionId,
                    patientName: item.patient ? item.patient.patientName : "",
                    time: dayjs(item.receptionDate).format("DD/MM/YYYY"),
                    status: item.status
                }
            });
            setAppointments(appointmentData);
        }, (data: any) => {
            alert(data.message);
            navigate("/login");
        });
    };

    useEffect(() => {
        fetchTodayAppointments();
    }, []);

    // --- Các hàm xử lý nghiệp vụ mới (Placeholder) ---
    const handleAddNewPatient = () => {
       
        navigate('/receptionist/patients/create-patient');
    };

    const handleCreateAppointment = () => {
        navigate('/receptionist/appointments/new');
    };

    const handleQuickReception = () => {
       setIsNewFormOpen(true);
    };

    const handleEndSession = async () => {
        const accessToken = localStorage.getItem("accessToken");
        apiCall("receptionist/end_session", "GET", accessToken || "", null, () => {
            showMessage("Session ended successfully!");
            setIsConfirmDialogOpen(false);
            navigate('/login');
        }, (err: any) => alert(err.message));
    };

    const filteredAppointments = appointments.filter(app => {
        if(!searchTerm) return "";
        app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase())}
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header Area với các nút chức năng chính */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="primary.main">
                        Reception Desk
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <Today fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            Today: {dayjs().format('DD/MM/YYYY')}
                        </Typography>
                    </Stack>
                </Box>

                {/* Khối nút nghiệp vụ UI */}
                <Stack direction="row" spacing={1.5}>
                    <Button 
                        variant="contained" 
                        color="success" 
                        startIcon={<PersonAdd />}
                        onClick={handleAddNewPatient}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        New Patient
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AppRegistration />}
                        onClick={handleCreateAppointment}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Book Appointment
                    </Button>
                    <Button 
                        variant="contained" 
                        color="info" 
                        startIcon={<AssignmentInd />}
                        onClick={handleQuickReception}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Quick Reception
                    </Button>
                    
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    
                    <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<ExitToApp />} 
                        onClick={() => {
                            setConfirmMessage("Do you want to end today's session?");
                            setIsConfirmDialogOpen(true);
                        }}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        End Session
                    </Button>
                </Stack>
            </Box>

            {/* Thanh tìm kiếm và bộ lọc */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e0e6ed', bgcolor: '#fbfcfe' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Find by name or medical ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><Search color="primary"/></InputAdornment>),
                                sx: { borderRadius: 2, bgcolor: 'white' }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} textAlign="right">
                        <Stack direction="row" spacing={3} justifyContent="flex-end">
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">TOTAL</Typography>
                                <Typography variant="body1" fontWeight="bold">{appointments.length}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">ARRIVED</Typography>
                                <Typography variant="body1" fontWeight="bold" color="primary.main">
                                    {appointments.filter(a => a.status === 'Arrived').length}
                                </Typography>
                            </Box>
                            <Button size="small" variant="text" startIcon={<History />} onClick={fetchTodayAppointments}>
                                Refresh List
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Bảng danh sách tiếp nhận */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #eef2f6' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Time</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Patient Details</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Current Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAppointments.map((app) => (
                            <TableRow key={app.id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="600">{app.time}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="700">{app.patientName}</Typography>
                                    <Typography variant="caption" color="text.secondary">ID: {app.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={app.status} 
                                        size="small" 
                                        sx={{ 
                                            fontWeight: 'bold', fontSize: '0.7rem',
                                            bgcolor: app.status === 'Arrived' ? '#e0f2fe' : app.status === 'Completed' ? '#dcfce7' : '#f1f5f9',
                                            color: app.status === 'Arrived' ? '#0369a1' : app.status === 'Completed' ? '#15803d' : '#475569'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    {app.status === 'Scheduled' && (
                                        <Button 
                                            size="small" 
                                            variant="outlined"
                                            startIcon={<HowToReg />} 
                                            onClick={() => {
                                                // handleCheckIn logic hiện tại
                                                setAppointments(prev => prev.map(a => a.id === app.id ? {...a, status: 'Arrived'} : a));
                                                showMessage("Checked in!");
                                            }}
                                        >
                                            Reception
                                        </Button>
                                    )}
                                    {app.status === 'Arrived' && (
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            color="primary" 
                                            startIcon={<PlayCircleOutline />}
                                            onClick={() => navigate('/smart-consultation')}
                                            sx={{ borderRadius: 5, fontSize: '0.7rem', px: 2 }}
                                        >
                                            AI Scan
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <AlertDialog
                title={confirmMessage}
                type="warning"
                open={isConfirmDialogOpen}
                setOpen={setIsConfirmDialogOpen}
                buttonCancel="No"
                buttonConfirm="Yes"
                onConfirm={handleEndSession}
            />

            <NewReceptionForm
                    open={isNewFormOpen}
                    onClose={() => setIsNewFormOpen(false)}
                    onConfirm={(patientId: number) => {
                      
                      const data = {
                        patientId:patientId,
                        receptionDate: new Date().toISOString()
                      }
                      const accessToken = localStorage.getItem("accessToken");
                      apiCall("receptionist/reception/create","POST",accessToken?accessToken:"",JSON.stringify(data),
                    (data:any)=>{
                      showMessage("Received patient successfully!");
                      setIsNewFormOpen(false);
                    },
                  (data:any)=>{
                    showMessage(data.message);
                  })
                      
                    }}
                    onAppointmentCheckIn={(appointmentId: number) => {
                      showMessage("Checked in successfully!");
            
                      setIsNewFormOpen(false);
                    }}
                  />
        </Container>
    );
}