import { Box, Card, Divider, Typography } from "@mui/material";
import { Circle, } from "lucide-react";
import AppointmentsChart from "./AppointmentsChart";

export default function AppointmentStatistics() {
    const statBoxItems = [
        { label: "Total", color: "var(--color-primary-main)", value: 1532 },
        { label: "Cancelled", color: "var(--color-error-main)", value: 246 },
        { label: "Not shown", color: "var(--color-warning-main)", value: 175 },
        { label: "Completed", color: "var(--color-success-main)", value: 1036 },
    ]
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            m: '6px',
            padding: '18px 30px',
            borderRadius: 2,
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
        }}>
            <Typography sx={{ fontSize: '22px', fontWeight: 'bold', mb: 1.5, }}>
                Appointment Statistics
            </Typography>
            <Divider />
            <Box sx={{ display: 'flex', gap: 3, mt: 2.5, }}>
                {statBoxItems.map((item, index) => (
                    <Box key={index} sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: '#f5faff',
                        border: '1px solid var(--color-border)',
                        paddingY: '8px',
                        borderRadius: 1,
                    }}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Circle
                                fill={item.color}
                                stroke="none"
                                size={14} />
                            <Typography color="var(--color-text-secondary)">
                                {item.label}
                            </Typography>
                        </Box>
                        <Typography fontWeight="bold" fontSize={18}>
                            {item.value}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Box flex={1}>
                <AppointmentsChart />
            </Box>
        </Card>
    )
}