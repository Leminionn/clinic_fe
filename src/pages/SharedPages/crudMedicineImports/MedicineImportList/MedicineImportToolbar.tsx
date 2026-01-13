import { useRef, } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Typography,
} from "@mui/material";
import { CalendarDays, Search } from "lucide-react";
import { useAuth } from "../../../../auth/AuthContext";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function MedicineImportToolbar({
  searchKey,
  onChangeSearchKey,
  fromDate,
  onChangeFromDate,
  toDate,
  onChangeToDate,
}: {
  searchKey: string,
  onChangeSearchKey: (key: string) => void,
  fromDate: string,
  onChangeFromDate: (date: string) => void,
  toDate: string,
  onChangeToDate: (date: string) => void,
}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const fromDateInputRef = useRef<HTMLInputElement>(null);
  const toDateInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          value={searchKey}
          onChange={(e) => onChangeSearchKey(e.target.value)}
          placeholder="Search by supplier"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={22} color="var(--color-text-secondary)" />
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "var(--color-primary-light)",
            borderRadius: 3,
            width: '250px',
            '& .MuiInputBase-root': {
              pl: '18px',
            },
            '& .MuiInputBase-input': {
              py: '10px',
              pl: 1,
              pr: 3
            },
            '& fieldset': {
              border: 'none'
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">From:</Typography>
          <TextField
            value={fromDate}
            onChange={(e) => onChangeFromDate(e.target.value)}
            type="date"
            inputRef={fromDateInputRef}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarDays size={16} color="var(--color-primary-main)"
                    onClick={() => fromDateInputRef.current?.showPicker()} style={{ cursor: 'pointer' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": {
                width: '170px',
                "& input": {
                  cursor: "pointer",
                  py: '8px',
                  px: '12px',
                },
                "& fieldset": {
                  borderRadius: 2,
                  borderWidth: 1.5,
                  borderColor: "var(--color-primary-main)",
                },
              },
              "& input::-webkit-calendar-picker-indicator": {
                display: "none",
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">To:</Typography>
          <TextField
            value={toDate}
            onChange={(e) => onChangeToDate(e.target.value)}
            type="date"
            inputRef={toDateInputRef}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarDays size={16} color="var(--color-primary-main)"
                    onClick={() => toDateInputRef.current?.showPicker()} style={{ cursor: 'pointer' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": {
                width: '170px',
                "& input": {
                  cursor: "pointer",
                  py: '8px',
                  px: '12px',
                },
                "& fieldset": {
                  borderRadius: 2,
                  borderWidth: 1.5,
                  borderColor: "var(--color-primary-main)",
                },
              },
              "& input::-webkit-calendar-picker-indicator": {
                display: "none",
              },
            }}
          />
        </Box>
      </Box>

      {(role === "WarehouseStaff" || role === "Admin") &&
        <Button
          variant="contained"
          startIcon={<Add sx={{ height: 24, width: 24, }} />}
          onClick={() => {
            navigate('create');
            return;
          }}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          New Import
        </Button>
      }
    </Box>
  )
}