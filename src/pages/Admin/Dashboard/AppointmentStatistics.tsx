import { Box, Card, Divider, Typography } from "@mui/material";
import { Circle, } from "lucide-react";
import AppointmentsChart from "./AppointmentsChart";
import { useEffect, useState } from "react";
import { apiCall } from "../../../api/api";
import { useNavigate } from "react-router-dom";
 const fakeStatBoxItems = [
        { label: "Total", color: "var(--color-primary-main)", value: 1532 },
        { label: "Cancelled", color: "var(--color-error-main)", value: 246 },
        { label: "Not shown", color: "var(--color-warning-main)", value: 175 },
        { label: "Completed", color: "var(--color-success-main)", value: 1036 },
    ]
export default function AppointmentStatistics() {
    const [statBoxItems,setStatBoxItems] = useState(fakeStatBoxItems);
    const navigate = useNavigate();
    useEffect(()=>{
        const accessToken = localStorage.getItem("accessToken");
             apiCall("admin/appointment_statistic","GET",accessToken?accessToken:"",null,(responseData:any)=>{
              setStatBoxItems([
                { label: "Total", color: "var(--color-primary-main)", value: responseData.data.total },
                { label: "Cancelled", color: "var(--color-error-main)", value: responseData.data.cancelled },
                { label: "Not shown", color: "var(--color-warning-main)", value: responseData.data.noshow },
                { label: "Completed", color: "var(--color-success-main)", value: responseData.data.completed },
                { label: "Scheduled", color: "var(--color-success-main)", value: responseData.data.scheduled },
                {label:"Confirmed",color:"var(--color-success-main)",value:responseData.data.confirmed}
              ])
             },(responseData:any)=>{
              alert(responseData.message);
              navigate("/admin");
             })
    },[])
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