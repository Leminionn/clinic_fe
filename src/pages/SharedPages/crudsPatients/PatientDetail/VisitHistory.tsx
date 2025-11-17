import React, { useState } from "react";
import {
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import AppointmentsTab from "./AppointmentsTab";
import MedicalRecordsTab from "./MedicalRecordsTab";

export default function VisitHistory({ patientId }: { patientId: number }) {
  const [tab, setTab] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '90vh',
        width: '100%',
        gap: 4.5,
        padding: '20px 36px',
        borderRadius: 2,
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={handleChange}
          aria-label="Visit history tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: 16,
              '&.Mui-selected': {
                fontWeight: 'bold'
              }
            }
          }}
        >
          <Tab label="Appointments" />
          <Tab label="Medical Records" />
        </Tabs>
      </Box>

      <CardContent>
        {tab === 0 && <AppointmentsTab patientId={patientId} />}
        {tab === 1 && <MedicalRecordsTab patientId={patientId} />}
      </CardContent>
    </Card>
  );
}
