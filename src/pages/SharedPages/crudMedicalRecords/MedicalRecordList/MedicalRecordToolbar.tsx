import { useRef, } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import { CalendarDays, Search } from "lucide-react";
import { useAuth } from "../../../../auth/AuthContext";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function MedicalRecordToolbar({
  searchKey,
  onChangeSearchKey,
  date,
  onChangeDate,
}: {
  searchKey: string,
  onChangeSearchKey: (key: string) => void,
  date: string,
  onChangeDate: (date: string) => void,

}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const dateInputRef = useRef<HTMLInputElement>(null);

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
          gap: 4,
          alignItems: "center",
        }}
      >
        {role != "Patient" &&
          <TextField
            value={searchKey}
            onChange={(e) => onChangeSearchKey(e.target.value)}
            placeholder="Search by patient name"
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
              width: '280px',
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
          />}

        <TextField
          value={date}
          onChange={(e) => onChangeDate(e.target.value)}
          type="date"
          inputRef={dateInputRef}
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <CalendarDays size={18} color="var(--color-primary-main)"
                  onClick={() => dateInputRef.current?.showPicker()} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputBase-root": {
              color: "var(--color-text-placeholder)",
              width: '180px',
              cursor: "pointer",
              "& input": {
                cursor: "pointer",
                px: '24px',
                py: '10px',
              },
              "& fieldset": {
                borderRadius: 3,
                borderWidth: 1.6,
                borderColor: "var(--color-primary-main)",
              },
            },

            "& input::-webkit-calendar-picker-indicator": {
              display: "none",
            },
          }}
        />
      </Box>

      {(role === "Doctor") &&
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
          New Medical Record
        </Button>
      }
    </Box>
  )
}