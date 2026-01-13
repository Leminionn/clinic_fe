import { useEffect, useState } from 'react';
import {
   Box, Typography, Button,
   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
   Paper, Container, Stack, Chip
} from '@mui/material';
import {
   Add, Inventory, LocalShipping,
   Warning, TrendingUp, Medication, EventBusy,
   Today, History
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { apiCall } from '../../../api/api';
import { warehouseDashboardStats } from '../../../api/urls';

// Define interface for response
interface WarehouseDashboardData {
   totalMedicines: number;
   totalOutOfStock: number;
   totalExpiringSoon: number;
   totalImportValueMonth: number;
   recentImports: any[];
}

export default function WarehouseStaffDashboard() {
   const navigate = useNavigate();
   const { token } = useAuth();
   const [data, setData] = useState<WarehouseDashboardData | null>(null);

   useEffect(() => {
      const fetchStats = async () => {
         // Assuming apiCall handles the full URL relative to base
         await apiCall(warehouseDashboardStats, 'GET', token, null, (res: any) => setData(res.data), (err: any) => console.error(err));
      };
      fetchStats();
   }, [token]);

   const stats = [
      {
         label: 'Total Medicines',
         value: data?.totalMedicines || 0,
         color: '#3b82f6', // blue-500
         bgcolor: '#eff6ff', // blue-50
         icon: <Medication sx={{ fontSize: 40, color: '#3b82f6' }} />
      },
      {
         label: 'Low Stock',
         value: data?.totalOutOfStock || 0,
         color: '#ef4444', // red-500
         bgcolor: '#fef2f2', // red-50
         icon: <Warning sx={{ fontSize: 40, color: '#ef4444' }} />
      },
      {
         label: 'Expiring Soon (30d)',
         value: data?.totalExpiringSoon || 0,
         color: '#f97316', // orange-500
         bgcolor: '#fff7ed', // orange-50
         icon: <EventBusy sx={{ fontSize: 40, color: '#f97316' }} />
      },
      {
         label: 'Monthly Import Value',
         value: (data?.totalImportValueMonth || 0).toLocaleString('en-US') + ' VND',
         color: '#10b981', // green-500
         bgcolor: '#ecfdf5', // green-50
         icon: <TrendingUp sx={{ fontSize: 40, color: '#10b981' }} />
      },
   ];

   return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
         {/* Top Bar */}
         <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
            <Box>
               <Typography variant="h4" fontWeight="800" color="primary.main">
                  Warehouse Dashboard
               </Typography>
               <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                  <Today fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" fontWeight="500">
                     {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Typography>
               </Stack>
            </Box>
         </Box>

         {/* Stats Cards */}
         <Box
            sx={{
               mb: 5,
               display: 'grid',
               gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
               gap: 3
            }}
         >
            {stats.map((stat, index) => (
               <Paper
                  key={index}
                  elevation={0}
                  sx={{
                     p: 3,
                     borderRadius: 4,
                     border: '1px solid #e0e6ed',
                     height: '100%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     transition: 'transform 0.2s',
                     '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                     }
                  }}
               >
                  <Box>
                     <Typography color="text.secondary" variant="body2" fontWeight="600" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {stat.label}
                     </Typography>
                     <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b' }}>
                        {stat.value}
                     </Typography>
                  </Box>
                  <Box
                     sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: stat.bgcolor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                     }}
                  >
                     {stat.icon}
                  </Box>
               </Paper>
            ))}
         </Box>

         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
               gap: 4
            }}
         >
            {/* Left Column: Recent Activity */}
            <Box>
               <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="700" color="#334155">
                     Recent Imports
                  </Typography>
                  <Button variant="text" size="small" endIcon={<History />} onClick={() => navigate('/warehouse-staff/medicine-imports')}>
                     View All
                  </Button>
               </Box>

               <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #eef2f6' }}>
                  <Table>
                     <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                           <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Import ID</TableCell>
                           <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Date</TableCell>
                           <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Supplier</TableCell>
                           <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }} align="right">Quantity</TableCell>
                           <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }} align="right">Total Value</TableCell>
                        </TableRow>
                     </TableHead>
                     <TableBody>
                        {data?.recentImports?.map((row) => (
                           <TableRow key={row.importId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell>
                                 <Typography variant="body2" fontWeight="600" color="primary">#{row.importId}</Typography>
                              </TableCell>
                              <TableCell>
                                 <Typography variant="body2">{new Date(row.importDate).toLocaleDateString('en-US')}</Typography>
                              </TableCell>
                              <TableCell>
                                 <Typography variant="body2" fontWeight="500">{row.supplier}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                 <Chip label={row.totalQuantity} size="small" sx={{ bgcolor: '#dcfce7', fontWeight: 'bold', color: '#16a34a' }} />
                              </TableCell>
                              <TableCell align="right">
                                 <Typography variant="body2" fontWeight="600" color="#059669">
                                    {(row.totalValue || 0).toLocaleString('en-US')}
                                 </Typography>
                              </TableCell>
                           </TableRow>
                        ))}
                        {(!data?.recentImports || data.recentImports.length === 0) && (
                           <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                 No recent activity found
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </TableContainer>
            </Box>

            {/* Right Column: Quick Actions */}
            <Box>
               <Typography variant="h6" fontWeight="700" color="#334155" sx={{ mb: 2 }}>
                  Quick Actions
               </Typography>

               <Stack spacing={2}>
                  <Paper
                     elevation={0}
                     sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1px solid #e0e6ed',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                     }}
                     onClick={() => navigate('/warehouse-staff/medicine-imports/create')}
                  >
                     <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#e0f2fe', color: '#0284c7' }}>
                           <LocalShipping />
                        </Box>
                        <Box>
                           <Typography variant="subtitle1" fontWeight="700">Import Medicine</Typography>
                           <Typography variant="body2" color="text.secondary">Register new shipment arrival</Typography>
                        </Box>
                     </Stack>
                  </Paper>

                  <Paper
                     elevation={0}
                     sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1px solid #e0e6ed',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                     }}
                     onClick={() => navigate('/warehouse-staff/medicines/create')}
                  >
                     <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#dcfce7', color: '#16a34a' }}>
                           <Add />
                        </Box>
                        <Box>
                           <Typography variant="subtitle1" fontWeight="700">Add New Medicine</Typography>
                           <Typography variant="body2" color="text.secondary">Create new medicine listing</Typography>
                        </Box>
                     </Stack>
                  </Paper>

                  <Paper
                     elevation={0}
                     sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1px solid #e0e6ed',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
                     }}
                     onClick={() => navigate('/warehouse-staff/medicines')}
                  >
                     <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f1f5f9', color: '#64748b' }}>
                           <Inventory />
                        </Box>
                        <Box>
                           <Typography variant="subtitle1" fontWeight="700">Inventory Status</Typography>
                           <Typography variant="body2" color="text.secondary">Check stock levels and details</Typography>
                        </Box>
                     </Stack>
                  </Paper>
               </Stack>
            </Box>
         </Box>
      </Container>
   );
}
