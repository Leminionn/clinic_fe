import { Card, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

export default function SelectDate({
  selectedDate,
  onChangeDate,
}: {
  selectedDate: string | null;
  onChangeDate: (date: string) => void,
}) {
  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      mb: 3,
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography sx={{ fontWeight: 'bold', mb: 2.5, }}>
        Select Date
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate ? dayjs(selectedDate) : dayjs()}
          minDate={dayjs().add(1, 'day')}
          onChange={(newValue) => onChangeDate(newValue ?dayjs(newValue).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"))}
          sx={{
            border: '1px solid var(--color-border)',
            borderRadius: "10px",
            height: 'auto',
            maxHeight: 'none',
            gap: 2,
            "& .MuiPickersCalendarHeader-label": {
              fontWeight: 'bold',
            },
            "& .MuiDayCalendar-weekDayLabel": {
              color: "var(--color-text-secondary)",
              fontWeight: 'bold'
            },
            "& .MuiPickersDay-root": {
              borderRadius: "10px",
            },
          }}
        />
      </LocalizationProvider>
    </Card>
  );
}