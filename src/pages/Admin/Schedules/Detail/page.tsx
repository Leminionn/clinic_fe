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
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  AccessTime,
  CalendarToday,
  CheckCircle,
  Schedule,
  EventBusy,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { apiCall } from "../../../../api/api";
import { scheduleGetDailyByStaff } from "../../../../api/urls";

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

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ShiftDetailPage() {
  const navigate = useNavigate();
  const { staffId, date, shiftType } = useParams<{
    staffId: string;
    date: string;
    shiftType: string;
  }>();

  const [dailyData, setDailyData] = useState<DailyScheduleResponse | null>(null);
  const [shift, setShift] = useState<ShiftResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShiftDetail = useCallback(() => {
    if (!staffId || !date) return;

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    apiCall(
      scheduleGetDailyByStaff(parseInt(staffId), date),
      "GET",
      token,
      null,
      (res: any) => {
        setDailyData(res.data);
        // Find the specific shift
        const foundShift = res.data?.shifts?.find(
          (s: ShiftResponse) => s.shiftType === shiftType
        );
        setShift(foundShift || null);
        setLoading(false);
      },
      (err: any) => {
        console.error("Failed to fetch shift detail:", err);
        setLoading(false);
      }
    );
  }, [staffId, date, shiftType]);

  useEffect(() => {
    fetchShiftDetail();
  }, [fetchShiftDetail]);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const getShiftTimeLabel = (type: string) => {
    switch (type) {
      case "MORNING":
        return "08:00 - 12:00";
      case "AFTERNOON":
        return "13:00 - 17:00";
      default:
        return "";
    }
  };

  const getTimeSlots = () => {
    if (!shift) return [];
    
    const isMorning = shift.shiftType === "MORNING";
    const times = isMorning
      ? ["08:00", "09:00", "10:00", "11:00"]
      : ["13:00", "14:00", "15:00", "16:00"];

    return times.map((time, idx) => ({
      slotNumber: idx + 1,
      startTime: time,
      endTime: `${parseInt(time.split(":")[0]) + 1}:00`,
      scheduleId: shift.timeSlots[idx]?.staffScheduleId || null,
      status: shift.status, // In real app, each slot might have its own status
      appointmentId: null, // TODO: Get from appointment data
      patientName: null,
    }));
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Chip label="Available" color="success" size="small" />;
      case "BOOKED":
        return <Chip label="Booked" color="primary" size="small" />;
      case "COMPLETED":
        return <Chip label="Completed" color="default" size="small" />;
      case "CANCELLED":
        return <Chip label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!shift) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "26px 50px",
          height: "100%",
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ alignSelf: "flex-start", mb: 2 }}
        >
          Back
        </Button>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <EventBusy sx={{ fontSize: 80, color: "var(--color-text-disabled)", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Shift not found
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "26px 50px",
        height: "100%",
        overflow: "auto",
      }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/admin/schedules")}
        >
          Schedules
        </Link>
        <Typography color="text.primary">Shift Detail</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ alignSelf: "flex-start", mb: 3 }}
      >
        Back to Calendar
      </Button>

      {/* Header Card */}
      <Card
        sx={{
          padding: "24px",
          borderRadius: 2,
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person color="primary" />
              {shift.staffName}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {shift.staffPosition}
            </Typography>
          </Box>
          <Chip
            label={shift.shiftType === "MORNING" ? "Morning Shift" : "Afternoon Shift"}
            color={shift.shiftType === "MORNING" ? "success" : "info"}
            sx={{ fontWeight: 500 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarToday sx={{ color: "var(--color-text-secondary)" }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Date
              </Typography>
              <Typography fontWeight="500">
                {formatDisplayDate(date!)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTime sx={{ color: "var(--color-text-secondary)" }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Time
              </Typography>
              <Typography fontWeight="500">
                {getShiftTimeLabel(shift.shiftType)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule sx={{ color: "var(--color-text-secondary)" }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Slots
              </Typography>
              <Typography fontWeight="500">
                {shift.totalSlotsCount} slots ({shift.bookedSlotsCount} booked)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Time Slots Table */}
      <Card
        sx={{
          padding: "24px",
          borderRadius: 2,
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Time Slots
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "var(--color-primary-light)" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Slot</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Appointment</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Patient</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getTimeSlots().map((slot) => (
                <TableRow
                  key={slot.slotNumber}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={`Slot ${slot.slotNumber}`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="500">
                      {slot.startTime} - {slot.endTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(slot.status)}
                  </TableCell>
                  <TableCell>
                    {slot.appointmentId ? (
                      <Link
                        sx={{ cursor: "pointer" }}
                        onClick={() => navigate(`/admin/appointment/${slot.appointmentId}`)}
                      >
                        #{slot.appointmentId}
                      </Link>
                    ) : (
                      <Typography color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {slot.patientName || (
                      <Typography color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: "var(--color-bg-success)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircle sx={{ color: "var(--color-text-success)" }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Available Slots
              </Typography>
              <Typography fontWeight="bold" color="var(--color-text-success)">
                {shift.totalSlotsCount - shift.bookedSlotsCount}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: "var(--color-info-light, #dbeafe)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Schedule sx={{ color: "var(--color-info-dark, #193cb8)" }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Booked Slots
              </Typography>
              <Typography fontWeight="bold" color="var(--color-info-dark, #193cb8)">
                {shift.bookedSlotsCount}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
