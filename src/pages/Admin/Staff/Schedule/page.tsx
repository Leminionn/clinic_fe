import { useEffect, useState } from "react";
import {
   Box,
   Button,
   Card,
   Typography,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   Chip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "@mui/icons-material";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { staffGetById, staffScheduleGetByStaffId } from "../../../../api/urls";

interface StaffSchedule {
   scheduleId: number;
   dayOfWeek: string;
   startTime: string;
   endTime: string;
   active: boolean;
}

interface StaffInfo {
   staffId: number;
   fullName: string;
   role: string;
}

const daysOfWeek: any = {
   MONDAY: "Monday",
   TUESDAY: "Tuesday",
   WEDNESDAY: "Wednesday",
   THURSDAY: "Thursday",
   FRIDAY: "Friday",
   SATURDAY: "Saturday",
   SUNDAY: "Sunday",
};

const dayOrder = [
   "MONDAY",
   "TUESDAY",
   "WEDNESDAY",
   "THURSDAY",
   "FRIDAY",
   "SATURDAY",
   "SUNDAY",
];

function getRoleLabel(role: string) {
   const labels: any = {
      DOCTOR: "Doctor",
      RECEPTIONIST: "Receptionist",
      WAREHOUSE_STAFF: "Warehouse Staff",
   };
   return labels[role] || role;
}

export default function StaffSchedule() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
   const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!id) return;

      const token = localStorage.getItem("accessToken");

      // Fetch staff info
      apiCall(
         staffGetById(Number(id)),
         "GET",
         token,
         null,
         (res: any) => {
            setStaffInfo(res.data || null);
         },
         (err: any) => {
            console.error(err);
            showMessage("Cannot load staff information", "error");
         }
      );

      // Fetch schedules
      apiCall(
         staffScheduleGetByStaffId(Number(id)),
         "GET",
         token,
         null,
         (res: any) => {
            const data = res.data || [];
            // Sort schedules by day of week
            const sortedData = data.sort(
               (a: StaffSchedule, b: StaffSchedule) =>
                  dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
            );
            setSchedules(sortedData);
            setLoading(false);
         },
         (err: any) => {
            console.error(err);
            showMessage("Cannot load schedule", "error");
            setLoading(false);
         }
      );
   }, [id]);

   if (loading) {
      return (
         <Box p={4} display="flex" justifyContent="center" alignItems="center">
            <Typography>Loading...</Typography>
         </Box>
      );
   }

   return (
      <Box sx={{ p: 3 }}>
         {/* Header */}
         <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Button
               startIcon={<ChevronLeft />}
               onClick={() => navigate(`/admin/staff/${id}`)}
            >
               Back
            </Button>
            <Typography variant="h5" fontWeight="bold">
               Schedule
            </Typography>
         </Box>

         {/* Staff Info Card */}
         {staffInfo && (
            <Card sx={{ p: 2, mb: 3 }}>
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     gap: 2,
                     justifyContent: "space-between",
                  }}
               >
                  <Box>
                     <Typography variant="h6" fontWeight="bold">
                        {staffInfo.fullName}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        {getRoleLabel(staffInfo.role)}
                     </Typography>
                  </Box>
               </Box>
            </Card>
         )}

         {/* Schedule Table */}
         <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
               Weekly Schedule
            </Typography>

            {schedules.length > 0 ? (
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Day</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                           Start Time
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                           End Time
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                           Status
                        </TableCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {schedules.map((schedule) => (
                        <TableRow key={schedule.scheduleId}>
                           <TableCell>
                              <Typography fontWeight={500}>
                                 {daysOfWeek[schedule.dayOfWeek] ||
                                    schedule.dayOfWeek}
                              </Typography>
                           </TableCell>
                           <TableCell>{schedule.startTime}</TableCell>
                           <TableCell>{schedule.endTime}</TableCell>
                           <TableCell>
                              <Chip
                                 label={schedule.active ? "Active" : "Inactive"}
                                 size="small"
                                 color={schedule.active ? "success" : "default"}
                              />
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            ) : (
               <Box
                  sx={{
                     display: "flex",
                     justifyContent: "center",
                     alignItems: "center",
                     py: 4,
                  }}
               >
                  <Typography variant="body2" color="text.secondary">
                     No schedules available
                  </Typography>
               </Box>
            )}
         </Card>

         {/* Info Note */}
         <Card sx={{ p: 2, mt: 3, backgroundColor: "#f5f5f5" }}>
            <Typography variant="body2" color="text.secondary">
               <strong>Note:</strong> This is a view-only schedule screen. To change schedules, please contact the system administrator.
            </Typography>
         </Card>
      </Box>
   );
}
