import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, FormControlLabel, Switch } from "@mui/material";
import { apiCall } from "../../../../api/api";
import { paymentMethodsCreate } from "../../../../api/urls";

export default function CreatePaymentMethod({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void; }) {
  const [methodCode, setMethodCode] = useState("");
  const [methodName, setMethodName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [active, setActive] = useState(true);

  const handleSave = () => {
    const token = localStorage.getItem("accessToken");
    const payload = {
      methodCode,
      methodName,
      description,
      sortOrder,
      isActive: active,
    };

    apiCall(paymentMethodsCreate, "POST", token, JSON.stringify(payload), () => {
      onSaved();
      // Reset form
      setMethodCode("");
      setMethodName("");
      setDescription("");
      setSortOrder(0);
      setActive(true);
    }, (err: any) => {
      console.error(err);
      alert(err?.message || "Failed to create payment method");
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Payment Method</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Method Code" value={methodCode} onChange={(e) => setMethodCode(e.target.value)} fullWidth />
          <TextField label="Method Name" value={methodName} onChange={(e) => setMethodName(e.target.value)} fullWidth />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
          <TextField label="Sort Order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} fullWidth />
          <FormControlLabel control={<Switch checked={active} onChange={(_, v) => setActive(v)} />} label="Active" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
