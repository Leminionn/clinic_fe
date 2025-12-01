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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { apiCall } from "../../../../api/api";
import {
  systemParamsCreate,
  systemParamsUpdate,
  systemParamGroupsGetActive,
} from "../../../../api/urls";
import type { SystemParam, SystemParamGroup } from "../../../../types/SystemParam";

interface CreateUpdateSystemParamProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: SystemParam | null;
}

export default function CreateUpdateSystemParam({
  open,
  onClose,
  onSaved,
  editData,
}: CreateUpdateSystemParamProps) {
  const [groupId, setGroupId] = useState<number>(0);
  const [paramCode, setParamCode] = useState("");
  const [paramName, setParamName] = useState("");
  const [paramValue, setParamValue] = useState("");
  const [dataType, setDataType] = useState("STRING");
  const [unit, setUnit] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState("");
  const [groups, setGroups] = useState<SystemParamGroup[]>([]);

  useEffect(() => {
    if (open) {
      fetchGroups();
      if (editData) {
        setGroupId(editData.groupId);
        setParamCode(editData.paramCode);
        setParamName(editData.paramName);
        setParamValue(editData.paramValue);
        setDataType(editData.dataType);
        setUnit(editData.unit || "");
        setEffectiveFrom(
          editData.effectiveFrom
            ? new Date(editData.effectiveFrom).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setActive(editData.active);
        setDescription(editData.description || "");
      } else {
        resetForm();
      }
    }
  }, [open, editData]);

  const fetchGroups = () => {
    apiCall(
      systemParamGroupsGetActive,
      "GET",
      null,
      null,
      (res: any) => {
        setGroups(res.data || []);
      },
      (err: any) => {
        console.error(err);
      }
    );
  };

  const resetForm = () => {
    setGroupId(0);
    setParamCode("");
    setParamName("");
    setParamValue("");
    setDataType("STRING");
    setUnit("");
    setEffectiveFrom(new Date().toISOString().split("T")[0]);
    setActive(true);
    setDescription("");
  };

  const handleSave = () => {
    const payload = {
      groupId,
      paramCode,
      paramName,
      paramValue,
      dataType,
      unit: unit || null,
      effectiveFrom,
      active,
      description: description || null,
    };

    const url = editData
      ? systemParamsUpdate(editData.paramId)
      : systemParamsCreate;
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
        {editData ? "Update System Parameter" : "New System Parameter"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Parameter Group</InputLabel>
            <Select
              value={groupId}
              onChange={(e) => setGroupId(Number(e.target.value))}
              label="Parameter Group"
            >
              <MenuItem value={0} disabled>
                Select a group
              </MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.groupId} value={group.groupId}>
                  {group.groupName} ({group.groupCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Parameter Code"
            value={paramCode}
            onChange={(e) => setParamCode(e.target.value)}
            fullWidth
            required
            disabled={!!editData}
          />

          <TextField
            label="Parameter Name"
            value={paramName}
            onChange={(e) => setParamName(e.target.value)}
            fullWidth
            required
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Parameter Value"
              value={paramValue}
              onChange={(e) => setParamValue(e.target.value)}
              fullWidth
              required
            />
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>Data Type</InputLabel>
              <Select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                label="Data Type"
              >
                <MenuItem value="STRING">String</MenuItem>
                <MenuItem value="NUMBER">Number</MenuItem>
                <MenuItem value="BOOLEAN">Boolean</MenuItem>
                <MenuItem value="DATE">Date</MenuItem>
                <MenuItem value="DECIMAL">Decimal</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              fullWidth
              placeholder="e.g., VND, %, days"
            />
            <TextField
              label="Effective From"
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <FormControlLabel
            control={<Switch checked={active} onChange={(_, v) => setActive(v)} />}
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!groupId || !paramCode || !paramName || !paramValue}
        >
          {editData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
