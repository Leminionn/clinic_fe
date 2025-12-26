import {
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search } from "lucide-react";

interface ServiceToolbarProps {
  searchKey: string;
  onChangeSearchKey: (key: string) => void;
}

export default function ServiceToolbar({
  searchKey,
  onChangeSearchKey,
}: ServiceToolbarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          width: "100%", 
        }}
      >
        {/* Search by Service Name */}
        <TextField
          value={searchKey}
          onChange={(e) => onChangeSearchKey(e.target.value)}
          placeholder="Search by service name..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="var(--color-text-secondary)" />
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: "var(--color-bg-input)", // Hoặc 'white' nếu chưa có biến này
            borderRadius: 2,
            minWidth: '300px', // Đặt rộng hơn một chút cho thoải mái
            '& .MuiOutlinedInput-root': {
                borderRadius: 2,
            }
          }}
        />
      </Box>
    </Box>
  );
}