import { Typography, Box, Card, } from "@mui/material";
import { MedicalInformation } from "@mui/icons-material";
import { CalendarCheck, } from "lucide-react";
import TodayAppointments from "./TodayAppointments";
import UpcomingAppointment from "./UpcomingAppointment";
import LastExamination from "./LastExaminations";
import { useEffect, useState } from "react";
import { apiCall } from "../../../api/api";

export default function DoctorDashboard() {
  const [dashBoardData, setDashboardData] = useState<any>();
  const [myName, setMyName] = useState<string>("");
  useEffect(()=>{
    const accessToken=localStorage.getItem("accessToken");
    apiCall("doctor/dashboard","GET",accessToken?accessToken:"",null,(data:any)=>{
      console.log(data.data);
      setDashboardData(data.data);
    },(data:any)=>{
      alert(data.message);
    });
    apiCall("account/me","GET",accessToken?accessToken:"",null,(data:any)=>{
      setMyName(data.data.fullName);
    },(data:any)=>{
      alert(data.message);
    })
  },[]);
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '26px 56px',
      height: '100%',
    }}>
      <Box margin="0px 25px 18px 25px" display="flex" gap={1}>
        <Typography sx={{
          fontWeight: 'bold',
          fontSize: '24px'
        }}>
          Welcome,
        </Typography>
        <Typography sx={{
          color: "var(--color-primary-main)",
          fontWeight: 'bold',
          fontSize: '24px'
        }}>
          Dr. {myName}
        </Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        gap: 3,
        minHeight: 0,
      }}>
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          <Box minHeight="0" sx={{
            flex: 1.1,
          }}>
            <LastExamination lastAppointment={dashBoardData?dashBoardData.latestAppointment:null} />
          </Box>
          <Box minHeight="0" sx={{
            flex: 1,
          }}>
            <UpcomingAppointment nextAppointment={dashBoardData?dashBoardData.upcomingAppointment:null} />
          </Box>
        </Box>

        <Box sx={{
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}>
          <Box sx={{
            flex: 1,
            display: 'flex',
            gap: 3,
          }}>
            <Card sx={{
              flex: 1,
              display: 'flex',
              alignItems: "center",
              gap: 5,
              padding: '18px 75px 18px 45px',
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
            }}>
              <MedicalInformation sx={{
                color: "var(--color-primary-main)",
                fontSize: '38px'
              }} />
              <Box>
                <Typography sx={{
                  fontWeight: 'bold',
                  fontSize: '22px',
                  lineHeight: 1.3
                }}>
                  {dashBoardData?.recordAmount}
                </Typography>
                <Typography sx={{
                  fontSize: '14px'
                }}>
                  Medical Records
                </Typography>
              </Box>
            </Card>

            <Card sx={{
              flex: 1,
              display: 'flex',
              alignItems: "center",
              gap: 5,
              padding: '18px 75px 18px 45px',
              borderRadius: 2,
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
            }}>
              <CalendarCheck size="38px" color="var(--color-primary-main)" />

              <Box>
                <Typography sx={{
                  fontWeight: 'bold',
                  fontSize: '22px',
                  lineHeight: 1.3
                }}>
                  {dashBoardData?.appointmentAmount}
                </Typography>
                <Typography sx={{
                  fontWeight: 'medium',
                  fontSize: '14px'
                }}>
                  Appointments
                </Typography>
              </Box>
            </Card>
          </Box>

          <Box flex={4} minHeight="0">
            <TodayAppointments appointments={dashBoardData?dashBoardData.todayAppointment:[]} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
