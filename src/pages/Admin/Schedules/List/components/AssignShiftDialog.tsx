import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { apiCall } from "../../../../../api/api";
import { scheduleAssignShift, scheduleBulkAssign } from "../../../../../api/urls";

// Types
type ShiftType = 'MORNING' | 'AFTERNOON';

interface StaffOption {
  staffId: number;
  fullName: string;
  position: string;
}

interface ConflictInfo {
  date: string;
  staffId: number;
  staffName?: string;
  shiftType?: string;
  existingShiftInfo: string;
}

interface BulkOperationResponse {
  success: boolean;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  conflicts: ConflictInfo[];
  createdDates: string[];
  message: string;
}

interface AssignShiftDialogProps {
  open: boolean;
  onClose: () => void;
  doctors: StaffOption[];
  selectedMonth: number;
  selectedYear: number;
  preselectedDate?: Date | null;
  onSuccess: () => void;
}

export default function AssignShiftDialog({
  open,
  onClose,
  doctors,
  selectedMonth,
  selectedYear,
  preselectedDate,
  onSuccess,
}: AssignShiftDialogProps) {
  const [staffId, setStaffId] = useState<number | "">("");
  const [shiftType, setShiftType] = useState<ShiftType>("MORNING");
  const [selectedDates, setSelectedDates] = useState<Dayjs[]>([]);
  const [currentPickerDate, setCurrentPickerDate] = useState<Dayjs | null>(
    preselectedDate ? dayjs(preselectedDate) : dayjs(new Date(selectedYear, selectedMonth - 1, 1))
  );
  const [conflictAction, setConflictAction] = useState<'SKIP' | 'OVERWRITE' | 'CANCEL'>("SKIP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkOperationResponse | null>(null);

  const handleAddDate = () => {
    if (currentPickerDate && !selectedDates.some(d => d.isSame(currentPickerDate, 'day'))) {
      setSelectedDates([...selectedDates, currentPickerDate].sort((a, b) => a.valueOf() - b.valueOf()));
    }
  };

  const handleRemoveDate = (dateToRemove: Dayjs) => {
    setSelectedDates(selectedDates.filter(d => !d.isSame(dateToRemove, 'day')));
  };

  const handleSubmit = async () => {
    if (!staffId || selectedDates.length === 0) {
      setError("Please select a doctor and at least one date");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const token = localStorage.getItem("accessToken");

    if (selectedDates.length === 1) {
      // Single date assignment
      const request = {
        staffId: staffId,
        date: selectedDates[0].format("YYYY-MM-DD"),
        shiftType: shiftType,
        conflictAction: conflictAction,
      };

      apiCall(
        scheduleAssignShift,
        "POST",
        token,
        JSON.stringify(request),
        (res: any) => {
          setLoading(false);
          onSuccess();
          handleClose();
        },
        (err: any) => {
          setLoading(false);
          setError(err.message || "Failed to assign shift");
        }
      );
    } else {
      // Bulk assignment
      const request = {
        staffId: staffId,
        dates: selectedDates.map(d => d.format("YYYY-MM-DD")),
        shiftType: shiftType,
        conflictAction: conflictAction,
      };

      apiCall(
        scheduleBulkAssign,
        "POST",
        token,
        JSON.stringify(request),
        (res: any) => {
          setLoading(false);
          setResult(res.data);
          if (res.data.errorCount === 0) {
            onSuccess();
            setTimeout(() => handleClose(), 1500);
          }
        },
        (err: any) => {
          setLoading(false);
          setError(err.message || "Failed to assign shifts");
        }
      );
    }
  };

  const handleClose = () => {
    setStaffId("");
    setShiftType("MORNING");
    setSelectedDates([]);
    setCurrentPickerDate(preselectedDate ? dayjs(preselectedDate) : dayjs(new Date(selectedYear, selectedMonth - 1, 1)));
    setConflictAction("SKIP");
    setError(null);
    setResult(null);
    onClose();
  };

  const isPastDate = (date: Dayjs) => {
    return date.isBefore(dayjs().startOf('day'));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Assign Shift
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign a shift (4 time slots) to a doctor
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          {/* Doctor Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Doctor</InputLabel>
            <Select
              value={staffId}
              label="Select Doctor"
              onChange={(e) => setStaffId(e.target.value as number)}
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.staffId} value={doctor.staffId}>
                  {doctor.fullName} - {doctor.position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Shift Type */}
          <FormControl fullWidth>
            <InputLabel>Shift Type</InputLabel>
            <Select
              value={shiftType}
              label="Shift Type"
              onChange={(e) => setShiftType(e.target.value as ShiftType)}
            >
              <MenuItem value="MORNING">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label="Morning" size="small" color="success" />
                  <Typography variant="body2" color="text.secondary">
                    08:00 - 12:00
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="AFTERNOON">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label="Afternoon" size="small" color="info" />
                  <Typography variant="body2" color="text.secondary">
                    13:00 - 17:00
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Conflict Action */}
          <FormControl component="fieldset">
            <FormLabel component="legend">If schedule already exists</FormLabel>
            <RadioGroup
              value={conflictAction}
              onChange={(e) => setConflictAction(e.target.value as 'SKIP' | 'OVERWRITE' | 'CANCEL')}
            >
              <FormControlLabel
                value="SKIP"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    Skip - Keep existing schedule, only add new dates
                  </Typography>
                }
              />
              <FormControlLabel
                value="OVERWRITE"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    Overwrite - Replace existing schedule
                  </Typography>
                }
              />
              <FormControlLabel
                value="CANCEL"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    Cancel - Stop if any conflict found
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Date Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Dates (can select multiple)
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={currentPickerDate}
                  onChange={(newValue) => setCurrentPickerDate(newValue)}
                  shouldDisableDate={(date) => isPastDate(date)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <Button
                variant="outlined"
                onClick={handleAddDate}
                disabled={!currentPickerDate || isPastDate(currentPickerDate)}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Selected Dates Display */}
          {selectedDates.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Dates ({selectedDates.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedDates.map((date) => (
                  <Chip
                    key={date.format("YYYY-MM-DD")}
                    label={date.format("DD/MM/YYYY")}
                    onDelete={() => handleRemoveDate(date)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Result Display */}
          {result && (
            <Alert severity={result.errorCount > 0 ? "warning" : "success"}>
              <Typography variant="body2">
                {result.message}
              </Typography>
              {result.conflicts && result.conflicts.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    Conflicts:
                  </Typography>
                  {result.conflicts.map((conflict, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      • {conflict.date}: {conflict.existingShiftInfo}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !staffId || selectedDates.length === 0}
        >
          {loading ? <CircularProgress size={20} /> : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
