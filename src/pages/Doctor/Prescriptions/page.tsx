import React, { useState } from "react";
import { Card, Box, Typography, Divider } from "@mui/material";
import dayjs from "dayjs";
import PrescriptionToolbar from "./PrescriptionToolBar";
import PrescriptionTable from "./PrescriptionTable";

export default function PrescriptionListPage() {
  const [searchKey, setSearchKey] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Prescriptions
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
          {/* Toolbar chứa Search và Date Filter */}
          <PrescriptionToolbar
            searchKey={searchKey}
            onChangeSearchKey={setSearchKey}
            date={selectedDate}
            onChangeDate={setSelectedDate}
          />

          <Divider />

          {/* Table hiển thị dữ liệu */}
          <Box flex={1} mt={2}>
            <PrescriptionTable
              searchKey={searchKey}
              date={selectedDate}
            />
          </Box>
        </Card>
      </Box>
    </Box>
  );
}