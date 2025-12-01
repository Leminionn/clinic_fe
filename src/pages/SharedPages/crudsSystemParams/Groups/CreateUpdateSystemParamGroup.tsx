import { useEffect, useState } from "react";
import {
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   TextField,
   Button,
   Box,
   FormControlLabel,
   Switch,
} from "@mui/material";
import { apiCall } from "../../../../api/api";
import {
   systemParamGroupsCreate,
   systemParamGroupsUpdate,
} from "../../../../api/urls";
import type { SystemParamGroup } from "../../../../types/SystemParam";

interface CreateUpdateSystemParamGroupProps {
   open: boolean;
   onClose: () => void;
   onSaved: () => void;
   editData?: SystemParamGroup | null;
}

export default function CreateUpdateSystemParamGroup({
   open,
   onClose,
   onSaved,
   editData,
}: CreateUpdateSystemParamGroupProps) {
   const [groupCode, setGroupCode] = useState("");
   const [groupName, setGroupName] = useState("");
   const [description, setDescription] = useState("");
   const [active, setActive] = useState(true);

   useEffect(() => {
      if (open) {
         if (editData) {
            setGroupCode(editData.groupCode);
            setGroupName(editData.groupName);
            setDescription(editData.description || "");
            setActive(editData.active);
         } else {
            resetForm();
         }
      }
   }, [open, editData]);

   const resetForm = () => {
      setGroupCode("");
      setGroupName("");
      setDescription("");
      setActive(true);
   };

   const handleSave = () => {
      const payload = {
         groupCode,
         groupName,
         description: description || null,
         active,
      };

      const url = editData
         ? systemParamGroupsUpdate(editData.groupId)
         : systemParamGroupsCreate;
      const method = editData ? "PUT" : "POST";

      apiCall(
         url,
         method,
         null,
         JSON.stringify(payload),
         () => {
            onSaved();
            onClose();
         },
         (err: any) => {
            console.error(err);
         }
      );
   };

   return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
         <DialogTitle>
            {editData ? "Update Parameter Group" : "New Parameter Group"}
         </DialogTitle>
         <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
               <TextField
                  label="Group Code"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  fullWidth
                  required
                  disabled={!!editData}
                  helperText="Unique identifier for the group"
               />
               <TextField
                  label="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  fullWidth
                  required
               />
               <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
               />
               <FormControlLabel
                  control={
                     <Switch checked={active} onChange={(_, v) => setActive(v)} />
                  }
                  label="Active"
               />
            </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
               variant="contained"
               onClick={handleSave}
               disabled={!groupCode || !groupName}
            >
               {editData ? "Update" : "Create"}
            </Button>
         </DialogActions>
      </Dialog>
   );
}
