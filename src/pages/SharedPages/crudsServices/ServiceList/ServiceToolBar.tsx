import { Box, TextField, InputAdornment } from "@mui/material";
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
        gap: 2,
        flexWrap: "wrap", // Đảm bảo responsive đồng bộ
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          width: { xs: "100%", sm: "auto" }, // Chiếm hết chiều ngang trên mobile
        }}
      >
        {/* Ô Tìm kiếm Tên Dịch Vụ - Đồng bộ style với Patient Toolbar */}
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
            bgcolor: "var(--color-bg-input)", // Sử dụng biến CSS đồng bộ
            borderRadius: 2, // Bo góc đồng bộ (thay vì 50px pill)
            minWidth: "280px",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": {
                border: "1px solid #e2e8f0", // Hoặc giữ border: 'none' nếu muốn giống hệt mẫu Patient
              },
              "&:hover fieldset": {
                borderColor: "var(--color-primary-main)",
              },
            },
          }}
        />

        {/* Nếu sau này bạn cần thêm bộ lọc Category/Status cho Service, 
            bạn có thể thêm một Select tương tự như Gender vào đây */}
      </Box>

      {/* Vị trí này thường dành cho nút 'Create Service' nếu bạn 
          muốn chuyển nút đó từ file List vào trong Toolbar này */}
    </Box>
  );
}