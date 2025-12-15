import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Add,
  ContentCopy,
  Repeat,
} from "@mui/icons-material";
import { apiCall } from "../../../../api/api";
import {
  scheduleGetMonthly,
  scheduleCopyFromPrevious,
  staffGetDoctors,
} from "../../../../api/urls";

// Types
interface StaffColorMapping {
  staffId: number;
  staffName: string;
  color: string;
}

interface DayScheduleSummary {
  staffId: number;
  staffName: string;
  staffColor: string;
  shiftType: string;
  slotCount: number;
}

interface MonthlyScheduleResponse {
  month: number;
  year: number;
  currentMonth: boolean;
  pastMonth: boolean;
  totalShifts: number;
  hasPreviousMonthSchedule: boolean;
  staffColors: StaffColorMapping[];
  scheduleByDay: { [dayOfMonth: number]: DayScheduleSummary[] };
}

interface StaffOption {
  staffId: number;
  fullName: string;
  position: string;
}

import ScheduleCalendar from "./components/ScheduleCalendar";
import DayDetailPanel from "./components/DayDetailPanel";
import AssignShiftDialog from "./components/AssignShiftDialog";
import RecurringScheduleDialog from "./components/RecurringScheduleDialog";
import CopyFromPreviousDialog from "./components/CopyFromPreviousDialog";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ScheduleListPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [doctors, setDoctors] = useState<StaffOption[]>([]);

  // Dialogs
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  const fetchMonthlySchedule = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    apiCall(
      scheduleGetMonthly(selectedMonth, selectedYear),
      "GET",
      token,
      null,
      (res: any) => {
        setMonthlyData(res.data);
        setLoading(false);
      },
      (err: any) => {
        console.error("Failed to fetch schedule:", err);
        setLoading(false);
      }
    );
  }, [selectedMonth, selectedYear]);

  const fetchDoctors = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    apiCall(
      staffGetDoctors,
      "GET",
      token,
      null,
      (res: any) => {
        setDoctors(res.data || []);
      },
      (err: any) => {
        console.error("Failed to fetch doctors:", err);
      }
    );
  }, []);

  useEffect(() => {
    fetchMonthlySchedule();
    fetchDoctors();
  }, [fetchMonthlySchedule, fetchDoctors]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleOpenAssignDialog = (preselectedDate?: Date) => {
    if (preselectedDate) {
      setSelectedDate(preselectedDate);
    }
    setAssignDialogOpen(true);
  };

  const canModifyMonth = () => {
    const currentDate = new Date();
    const firstDayOfSelectedMonth = new Date(selectedYear, selectedMonth - 1, 1);
    return firstDayOfSelectedMonth >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  };

  const isPastMonth = () => {
    const currentDate = new Date();
    const lastDayOfSelectedMonth = new Date(selectedYear, selectedMonth, 0);
    return lastDayOfSelectedMonth < new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 1; y <= currentYear + 2; y++) {
      years.push(y);
    }
    return years;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "26px 50px",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Doctor Schedule Management
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flex: 1, overflow: "hidden" }}>
        {/* Main Calendar Card */}
        <Card
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            {/* Month/Year Navigation */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={handlePrevMonth}>
                <ChevronLeft />
              </IconButton>

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                    setSelectedDate(null);
                  }}
                >
                  {MONTHS.map((month, idx) => (
                    <MenuItem key={idx} value={idx + 1}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setSelectedDate(null);
                  }}
                >
                  {getYearOptions().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton onClick={handleNextMonth}>
                <ChevronRight />
              </IconButton>

              {isPastMonth() && (
                <Chip
                  label="Past Month - Read Only"
                  color="warning"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1 }}>
              {canModifyMonth() && (
                <>
                  <Tooltip title="Assign Shift">
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => handleOpenAssignDialog()}
                      sx={{ textTransform: "none" }}
                    >
                      Assign Shift
                    </Button>
                  </Tooltip>

                  <Tooltip title="Create Recurring Schedule">
                    <Button
                      variant="outlined"
                      startIcon={<Repeat />}
                      onClick={() => setRecurringDialogOpen(true)}
                      sx={{ textTransform: "none" }}
                    >
                      Recurring
                    </Button>
                  </Tooltip>

                  {monthlyData?.hasPreviousMonthSchedule && (
                    <Tooltip title="Copy from Previous Month">
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopy />}
                        onClick={() => setCopyDialogOpen(true)}
                        sx={{ textTransform: "none" }}
                      >
                        Copy Previous
                      </Button>
                    </Tooltip>
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* Staff Color Legend */}
          {monthlyData?.staffColors && monthlyData.staffColors.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
                p: 2,
                bgcolor: "var(--color-primary-light)",
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" fontWeight="bold" sx={{ mr: 2, alignSelf: "center" }}>
                Doctors:
              </Typography>
              {monthlyData.staffColors.map((staff) => (
                <Chip
                  key={staff.staffId}
                  label={staff.staffName}
                  size="small"
                  sx={{
                    backgroundColor: staff.color,
                    color: "#fff",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          )}

          {/* Calendar Grid */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ScheduleCalendar
              month={selectedMonth}
              year={selectedYear}
              scheduleByDay={monthlyData?.scheduleByDay || {}}
              staffColors={monthlyData?.staffColors || []}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              isPastMonth={isPastMonth()}
            />
          )}
        </Card>

        {/* Day Detail Panel */}
        <DayDetailPanel
          selectedDate={selectedDate}
          canModify={canModifyMonth() && selectedDate ? selectedDate >= new Date(new Date().setHours(0,0,0,0)) : false}
          onAssignShift={() => handleOpenAssignDialog(selectedDate || undefined)}
          onRefresh={fetchMonthlySchedule}
        />
      </Box>

      {/* Dialogs */}
      <AssignShiftDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        doctors={doctors}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        preselectedDate={selectedDate}
        onSuccess={() => {
          fetchMonthlySchedule();
          showMessage("Shift assigned successfully!", "success");
        }}
      />

      <RecurringScheduleDialog
        open={recurringDialogOpen}
        onClose={() => setRecurringDialogOpen(false)}
        doctors={doctors}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSuccess={() => {
          fetchMonthlySchedule();
          showMessage("Recurring schedule created successfully!", "success");
        }}
      />

      <CopyFromPreviousDialog
        open={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
        doctors={doctors}
        targetMonth={selectedMonth}
        targetYear={selectedYear}
        hasExistingSchedule={(monthlyData?.totalShifts || 0) > 0}
        onSuccess={() => {
          fetchMonthlySchedule();
          showMessage("Schedule copied successfully!", "success");
        }}
      />
    </Box>
  );
}
