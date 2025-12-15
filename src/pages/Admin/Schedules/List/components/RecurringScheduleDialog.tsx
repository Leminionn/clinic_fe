import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
import { apiCall } from "../../../../../api/api";
import { scheduleRecurring } from "../../../../../api/urls";

// Types
type ShiftType = 'MORNING' | 'AFTERNOON';
type ConflictAction = 'SKIP' | 'OVERWRITE' | 'CANCEL';

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

interface RecurringScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  doctors: StaffOption[];
  selectedMonth: number;
  selectedYear: number;
  onSuccess: () => void;
}

const WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function RecurringScheduleDialog({
  open,
  onClose,
  doctors,
  selectedMonth,
  selectedYear,
  onSuccess,
}: RecurringScheduleDialogProps) {
  const [staffId, setStaffId] = useState<number | "">("");
  const [shiftType, setShiftType] = useState<ShiftType>("MORNING");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [conflictAction, setConflictAction] = useState<ConflictAction>("SKIP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkOperationResponse | null>(null);

  const handleSubmit = async () => {
    if (!staffId) {
      setError("Please select a doctor");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const token = localStorage.getItem("accessToken");
    const request = {
      staffId: staffId,
      year: selectedYear,
      month: selectedMonth,
      dayOfWeek: dayOfWeek,
      shiftType: shiftType,
      conflictAction: conflictAction,
    };

    apiCall(
      scheduleRecurring,
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
        setError(err.message || "Failed to create recurring schedule");
      }
    );
  };

  const handleClose = () => {
    setStaffId("");
    setShiftType("MORNING");
    setDayOfWeek(1);
    setConflictAction("SKIP");
    setError(null);
    setResult(null);
    onClose();
  };

  const getExpectedDates = () => {
    const dates: string[] = [];
    const year = selectedYear;
    const month = selectedMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Convert JS day (0=Sunday) to ISO day (1=Monday)
      const jsDay = date.getDay();
      const isoDay = jsDay === 0 ? 7 : jsDay;
      
      if (isoDay === dayOfWeek) {
        // Check if not past date
        if (date >= new Date(new Date().setHours(0, 0, 0, 0))) {
          dates.push(`${day}/${month + 1}`);
        }
      }
    }
    return dates;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Create Recurring Schedule
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Automatically assign shifts every week for {MONTHS[selectedMonth - 1]} {selectedYear}
        </Typography>
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

          {/* Day of Week */}
          <FormControl fullWidth>
            <InputLabel>Repeat Every</InputLabel>
            <Select
              value={dayOfWeek}
              label="Repeat Every"
              onChange={(e) => setDayOfWeek(e.target.value as number)}
            >
              {WEEKDAYS.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  Every {day.label}
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
              onChange={(e) => setConflictAction(e.target.value as ConflictAction)}
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

          {/* Preview */}
          <Box sx={{ bgcolor: "var(--color-primary-light)", p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Will create schedule for dates:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {getExpectedDates().map((date) => (
                <Chip
                  key={date}
                  label={date}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "var(--color-primary-main)" }}
                />
              ))}
              {getExpectedDates().length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No valid dates (all dates are in the past)
                </Typography>
              )}
            </Box>
          </Box>

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
                  {result.conflicts.slice(0, 5).map((conflict, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      • {conflict.date}: {conflict.existingShiftInfo}
                    </Typography>
                  ))}
                  {result.conflicts.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      ... and {result.conflicts.length - 5} more
                    </Typography>
                  )}
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
          disabled={loading || !staffId || getExpectedDates().length === 0}
        >
          {loading ? <CircularProgress size={20} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
