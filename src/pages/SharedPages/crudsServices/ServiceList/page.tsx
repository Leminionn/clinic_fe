import { Box, Button, Card, Divider, Typography } from "@mui/material";
import React, { useState } from "react";
import ServiceTable from "./ServiceTable";
import { AddCircleOutline } from "@mui/icons-material";
import theme from "../../../../theme";
import { useNavigate } from "react-router-dom";
import ServiceToolbar from "./ServiceToolBar";
export default function ServiecList() {
    const navigate = useNavigate();
    const [searchKey, setSearchKey] = useState("");
    return (
        <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Box 
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mx={{ xs: 0, sm: 4 }} 
                mb={3}
            >
                <Typography variant="h5" fontWeight="bold">
                    Services
                </Typography>
                <ServiceToolbar
                searchKey={searchKey}
                onChangeSearchKey={setSearchKey}
                >

                </ServiceToolbar>

                {/* Nút "Create Service" đã được thêm */}
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutline />}
                   onClick={(e)=>{
                    e.preventDefault();
                    navigate("/admin/services/create");
                   }}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        // Sử dụng màu sắc từ theme
                        bgcolor: theme.palette.primary.main, 
                        '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                        },
                        py: 1,
                        px: 3
                    }}
                >
                    Create Service
                </Button>
            </Box>
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
          
          <Divider />

          <Box flex={1} mt={2}>
            <ServiceTable searchKey={searchKey}></ServiceTable>
          </Box>
        </Card>
      </Box>

    </Box>
    )
}