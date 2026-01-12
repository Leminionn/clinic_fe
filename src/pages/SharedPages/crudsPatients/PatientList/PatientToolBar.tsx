import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Search } from "lucide-react";
import { useAuth } from "../../../../auth/AuthContext";

interface PatientToolbarProps {
  searchKey: string;
  onChangeSearchKey: (key: string) => void;
  gender: string;
  onChangeGender: (gender: string) => void;
}

export default function PatientToolbar({
  searchKey,
  onChangeSearchKey,
  gender,
  onChangeGender,
}: PatientToolbarProps) {
  const {role} = useAuth();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        gap: 2,
        flexWrap: "wrap", // Để đảm bảo responsive trên màn hình nhỏ
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          width: "100%", // Chiếm hết chiều ngang nếu cần
        }}
      >
        {/* Ô Tìm kiếm Tên */}
        <TextField
          value={searchKey}
          onChange={(e) => onChangeSearchKey(e.target.value)}
          placeholder="Search by name..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="var(--color-text-secondary)" />
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "var(--color-bg-input)", // Hoặc 'white'
            borderRadius: 2,
            minWidth: '280px',
            '& .MuiOutlinedInput-root': {
                borderRadius: 2,
            }
          }}
        />

        {/* Bộ lọc Giới tính */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="gender-select-label">Gender</InputLabel>
          <Select
            labelId="gender-select-label"
            id="gender-select"
            value={gender}
            label="Gender"
            onChange={(e) => onChangeGender(e.target.value)}
            sx={{
                borderRadius: 2,
                bgcolor: "var(--color-bg-input)", // Hoặc 'white'
            }}
          >
            <MenuItem value="">
              <em>All Genders</em>
            </MenuItem>
            <MenuItem value="MALE">Male</MenuItem>
            <MenuItem value="FEMALE">Female</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}