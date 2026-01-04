import { useState } from "react";
import {
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Button,
   TextField,
   Box,
} from "@mui/material";
import type { MedicinePriceRequest } from "../../../../types/Medicine";

interface AddPriceDialogProps {
   open: boolean;
   onClose: () => void;
   onSubmit: (data: MedicinePriceRequest) => void;
}

export default function AddPriceDialog({
   open,
   onClose,
   onSubmit,
}: AddPriceDialogProps) {
   const [effectiveDate, setEffectiveDate] = useState(
      new Date().toISOString().split("T")[0]
   );
   const [unitPrice, setUnitPrice] = useState("");

   const handleSubmit = () => {
      if (!effectiveDate || !unitPrice) {
         alert("Please fill in all fields");
         return;
      }

      const price = parseFloat(unitPrice);
      if (isNaN(price) || price <= 0) {
         alert("Price must be a positive number");
         return;
      }

      onSubmit({
         effectiveDate,
         unitPrice: price,
      });

      // Reset form
      setEffectiveDate(new Date().toISOString().split("T")[0]);
      setUnitPrice("");
   };

   const handleClose = () => {
      setEffectiveDate(new Date().toISOString().split("T")[0]);
      setUnitPrice("");
      onClose();
   };

   return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
         <DialogTitle>Add New Price</DialogTitle>
         <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
               <TextField
                  label="Effective Date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  InputLabelProps={{
                     shrink: true,
                  }}
                  fullWidth
               />

               <TextField
                  label="Unit Price"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  inputProps={{ min: 0, step: 1000 }}
                  helperText="Price must be greater than import price"
                  fullWidth
               />
            </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
               Add
            </Button>
         </DialogActions>
      </Dialog>
   );
}
