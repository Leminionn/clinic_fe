import { Error, Warning } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button
} from "@mui/material";
import { Info } from "lucide-react";

interface AlertDialogProps {
  title: string
  type: 'warning' | 'error' | 'info'
  buttonCancel: string
  buttonConfirm: string
  open: boolean
  setOpen: (open: boolean) => void
  onConfirm: () => void
  loading?: boolean
}

export default function AlertDialog({
  title,
  type,
  buttonCancel,
  buttonConfirm,
  open,
  setOpen,
  onConfirm,
  loading = false
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        '& .MuiPaper-root': {
          padding: '20px 4px',
          borderRadius: '15px'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {type === 'error' && <Error style={{ color: 'var(--color-text-error)', width: '50px', height: '50px' }} />}
        {type === 'warning' && <Warning style={{ color: 'var(--color-warning-main)', width: '50px', height: '50px' }} />}
        {type === 'info' && <Info style={{ color: 'var(--color-primary-main)', width: '50px', height: '50px' }} />}
        {title}
      </DialogTitle>

      <DialogActions sx={{ alignSelf: 'center', }}>
        <Button onClick={() => setOpen(false)}
          disabled={loading}
          sx={{
            fontSize: "14px",
            fontWeight: "bold",
            color: 'black',
            textTransform: "none",
          }}
        >
          {buttonCancel}
        </Button>

        <Button variant="contained" onClick={onConfirm}
          disabled={loading}
          sx={{
            fontSize: "14px",
            fontWeight: "bold",
            borderRadius: '8px',
            textTransform: "none",
            bgcolor: type == 'error' ? 'var(--color-text-error)'
              : type == 'warning' ? 'var(--color-warning-main)'
                : 'var(--color-primary-main)',
          }}
        >
          {loading ? 'Processing...' : buttonConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
