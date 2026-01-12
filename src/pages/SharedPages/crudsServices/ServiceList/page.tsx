import { Box, Button, Card, Typography, Stack } from "@mui/material";
import React, { useState } from "react";
import ServiceTable from "./ServiceTable";
import { Add, AddCircleOutline } from "@mui/icons-material";
import theme from "../../../../theme";
import { useNavigate } from "react-router-dom";
import ServiceToolbar from "./ServiceToolBar";

export default function ServiecList() {
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: { xs: "20px", md: "26px 50px" },
        height: "100vh",
        overflow: "hidden", // Để thanh cuộn nằm trong Card
        bgcolor: "#f4f7fa", // Nền nhạt giúp Card nổi bật
      }}
    >
      {/* Header Row: Title, Search, and Action Button */}
 <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Services list
      </Typography>
      {/* Table Container */}
      <Card
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          border: "1px solid #eef2f6",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.03)",
          overflow: "hidden",
          paddingTop:"20px",
          marginTop:"20px"
        }}
      >
       
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            padding: "10px 24px", // Giảm padding 48px xuống 24px để cân đối hơn
          }}
        >
          <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        

        <ServiceToolbar
          searchKey={searchKey}
          onChangeSearchKey={setSearchKey}
        />

        <Button
                      variant="contained"
                      startIcon={<Add sx={{ height: 24, width: 24, }} />}
                      onClick={() => { navigate('/admin/service/create'); }}
                      sx={{
                        borderRadius: 1,
                        textTransform: "none"
                      }}
                    >
                      New Service
                    </Button>
      </Stack>
          <ServiceTable searchKey={searchKey} />
        </Box>
      </Card>
    </Box>
  );
}