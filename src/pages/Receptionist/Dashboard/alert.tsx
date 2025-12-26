import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

interface AlertDialogProps {
  title: string;
  type?: 'error' | 'warning' | 'info';
  open: boolean;
  setOpen: (open: boolean) => void;
  buttonCancel?: string;
  buttonConfirm?: string;
  onConfirm: () => void;
}

export default function AlertDialog({
  title,
  type = 'info',
  open,
  setOpen,
  buttonCancel = 'Cancel',
  buttonConfirm = 'Confirm',
  onConfirm
}: AlertDialogProps) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  // Màu sắc nút dựa trên type (tùy chọn)
  const confirmColor = type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Confirmation'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {title}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          {buttonCancel}
        </Button>
        <Button onClick={handleConfirm} color={confirmColor} autoFocus variant="contained">
          {buttonConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}