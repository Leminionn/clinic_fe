import { useEffect, useState } from "react";
import { Box, Button, Card, Typography, Chip, Grid, Divider, Table, TableBody, TableCell, TableHead, TableRow, TablePagination } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Edit, Male, Female } from "@mui/icons-material";
import { Calendar, IdCard, Mail, Phone, Briefcase, CalendarClock } from "lucide-react";
import dayjs from "dayjs";
import { showMessage } from "../../../../components/ActionResultMessage";
import { apiCall } from "../../../../api/api";
import { staffGetById, staffDelete, staffScheduleGetByStaffId } from "../../../../api/urls";
import AlertDialog from "../../../../components/AlertDialog";

interface StaffDetail {
   staffId: number;
   fullName: string;
   dateOfBirth: string;
   gender: string;
   email: string;
   phone: string;
   idCard: string;
   address: string;
   role: string;
   specialization?: string;
   hireDate: string;
   active: boolean;
}

function getRoleLabel(role: string) {
   const labels: any = {
      DOCTOR: "Doctor",
      RECEPTIONIST: "Receptionist",
      WAREHOUSE_STAFF: "Warehouse Staff",
   };
   return labels[role] || role;
}

function getGenderLabel(gender: string) {
   const labels: any = {
      MALE: "Male",
      FEMALE: "Female",
      OTHER: "Other",
   };
   return labels[gender] || gender;
}

export default function StaffDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [data, setData] = useState<StaffDetail | null>(null);
   const [loading, setLoading] = useState(true);
   const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
   const [schedules, setSchedules] = useState<any[]>([]);
   const [schedulesLoading, setSchedulesLoading] = useState(true);

   const [page, setPage] = useState(0);
   const [rowsPerPage, setRowsPerPage] = useState(10);

   const formatDateDDMMYYYY = (dateStr: any) => {
      if (!dateStr) return "";
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return String(dateStr);
      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const yyyy = dt.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
   };

   useEffect(() => {
      if (!id) return;

      const token = localStorage.getItem("accessToken");
      apiCall(
         staffGetById(Number(id)),
         "GET",
         token,
         null,
         (res: any) => {
            setData(res.data || null);
            setLoading(false);
         },
         (err: any) => {
            console.error(err);
            setLoading(false);
            showMessage("Cannot load staff information", "error");
         }
      );
   }, [id]);

   // load schedules for this staff and show them on the same page
   useEffect(() => {
      if (!id) return;
      const token = localStorage.getItem("accessToken");
      setSchedulesLoading(true);
      apiCall(
         staffScheduleGetByStaffId(Number(id)),
         "GET",
         token,
         null,
         (res: any) => {
            const data = res.data || [];
            const getDayIndex = (s: any) => {
               const dayOrderMap: any = {
                  MONDAY: 0,
                  TUESDAY: 1,
                  WEDNESDAY: 2,
                  THURSDAY: 3,
                  FRIDAY: 4,
                  SATURDAY: 5,
                  SUNDAY: 6,
               };

               if (s?.dayOfWeek) {
                  const d = String(s.dayOfWeek).toUpperCase();
                  if (d in dayOrderMap) return dayOrderMap[d];
               }

               const dateStr = s?.scheduleDate || s?.schedule_date || s?.schedule_date_string || s?.schedule_date_str;
               if (dateStr) {
                  const dt = new Date(dateStr);
                  if (!isNaN(dt.getTime())) {
                     const jsDay = dt.getDay();
                     return jsDay === 0 ? 6 : jsDay - 1;
                  }
               }

               return 99;
            };

            const sorted = data.sort((a: any, b: any) => getDayIndex(a) - getDayIndex(b));

            // Merge contiguous slots per date/day key
            const timeToMinutes = (t: string) => {
               if (!t) return NaN;
               const parts = String(t).split(":");
               const hh = Number(parts[0] || 0);
               const mm = Number(parts[1] || 0);
               return hh * 60 + mm;
            };

            const getDayKey = (s: any) => {
               const dateStr = s?.scheduleDate || s?.schedule_date || s?.schedule_date_string || s?.schedule_date_str;
               if (dateStr) return String(dateStr);
               return String(s?.dayOfWeek || s?.scheduleDay || s?.schedule_day || "").toUpperCase();
            };

            const normalizeStatus = (s: any) => {
               if (!s && s !== 0) return undefined;
               const v = String(s).toUpperCase();
               if (v === "AVAILABLE" || v === "ON_LEAVE" || v === "CANCELLED") return v;
               return undefined;
            };

            const merged: any[] = [];
            for (const item of sorted) {
               const key = getDayKey(item);
               const last = merged.length ? merged[merged.length - 1] : null;
               const itemStart = timeToMinutes(item.startTime);
               if (
                  last &&
                  getDayKey(last) === key &&
                  !isNaN(itemStart) &&
                  !isNaN(timeToMinutes(last.endTime)) &&
                  timeToMinutes(last.endTime) === itemStart
               ) {
                  last.endTime = item.endTime;
               } else {
                  merged.push({ ...item });
               }
            }

            setSchedules(merged);
            setSchedulesLoading(false);
         },
         (err: any) => {
            console.error(err);
            setSchedulesLoading(false);
         }
      );
   }, [id]);

   const handleDeleteConfirm = () => {
      setIsConfirmDialogOpen(true);
   };

   const handleDelete = () => {
      const token = localStorage.getItem("accessToken");
      apiCall(
         staffDelete(Number(id)),
         "DELETE",
         token,
         null,
         () => {
            showMessage("Staff deleted successfully!");
            setIsConfirmDialogOpen(false);
            // Navigate back to the appropriate list based on role
            if (data?.role) {
               const roleRoutes: any = {
                  DOCTOR: "/admin/staff/doctors",
                  RECEPTIONIST: "/admin/staff/receptionists",
                  WAREHOUSE_STAFF: "/admin/staff/warehouse-staffs",
               };
               navigate(roleRoutes[data.role] || "/admin/staff/doctors");
            } else {
               navigate(-1);
            }
         },
         (err: any) => {
            console.error(err);
            showMessage(err?.message || "Cannot delete staff", "error");
         }
      );
   };

   if (loading) {
      return (
         <Box p={4} display="flex" justifyContent="center" alignItems="center">
            <Typography>Loading...</Typography>
         </Box>
      );
   }

   if (!data) {
      return (
         <Box p={4}>
            <Typography>Staff not found</Typography>
         </Box>
      );
   }

   return (
      <Box sx={{ p: 3 }}>
         {/* Header */}
         <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Button
               startIcon={<ChevronLeft />}
               onClick={() => navigate(-1)}
            >
               Back
            </Button>
            <Typography variant="h5" fontWeight="bold">
               Staff Details
            </Typography>
         </Box>

         {/* Staff Information Card */}
         <Card sx={{ mb: 3, overflow: "hidden" }}>
            {/* Header Section */}
            <Box
               sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  p: 3,
                  color: "white",
               }}
            >
               <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                     <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Staff ID #{data.staffId}
                     </Typography>
                     <Typography variant="h4" fontWeight="bold" mb={1}>
                        {data.fullName}
                     </Typography>
                     <Chip
                        label={getRoleLabel(data.role)}
                        size="small"
                        sx={{
                           bgcolor: "rgba(255,255,255,0.2)",
                           color: "white",
                           fontWeight: 600,
                           backdropFilter: "blur(10px)",
                        }}
                     />
                  </Box>
                  <Box display="flex" gap={1.5} alignItems="center">
                     <Chip
                        icon={
                           data.active ? (
                              <Box
                                 sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "#4caf50",
                                    ml: 1,
                                 }}
                              />
                           ) : undefined
                        }
                        label={data.active ? "Active" : "Inactive"}
                        sx={{
                           bgcolor: data.active ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
                           color: "white",
                           fontWeight: 600,
                           backdropFilter: "blur(10px)",
                           border: data.active ? "1px solid rgba(76, 175, 80, 0.3)" : "1px solid rgba(244, 67, 54, 0.3)",
                        }}
                     />
                     <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/admin/staff/edit/${id}`, { state: { from: window.location.pathname } })}
                        sx={{
                           bgcolor: "rgba(255,255,255,0.95)",
                           color: "#667eea",
                           fontWeight: 600,
                           "&:hover": {
                              bgcolor: "white",
                           },
                        }}
                     >
                        Edit
                     </Button>
                     <Button
                        variant="outlined"
                        onClick={handleDeleteConfirm}
                        sx={{
                           borderColor: "rgba(255,255,255,0.5)",
                           color: "white",
                           fontWeight: 600,
                           "&:hover": {
                              borderColor: "white",
                              bgcolor: "rgba(255,255,255,0.1)",
                           },
                        }}
                     >
                        Delete
                     </Button>
                  </Box>
               </Box>
            </Box>

            {/* Information Grid */}
            <Box sx={{ p: 3 }}>
               <Grid container spacing={3}>
                  {/* Contact Information */}
                  <Grid item xs={12} md={6}>
                     <Box
                        sx={{
                           p: 2.5,
                           border: "1px solid",
                           borderColor: "divider",
                           borderRadius: 2,
                           height: "100%",
                           transition: "all 0.3s ease",
                           "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              transform: "translateY(-2px)",
                           },
                        }}
                     >
                        <Typography
                           variant="overline"
                           sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 1 }}
                        >
                           Contact Information
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                           <Box display="flex" alignItems="center" gap={1.5}>
                              <Box
                                 sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: "#E3F2FD",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                              >
                                 <Phone size={18} color="#1976d2" />
                              </Box>
                              <Box>
                                 <Typography variant="caption" color="text.secondary">
                                    Phone
                                 </Typography>
                                 <Typography variant="body1" fontWeight={500}>
                                    {data.phone}
                                 </Typography>
                              </Box>
                           </Box>
                           <Box display="flex" alignItems="center" gap={1.5}>
                              <Box
                                 sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: "#FFF3E0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                              >
                                 <Mail size={18} color="#f57c00" />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                 <Typography variant="caption" color="text.secondary">
                                    Email
                                 </Typography>
                                 <Typography
                                    variant="body1"
                                    fontWeight={500}
                                    sx={{
                                       overflow: "hidden",
                                       textOverflow: "ellipsis",
                                       whiteSpace: "nowrap",
                                    }}
                                 >
                                    {data.email}
                                 </Typography>
                              </Box>
                           </Box>
                        </Box>
                     </Box>
                  </Grid>

                  {/* Personal Details */}
                  <Grid item xs={12} md={6}>
                     <Box
                        sx={{
                           p: 2.5,
                           border: "1px solid",
                           borderColor: "divider",
                           borderRadius: 2,
                           height: "100%",
                           transition: "all 0.3s ease",
                           "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              transform: "translateY(-2px)",
                           },
                        }}
                     >
                        <Typography
                           variant="overline"
                           sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 1 }}
                        >
                           Personal Details
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                           <Box display="flex" alignItems="center" gap={1.5}>
                              <Box
                                 sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: "#F3E5F5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                              >
                                 <Calendar size={18} color="#7b1fa2" />
                              </Box>
                              <Box>
                                 <Typography variant="caption" color="text.secondary">
                                    Date of Birth
                                 </Typography>
                                 <Typography variant="body1" fontWeight={500}>
                                    {dayjs(new Date(data.dateOfBirth)).format("DD MMM YYYY")}
                                 </Typography>
                              </Box>
                           </Box>
                           <Box display="flex" alignItems="center" gap={1.5}>
                              <Box
                                 sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: getGenderLabel(data.gender) === "Male" ? "#E3F2FD" : "#FCE4EC",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                              >
                                 {getGenderLabel(data.gender) === "Male" ? (
                                    <Male sx={{ fontSize: 20, color: "#1976d2" }} />
                                 ) : (
                                    <Female sx={{ fontSize: 20, color: "#c2185b" }} />
                                 )}
                              </Box>
                              <Box>
                                 <Typography variant="caption" color="text.secondary">
                                    Gender
                                 </Typography>
                                 <Typography variant="body1" fontWeight={500}>
                                    {getGenderLabel(data.gender)}
                                 </Typography>
                              </Box>
                           </Box>
                        </Box>
                     </Box>
                  </Grid>

                  {/* Employment Information (commented out) */}
                  {/* ID & Address */}
                  <Grid item xs={12} md={6}>
                     <Box
                        sx={{
                           p: 2.5,
                           border: "1px solid",
                           borderColor: "divider",
                           borderRadius: 2,
                           height: "100%",
                           transition: "all 0.3s ease",
                           "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              transform: "translateY(-2px)",
                           },
                        }}
                     >
                        <Typography
                           variant="overline"
                           sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 1 }}
                        >
                           Identification
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                           <Box display="flex" alignItems="center" gap={1.5}>
                              <Box
                                 sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: "#FFEBEE",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                              >
                                 <IdCard size={18} color="#c62828" />
                              </Box>
                              <Box>
                                 <Typography variant="caption" color="text.secondary">
                                    ID Card
                                 </Typography>
                                 <Typography variant="body1" fontWeight={500}>
                                    {data.idCard}
                                 </Typography>
                              </Box>
                           </Box>
                           <Box display="flex" gap={1.5}>
                              <Box
                                 sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    bgcolor: "#E0F2F1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                 }}
                              >
                                 <Typography sx={{ fontSize: 18 }}>📍</Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                 <Typography variant="caption" color="text.secondary">
                                    Address
                                 </Typography>
                                 <Typography variant="body1" fontWeight={500}>
                                    {data.address}
                                 </Typography>
                              </Box>
                           </Box>
                        </Box>
                     </Box>
                  </Grid>
               </Grid >
            </Box >
         </Card >

         {/* DO NOT MODIFY: Staff Information section removed (replaced above) */}
         {
            false && <Grid container spacing={3}>
               {/* Old grid content hidden by false && above */}
               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Date of Birth (OLD - DO NOT DISPLAY)
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {formatDateDDMMYYYY(data.dateOfBirth)}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Gender
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {getGenderLabel(data.gender)}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.email}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Phone
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.phone}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     ID Card
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.idCard}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Hire Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {formatDateDDMMYYYY(data.hireDate)}
                  </Typography>
               </Grid>

               {/* Specialization display in details commented per request
            {data.role === "DOCTOR" && data.specialization && (
               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Specialization
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.specialization}
                  </Typography>
               </Grid>
            )}
            */}

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Address
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                     {data.address}
                  </Typography>
               </Grid>

               <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                     Status
                  </Typography>
                  <Box mb={2}>
                     <Chip
                        label={data.active ? "Active" : "Inactive"}
                        size="small"
                        color={data.active ? "success" : "error"}
                        sx={{ mt: 0.5 }}
                     />
                  </Box>
               </Grid>
            </Grid>
         }

         {/* Inline Weekly Schedule: integrated into the detail page */}
         <Card sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
               Weekly Schedule
            </Typography>

            {schedulesLoading ? (
               <Typography>Loading schedule...</Typography>
            ) : schedules.length > 0 ? (
               <>
                  <Table>
                     <TableHead>
                        <TableRow>
                           <TableCell sx={{ fontWeight: "bold" }}>Day</TableCell>
                           <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                           <TableCell sx={{ fontWeight: "bold" }}>Start Time</TableCell>
                           <TableCell sx={{ fontWeight: "bold" }}>End Time</TableCell>
                           {/* Status column removed; handled elsewhere */}
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {schedules.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((schedule) => {
                           // prefer explicit dayOfWeek, otherwise fallback to schedule date fields
                           const raw = schedule.dayOfWeek ?? schedule.scheduleDay ?? schedule.schedule_day;
                           let dayLabel = "";
                           if (!raw) {
                              const dateStr = schedule.scheduleDate || schedule.schedule_date || schedule.schedule_date_string || schedule.schedule_date_str;
                              if (dateStr) {
                                 const dt = new Date(dateStr);
                                 if (!isNaN(dt.getTime())) {
                                    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                    dayLabel = names[dt.getDay()];
                                 }
                              }
                           } else {
                              const s = String(raw).toUpperCase();
                              const daysOfWeek: any = {
                                 MONDAY: "Monday",
                                 TUESDAY: "Tuesday",
                                 WEDNESDAY: "Wednesday",
                                 THURSDAY: "Thursday",
                                 FRIDAY: "Friday",
                                 SATURDAY: "Saturday",
                                 SUNDAY: "Sunday",
                              };
                              if (daysOfWeek[s]) dayLabel = daysOfWeek[s];
                              else if (/^[1-7]$/.test(s)) {
                                 const num = Number(s);
                                 const ord = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
                                 dayLabel = daysOfWeek[ord[num - 1]] || String(raw);
                              } else {
                                 dayLabel = String(raw).charAt(0).toUpperCase() + String(raw).slice(1).toLowerCase();
                              }
                           }

                           return (
                              <TableRow key={schedule.scheduleId}>
                                 <TableCell>
                                    <Typography fontWeight={500}>{dayLabel}</Typography>
                                 </TableCell>
                                 <TableCell>
                                    {(() => {
                                       const dateStr = schedule.scheduleDate || schedule.schedule_date || schedule.schedule_date_string || schedule.schedule_date_str;
                                       if (!dateStr) return "";
                                       return formatDateDDMMYYYY(dateStr);
                                    })()}
                                 </TableCell>
                                 <TableCell>{schedule.startTime}</TableCell>
                                 <TableCell>{schedule.endTime}</TableCell>
                                 {/* Status removed */}
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
                  <TablePagination
                     component="div"
                     count={schedules.length}
                     page={page}
                     onPageChange={(e, newPage) => setPage(newPage)}
                     rowsPerPage={rowsPerPage}
                     onRowsPerPageChange={(e) => { setRowsPerPage(parseInt((e.target as HTMLInputElement).value, 10)); setPage(0); }}
                     rowsPerPageOptions={[5, 10, 25]}
                  />
               </>
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

         {/* Delete Confirmation Dialog */}
         <AlertDialog
            title={"Are you sure you want to delete this staff member?"}
            type="error"
            open={isConfirmDialogOpen}
            setOpen={setIsConfirmDialogOpen}
            buttonCancel="Cancel"
            buttonConfirm="Delete"
            onConfirm={handleDelete}
         />
      </Box >
   );
}
