import { Box, Button, Card, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { apiCall } from "../../../../api/api";
import { useNavigate } from "react-router-dom";

export default function SelectTimeSlot({
  selectedDate,
  selectedDoctor,
  selectedTime,
  setSelectedTime,
  setSelectedSlotId,
  selectedSlotId
}: {
  selectedDate: string | null;
  selectedDoctor: any;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  setSelectedSlotId: (slotId:number)=>void;
  selectedSlotId: number;
}) {
  /*const timeSlots = [
    { time: "08:00 AM", available: true },
    { time: "08:30 AM", available: false },
    { time: "09:00 AM", available: true },
    { time: "09:30 AM", available: false },
    { time: "10:00 AM", available: true },
    { time: "10:30 AM", available: true },
    { time: "11:00 AM", available: false },
    { time: "11:30 AM", available: true },
    { time: "02:00 PM", available: true },
    { time: "02:30 PM", available: true },
    { time: "03:00 PM", available: false },
    { time: "03:30 PM", available: true },
    { time: "04:00 PM", available: true },
    { time: "04:30 PM", available: true },
  ];*/

  const [timeSlots, setTimeSlots] = useState<any[]>();
  const navigate = useNavigate();
  useEffect(()=>{
    if(!selectedDoctor||!selectedDate) {
      setTimeSlots([]);
      return;
    }
    const url = `unsecure/doctor_schedule?doctorId=${selectedDoctor.id}&selectedDate=${selectedDate}`;
    console.log("URLLLL",url);
    console.log(selectedDate);
    apiCall(url,"GET",null,null,(data:any)=>{
      const timeSlotsData= data.data.map(item=>{
        return {
          time: item.startTime,
          available: item.status=='AVAILABLE'?true:false,
          scheduleId: item.scheduleId
        }
      });
      setTimeSlots(timeSlotsData);
    },(data:any)=>{
      alert(data.message);
      navigate("/patient");
    })
  },[selectedDate,selectedDoctor]);

  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      mb: 3,
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography fontWeight={600}>
        Available Time Slots
      </Typography>

      {!selectedDoctor || !selectedDate ? (
        <Typography sx={{
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          py: 18,
        }}>
          Please select a doctor and date to view available time slots
        </Typography>
      ) : (
        <>
          <Typography sx={{
            color: 'var(--color-text-secondary)',
            fontSize: 14,
            mt: 0.5,
          }}>
            {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            mt: 3,
          }}>
            {timeSlots&&timeSlots.map((slot, index) => (
              

              <Button

                key={index}
                onClick={() =>{ 
                  slot.available && setSelectedTime(slot.time);
                  slot.available&&setSelectedSlotId(slot.scheduleId);
                }
                }
                disabled={!slot.available&&selectedSlotId!=slot.scheduleId}
                sx={{
                  opacity: !slot.available ? 0.7 : 1,
                  bgcolor: (slot.time === selectedTime||selectedSlotId==slot.scheduleId) ? 'var(--color-primary-main)' : 'var(--color-bg-default)',
                  color: (slot.time === selectedTime||selectedSlotId==slot.scheduleId) ? 'var(--color-primary-contrast)' : 'var(--color-text-primary)',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  border: '1px solid var(--color-border)',
                  '&:hover': {
                    bgcolor: 'var(--color-primary-main)',
                    color: 'var(--color-primary-contrast)',
                    border: 'none',
                  }
                }}
              >
                {slot.time}
                <br/>
                
               
                {!slot.available && (
                  <Typography sx={{ fontSize: 12, fontWeight: 'bold', ml: 1, }}>(Booked)</Typography>
                )}
              </Button>
            
            ))}
          </Box>
        </>
      )}
    </Card>
  );
}