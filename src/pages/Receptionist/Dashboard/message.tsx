// Trong ứng dụng thực tế, bạn có thể dùng Context API và Snackbar của MUI
// Ở đây tôi dùng một implementation đơn giản để demo, hoặc có thể tích hợp Snackbar nếu muốn.

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

// Biến toàn cục để trigger message (chỉ dùng cho mục đích demo đơn giản này)
// Trong production nên dùng Context hoặc Redux
let showMessageCallback: ((message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void) | null = null;

export const showMessage = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  if (showMessageCallback) {
    showMessageCallback(message, severity);
  } else {
    // Fallback nếu component chưa mount
    console.log(`[${severity.toUpperCase()}] ${message}`);
    alert(message);
  }
};

export default function ActionResultMessage() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    showMessageCallback = (message, severity) => {
      setMsg(message);
      setSeverity(severity || 'success');
      setOpen(true);
    };
    return () => {
      showMessageCallback = null;
    };
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {msg}
      </Alert>
    </Snackbar>
  );
}