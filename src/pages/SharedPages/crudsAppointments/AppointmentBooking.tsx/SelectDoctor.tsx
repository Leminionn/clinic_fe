import { Avatar, Box, Card, FormControl, MenuItem, Select, Typography } from "@mui/material";
import type { IDoctor } from "./page";

export default function SelectDoctor({
  doctorsList,
  selectedDoctor,
  handleDoctorChange,
}: {
  doctorsList: IDoctor[],
  selectedDoctor: any;
  handleDoctorChange: any;
}) {
  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      mb: 3,
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography sx={{ fontWeight: 'bold', mb: 2.5, }}>
        Select Doctor
      </Typography>

      <FormControl fullWidth>
        <Select
          value={selectedDoctor?.id || ""}
          onChange={handleDoctorChange}
          displayEmpty
          sx={{
            borderRadius: 2,
            "& fieldset": {
              borderWidth: '3',
            },
            "& .MuiInputBase-input": {
              display: 'flex',
              alignItems: 'center',
              paddingY: '12px',
            },
          }}
        >
          <MenuItem value="" disabled>
            Choose a doctor
          </MenuItem>
          {doctorsList.map(item => (
            <MenuItem key={item.id} value={item.id}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: 1,
                paddingX: '10px',
              }}>
                {/*<Avatar src={item.image} sx={{ height: 36, width: 36, }} />*/}
                Dr. {item.fullName}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Card>
  );
}