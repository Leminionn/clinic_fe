import { useRef, } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  Button,
} from "@mui/material";
import { CalendarDays, Search } from "lucide-react";
import { getStatusBgColor, getStatusTextColor } from "./ReceptionTable";
import { useAuth } from "../../../../auth/AuthContext";
import { Add } from "@mui/icons-material";

export default function ReceptionToolbar({
  searchKey,
  onChangeSearchKey,
  date,
  onChangeDate,
  status,
  onChangeStatus,
  onOpenNewForm,
}: {
  searchKey: string,
  onChangeSearchKey: (key: string) => void,
  date: string,
  onChangeDate: (date: string) => void,
  status: string,
  onChangeStatus: (status: string) => void,
  onOpenNewForm: () => void,

}) {
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
        />

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

        <Select
          value={status}
          onChange={(e) => onChangeStatus(e.target.value)}
          displayEmpty
          sx={{
            "& fieldset": {
              borderRadius: 3,
              borderWidth: 1.6,
              borderColor: "var(--color-primary-main)",
            },
            "& .MuiInputBase-input": {
              display: 'flex',
              width: '150px',
              alignItems: 'center',
              paddingY: '8px',
              paddingLeft: "24px",
            },
          }}
        >
          <MenuItem value="">
            <Box sx={{ padding: '2px 10px', }}>
              All status
            </Box>
          </MenuItem>
          {["Admitted - Waiting", "Examined - Unpaid", "Paid", "Admitted - Absent"].map(item => (
            <MenuItem value={item}>
              <Box sx={{
                display: 'inline-flex',
                borderRadius: 1,
                padding: '2px 10px',
                color: getStatusTextColor(item),
                bgcolor: getStatusBgColor(item),
              }}>
                {item}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </Box>

      {role === "Receptionist" &&
        <Button
          variant="contained"
          startIcon={<Add sx={{ height: 24, width: 24, }} />}
          onClick={onOpenNewForm}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          New Reception
        </Button>
      }
    </Box>
  )
}