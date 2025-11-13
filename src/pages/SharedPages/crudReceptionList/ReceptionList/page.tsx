import { useEffect, useRef, useState } from "react";
import { Card, Box, Typography, Button, TextField, InputAdornment, Divider, Select, MenuItem } from "@mui/material";
import { CalendarDays, Search } from "lucide-react";
import { Add } from "@mui/icons-material";
import AlertDialog from "../../../../components/AlertDialog";
import { showMessage } from "../../../../components/ActionResultMessage";
import { useNavigate } from "react-router-dom";
import ReceptionTable, { getStatusBgColor, getStatusTextColor } from "./ReceptionTable";
import dayjs from "dayjs";
import { useAuth } from "../../../../auth/AuthContext";

export default function ReceptionList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [filterStatus, setFilterStatus] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    console.log(selectedDate); // tải danh sách tiệc cưới ban đầu
  }, [selectedDate]);
  const handleConfirmDelete = (id: any) => {
    setDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Reception List
      </Typography>

      <Box flex={1} p="6px">
        <Card sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 48px',
          gap: 1,
          borderRadius: 2,
          boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
        }}>
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
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
                onClick={() => { }}
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

          <Divider />

          <Box flex={1} mt={3}>
            <ReceptionTable />
          </Box>
        </Card>
      </Box>

      <AlertDialog
        title="Are you sure you want to delete this patient?"
        type="error"
        open={isDeleteConfirmOpen}
        setOpen={setIsDeleteConfirmOpen}
        buttonCancel="Cancel"
        buttonConfirm="Delete"
        onConfirm={() => {
          if (!deleteId) return;

          showMessage("Patient deletion successful!");

          setIsDeleteConfirmOpen(false);
          setDeleteId(null);
        }}
      />
    </Box>
  );
}
