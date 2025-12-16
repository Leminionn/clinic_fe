import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Add,
  AccessTime,
  Person,
  Delete,
  Visibility,
  EventBusy,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../../../api/api";
import { scheduleGetDaily, scheduleDeleteSlot } from "../../../../../api/urls";
import AlertDialog from "../../../../../components/AlertDialog";
import { showMessage } from "../../../../../components/ActionResultMessage";

// Types
interface ShiftResponse {
  staffId: number;
  staffName: string;
  staffPosition: string;
  scheduleDate: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  status: string;
  timeSlots: { staffScheduleId: number }[];
  totalSlotsCount: number;
  bookedSlotsCount: number;
}

interface DailyScheduleResponse {
  date: string;
  pastDate: boolean;
  today: boolean;
  dayOfWeek: number;
  dayOfWeekName: string;
  shifts: ShiftResponse[];
  totalShifts: number;
}

interface DayDetailPanelProps {
  selectedDate: Date | null;
  canModify: boolean;
  onAssignShift: () => void;
  onRefresh: () => void;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function DayDetailPanel({
  selectedDate,
  canModify,
  onAssignShift,
  onRefresh,
}: DayDetailPanelProps) {
  const navigate = useNavigate();
  const [dailyData, setDailyData] = useState<DailyScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftResponse | null>(null);

  const fetchDailySchedule = useCallback(() => {
    if (!selectedDate) return;
    
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const dateStr = formatDateForApi(selectedDate);
    
    apiCall(
      scheduleGetDaily(dateStr),
      "GET",
      token,
      null,
      (res: any) => {
        setDailyData(res.data);
        setLoading(false);
      },
      (err: any) => {
        console.error("Failed to fetch daily schedule:", err);
        setLoading(false);
      }
    );
  }, [selectedDate]);

  useEffect(() => {
    fetchDailySchedule();
  }, [fetchDailySchedule]);

  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getShiftTimeLabel = (shiftType: string) => {
    switch (shiftType) {
      case "MORNING":
        return "08:00 - 12:00";
      case "AFTERNOON":
        return "13:00 - 17:00";
      default:
        return "";
    }
  };

  const getShiftTypeChip = (shiftType: string) => {
    const isMorning = shiftType === "MORNING";
    return (
      <Chip
        label={isMorning ? "Morning" : "Afternoon"}
        size="small"
        sx={{
          backgroundColor: isMorning ? "var(--color-bg-success)" : "var(--color-info-light, #dbeafe)",
          color: isMorning ? "var(--color-text-success)" : "var(--color-info-dark, #193cb8)",
          fontWeight: 500,
        }}
      />
    );
  };

  const handleDeleteShift = () => {
    if (!selectedShift) return;
    
    // Delete all time slots of this shift
    const token = localStorage.getItem("accessToken");
    const deletePromises = selectedShift.timeSlots.map((slot) => {
      return new Promise((resolve, reject) => {
        apiCall(
          scheduleDeleteSlot(slot.staffScheduleId),
          "DELETE",
          token,
          null,
          resolve,
          reject
        );
      });
    });

    Promise.all(deletePromises)
      .then(() => {
        showMessage("Shift deleted successfully!", "success");
        setDeleteDialogOpen(false);
        setSelectedShift(null);
        fetchDailySchedule();
        onRefresh();
      })
      .catch((err) => {
        console.error("Failed to delete shift:", err);
        showMessage("Failed to delete shift", "error");
      });
  };

  const handleViewShiftDetail = (shift: ShiftResponse) => {
    const dateStr = formatDateForApi(selectedDate!);
    navigate(`/admin/schedules/shift/${shift.staffId}/${dateStr}/${shift.shiftType}`);
  };

  if (!selectedDate) {
    return (
      <Card
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          borderRadius: 2,
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          minWidth: 350,
        }}
      >
        <EventBusy sx={{ fontSize: 60, color: "var(--color-text-disabled)", mb: 2 }} />
        <Typography color="text.secondary" textAlign="center">
          Select a date on the calendar to view schedule details
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        borderRadius: 2,
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
        minWidth: 350,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Schedule Details
        </Typography>
        <Typography color="text.secondary" fontSize={14}>
          {formatDisplayDate(selectedDate)}
        </Typography>
        {dailyData?.today && (
          <Chip label="Today" color="primary" size="small" sx={{ mt: 1 }} />
        )}
        {dailyData?.pastDate && (
          <Chip label="Past Date" color="warning" size="small" sx={{ mt: 1 }} />
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Action Button */}
      {canModify && !dailyData?.pastDate && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAssignShift}
          fullWidth
          sx={{ mb: 2, textTransform: "none" }}
        >
          Add Shift for This Day
        </Button>
      )}

      {/* Shifts List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : dailyData?.shifts && dailyData.shifts.length > 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {dailyData.shifts.map((shift, idx) => (
              <Box
                key={`${shift.staffId}-${shift.shiftType}-${idx}`}
                sx={{
                  border: "1px solid var(--color-border-light, #e0e0e0)",
                  borderRadius: 2,
                  p: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "var(--color-primary-main)",
                    backgroundColor: "rgba(52, 151, 249, 0.02)",
                  },
                }}
              >
                {/* Doctor Name & Shift Type */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person sx={{ fontSize: 20, color: "var(--color-primary-main)" }} />
                    <Typography fontWeight="600">{shift.staffName}</Typography>
                  </Box>
                  {getShiftTypeChip(shift.shiftType)}
                </Box>

                {/* Position */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, ml: 3.5 }}
                >
                  {shift.staffPosition}
                </Typography>

                {/* Time */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, ml: 3.5 }}>
                  <AccessTime sx={{ fontSize: 16, color: "var(--color-text-secondary)" }} />
                  <Typography variant="body2" color="text.secondary">
                    {getShiftTimeLabel(shift.shiftType)}
                  </Typography>
                </Box>

                {/* Slot Info */}
                <Box sx={{ display: "flex", gap: 1, mb: 2, ml: 3.5 }}>
                  <Chip
                    label={`${shift.totalSlotsCount} slots`}
                    size="small"
                    variant="outlined"
                  />
                  {shift.bookedSlotsCount > 0 && (
                    <Chip
                      label={`${shift.bookedSlotsCount} booked`}
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewShiftDetail(shift)}
                      sx={{ color: "var(--color-primary-main)" }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canModify && !dailyData.pastDate && (
                    <Tooltip title="Delete Shift">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedShift(shift);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ color: "var(--color-text-error)" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <EventBusy sx={{ fontSize: 48, color: "var(--color-text-disabled)", mb: 2 }} />
            <Typography color="text.secondary" textAlign="center">
              No shifts scheduled for this day
            </Typography>
          </Box>
        )}
      </Box>

      {/* Summary */}
      {dailyData && dailyData.shifts.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Total Shifts
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {dailyData.totalShifts}
            </Typography>
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        title={`Delete ${selectedShift?.staffName}'s ${selectedShift?.shiftType?.toLowerCase()} shift?`}
        type="error"
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        buttonCancel="Cancel"
        buttonConfirm="Delete"
        onConfirm={handleDeleteShift}
      />
    </Card>
  );
}
