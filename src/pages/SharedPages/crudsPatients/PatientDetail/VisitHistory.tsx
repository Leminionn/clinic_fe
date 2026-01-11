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
import InvoicesTab from "./InvoiceTab";

export default function VisitHistory({ patientId, patientTabs }: { patientId: number, patientTabs: any }) {
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
          <Tab label="Invoices" />
        </Tabs>
      </Box>

      <CardContent sx={{ maxHeight: 'calc(90vh - 150px)', overflowY: 'auto', padding: 0 }}>
        {tab === 0 && <AppointmentsTab patientId={patientId} appointments={patientTabs.appointments} />}
        {tab === 1 && <MedicalRecordsTab patientId={patientId} medicalRecords={patientTabs.medicalRecords} />}
        {tab === 2 && <InvoicesTab patientId={patientId} invoices={patientTabs.invoices} />}
      </CardContent>
    </Card>
  );
}
