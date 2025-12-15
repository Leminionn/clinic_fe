import { Box, Typography, Tooltip } from "@mui/material";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

interface ScheduleCalendarProps {
  month: number;
  year: number;
  scheduleByDay: { [dayOfMonth: number]: DayScheduleSummary[] };
  staffColors: StaffColorMapping[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  isPastMonth: boolean;
}

export default function ScheduleCalendar({
  month,
  year,
  scheduleByDay,
  staffColors,
  selectedDate,
  onDateSelect,
  isPastMonth,
}: ScheduleCalendarProps) {
  const getDaysInMonth = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month - 1 &&
      today.getFullYear() === year
    );
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(year, month - 1, day);
    return checkDate < today;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month - 1 &&
      selectedDate.getFullYear() === year
    );
  };

  const getShiftTypeLabel = (shiftType: string) => {
    switch (shiftType) {
      case "MORNING":
        return "S";
      case "AFTERNOON":
        return "C";
      case "FULL_DAY":
        return "F";
      default:
        return "";
    }
  };

  const days = getDaysInMonth();

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
      {/* Weekday Headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
          mb: 1,
        }}
      >
        {WEEKDAYS.map((day, idx) => (
          <Box
            key={day}
            sx={{
              textAlign: "center",
              py: 1,
              fontWeight: "bold",
              color: idx === 0 ? "var(--color-text-error)" : "var(--color-text-secondary)",
              fontSize: 14,
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
          flex: 1,
        }}
      >
        {days.map((day, idx) => (
          <Box
            key={idx}
            onClick={() => {
              if (day) {
                onDateSelect(new Date(year, month - 1, day));
              }
            }}
            sx={{
              minHeight: 100,
              border: "1px solid",
              borderColor: isSelected(day!)
                ? "var(--color-primary-main)"
                : "var(--color-border-light, #e0e0e0)",
              borderRadius: 1,
              p: 0.5,
              cursor: day ? "pointer" : "default",
              backgroundColor: day
                ? isSelected(day)
                  ? "rgba(52, 151, 249, 0.08)"
                  : isPastDate(day)
                  ? "rgba(0, 0, 0, 0.02)"
                  : "#fff"
                : "transparent",
              transition: "all 0.2s",
              "&:hover": day
                ? {
                    borderColor: "var(--color-primary-main)",
                    backgroundColor: "rgba(52, 151, 249, 0.04)",
                  }
                : {},
              display: "flex",
              flexDirection: "column",
            }}
          >
            {day && (
              <>
                {/* Day Number */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: 12,
                      fontWeight: isToday(day) ? "bold" : "normal",
                      backgroundColor: isToday(day) ? "var(--color-primary-main)" : "transparent",
                      color: isToday(day)
                        ? "#fff"
                        : isPastDate(day)
                        ? "var(--color-text-disabled)"
                        : idx % 7 === 0
                        ? "var(--color-text-error)"
                        : "var(--color-text-primary)",
                    }}
                  >
                    {day}
                  </Typography>
                </Box>

                {/* Schedule Items */}
                <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 0.25 }}>
                  {scheduleByDay[day]?.slice(0, 4).map((schedule, scheduleIdx) => (
                    <Tooltip
                      key={`${schedule.staffId}-${scheduleIdx}`}
                      title={`${schedule.staffName} - ${schedule.shiftType === 'MORNING' ? 'Morning (8-12h)' : schedule.shiftType === 'AFTERNOON' ? 'Afternoon (13-17h)' : 'Full Day'}`}
                      arrow
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          backgroundColor: schedule.staffColor + "20",
                          borderLeft: `3px solid ${schedule.staffColor}`,
                          overflow: "hidden",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: schedule.staffColor,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getShiftTypeLabel(schedule.shiftType)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: "var(--color-text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {schedule.staffName.split(" ").pop()}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                  {scheduleByDay[day]?.length > 4 && (
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "var(--color-text-secondary)",
                        textAlign: "center",
                      }}
                    >
                      +{scheduleByDay[day].length - 4} more
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
