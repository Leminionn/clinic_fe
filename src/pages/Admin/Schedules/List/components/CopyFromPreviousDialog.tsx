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
  Alert,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { apiCall } from "../../../../../api/api";
import { scheduleCopyFromPrevious } from "../../../../../api/urls";

// Types
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

interface CopyFromPreviousDialogProps {
  open: boolean;
  onClose: () => void;
  doctors: StaffOption[];
  targetMonth: number;
  targetYear: number;
  hasExistingSchedule: boolean;
  onSuccess: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CopyFromPreviousDialog({
  open,
  onClose,
  doctors,
  targetMonth,
  targetYear,
  hasExistingSchedule,
  onSuccess,
}: CopyFromPreviousDialogProps) {
  const [staffId, setStaffId] = useState<number | "all">("all");
  const [conflictAction, setConflictAction] = useState<ConflictAction>("SKIP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkOperationResponse | null>(null);

  // Calculate previous month
  const sourceMonth = targetMonth === 1 ? 12 : targetMonth - 1;
  const sourceYear = targetMonth === 1 ? targetYear - 1 : targetYear;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const token = localStorage.getItem("accessToken");
    const request: any = {
      sourceMonth: sourceMonth,
      sourceYear: sourceYear,
      targetMonth: targetMonth,
      targetYear: targetYear,
      conflictAction: conflictAction,
    };

    if (staffId !== "all") {
      request.staffId = staffId;
    }

    apiCall(
      scheduleCopyFromPrevious,
      "POST",
      token,
      JSON.stringify(request),
      (res: any) => {
        setLoading(false);
        setResult(res.data);
        if (res.data.successCount > 0) {
          onSuccess();
          setTimeout(() => handleClose(), 2000);
        }
      },
      (err: any) => {
        setLoading(false);
        setError(err.message || "Failed to copy schedule");
      }
    );
  };

  const handleClose = () => {
    setStaffId("all");
    setConflictAction("SKIP");
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Copy Schedule from Previous Month
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Copy schedule from {MONTHS[sourceMonth - 1]} {sourceYear} to {MONTHS[targetMonth - 1]} {targetYear}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          {/* Warning if target month has existing schedule */}
          {hasExistingSchedule && (
            <Alert severity="warning">
              <Typography variant="body2">
                {MONTHS[targetMonth - 1]} {targetYear} already has existing schedules.
                Please select how to handle conflicts below.
              </Typography>
            </Alert>
          )}

          {/* Doctor Selection */}
          <FormControl fullWidth>
            <InputLabel>Copy for</InputLabel>
            <Select
              value={staffId}
              label="Copy for"
              onChange={(e) => setStaffId(e.target.value as number | "all")}
            >
              <MenuItem value="all">
                <Typography fontWeight="bold">All Doctors</Typography>
              </MenuItem>
              {doctors.map((doctor) => (
                <MenuItem key={doctor.staffId} value={doctor.staffId}>
                  {doctor.fullName} - {doctor.position}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Conflict Action */}
          <FormControl component="fieldset">
            <FormLabel component="legend">If schedule already exists in target month</FormLabel>
            <RadioGroup
              value={conflictAction}
              onChange={(e) => setConflictAction(e.target.value as ConflictAction)}
            >
              <FormControlLabel
                value="SKIP"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      Skip conflicts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Keep existing schedule, only add non-conflicting dates
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="OVERWRITE"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      Overwrite
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Replace existing schedule with copied schedule
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="CANCEL"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      Cancel if conflicts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stop operation and report all conflicts
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Info Box */}
          <Box sx={{ bgcolor: "var(--color-primary-light)", p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Copy Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Source: {MONTHS[sourceMonth - 1]} {sourceYear}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Target: {MONTHS[targetMonth - 1]} {targetYear}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Doctor: {staffId === "all" ? "All doctors" : doctors.find(d => d.staffId === staffId)?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Note: Only future dates will be copied. Past dates in target month will be skipped.
            </Typography>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Result Display */}
          {result && (
            <Alert severity={result.errorCount > 0 ? "warning" : result.successCount > 0 ? "success" : "info"}>
              <Typography variant="body2" fontWeight="bold">
                {result.message}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" display="block">
                  ✓ Created: {result.successCount} slots
                </Typography>
                <Typography variant="caption" display="block">
                  ⊘ Skipped: {result.skippedCount} slots
                </Typography>
                {result.errorCount > 0 && (
                  <Typography variant="caption" display="block" color="error">
                    ✗ Errors: {result.errorCount}
                  </Typography>
                )}
              </Box>
              {result.conflicts && result.conflicts.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" fontWeight="bold">
                    Conflicts:
                  </Typography>
                  {result.conflicts.slice(0, 3).map((conflict, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      • {conflict.staffName || `Staff ${conflict.staffId}`} - {conflict.date}
                    </Typography>
                  ))}
                  {result.conflicts.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      ... and {result.conflicts.length - 3} more
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Copy Schedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
