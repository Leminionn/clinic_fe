import { useState } from "react";
import { Card, Box, Typography, Divider, } from "@mui/material";

import MedicineImportToolbar from "./MedicineImportToolbar";
import MedicineImportTable from "./MedicineImportTable";
import dayjs from "dayjs";

export default function MedicineImportList() {
  const [searchKey, setSearchKey] = useState("");
  // Date range: từ đầu tháng đến hôm nay
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));

  
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 50px',
      height: '100%',
      overflow: 'auto'
    }}>
      <Typography variant="h5" fontWeight="bold" mx={4} mb={3}>
        Medicine Import History
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
          <MedicineImportToolbar
            searchKey={searchKey}
            onChangeSearchKey={setSearchKey}
            fromDate={fromDate}
            onChangeFromDate={setFromDate}
            toDate={toDate}
            onChangeToDate={setToDate}
          />

          <Divider />

          <Box flex={1} mt={3}>
            <MedicineImportTable fromDate={fromDate} toDate={toDate} searchKey={searchKey}/>
          </Box>
        </Card>
      </Box>

    </Box>
  );
}
