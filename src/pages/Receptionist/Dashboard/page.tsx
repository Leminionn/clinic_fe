import React, { useState } from 'react';
import { 
    Typography, 
    Box, 
    Button, 
    Container,
    Paper
} from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import AlertDialog from './alert';// Giả sử đường dẫn component AlertDialog
import { showMessage } from '../../../components/ActionResultMessage'; // Giả sử đường dẫn
import { apiCall } from '../../../api/api';
import { useNavigate } from 'react-router-dom';

export default function ReceptionistDashboard() {
  // State quản lý AlertDialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'error' | 'warning' | 'info'>('warning');
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Hàm mở dialog xác nhận End Session
  const handleConfirmEndSession = () => {
    setConfirmType('warning'); // Màu cam cảnh báo
    setConfirmMessage('Are you sure you want to end the current working session?');
    setIsConfirmDialogOpen(true);
  };

  // Hàm thực hiện End Session (sau khi user chọn Yes)
  const handleEndSession = async () => {
    console.log("Ending session...");
    
    // --- CHỖ GỌI API END SESSION THỰC TẾ ---
    // await apiCall('/receptionist/end-session', 'POST', ...);
    const accessToken = localStorage.getItem("accessToken");
    apiCall("receptionist/end_session","GET",accessToken?accessToken:"",null,(data:any)=>{
      showMessage("Session ended successfully!");
      alert("Session ended successfully!");
      setIsConfirmDialogOpen(false);
    },(data:any)=>{
      alert(data.message);
      
    })
    
    // Giả lập delay API


    /*await new Promise(resolve => setTimeout(resolve, 800));
    
    */
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Area */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Receptionist Dashboard
        </Typography>

        {/* Nút End Session */}
        <Button 
            variant="outlined" 
            color="error" 
            startIcon={<ExitToApp />}
            onClick={handleConfirmEndSession}
            sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                borderWidth: 1.5,
                fontWeight: 600,
                '&:hover': {
                    borderWidth: 1.5,
                    bgcolor: 'rgba(211, 47, 47, 0.04)'
                }
            }}
        >
            End Session
        </Button>
      </Box>

      {/* Nội dung Dashboard (Placeholder) */}
      <Paper 
        elevation={0} 
        sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: '#f5f7fa', 
            borderRadius: 2,
            border: '1px dashed #ccc',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Welcome back! Select an action from the menu to start.
        </Typography>
      </Paper>

      {/* Hộp thoại xác nhận */}
      <AlertDialog
        title={confirmMessage}
        type={confirmType}
        open={isConfirmDialogOpen}
        setOpen={setIsConfirmDialogOpen}
        buttonCancel="No"
        buttonConfirm="Yes"
        onConfirm={handleEndSession}
      />
    </Container>
  );
}