import React from "react";
import {
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Tooltip,
  IconButton
} from "@mui/material";
import { ReceiptLong, Paid, Person, AccountBalanceWallet, VisibilityOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import { useAuth } from "../../../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

// 1. Define Interface based on your Java Invoice Entity
export interface InvoiceDTO {
  invoiceId: number;
  invoiceDate: string; // Java Date -> String ISO
  
  // Fees (BigDecimal -> number/string)
  examinationFee: number;
  medicineFee: number;
  serviceFee: number;
  totalAmount: number;
  
  // Nested Objects & Enums
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'CANCELLED'; 
  paymentMethod: {
      paymentMethodId: number;
      methodName: string;
  } | null;
  issueBy: {
      staffId: number;
      fullName: string;
  } | null;
  
  // You might want patient details here if reused elsewhere, 
  // but for this tab context, patientId is likely known.
}

// Helper to format currency (VND)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Helper for Payment Status Colors
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return { color: 'var(--color-text-success)', bg: 'var(--color-bg-success)', label: 'Đã thanh toán' };
    case 'UNPAID':
      return { color: 'var(--color-text-error)', bg: 'var(--color-bg-error)', label: 'Chưa thanh toán' };
    case 'REFUNDED':
      return { color: '#b7791f', bg: '#fefcbf', label: 'Đã hoàn tiền' };
    default:
      return { color: '#718096', bg: '#edf2f7', label: status };
  }
};

interface InvoicesTabProps {
  patientId: number;
  invoices: InvoiceDTO[];
}

export default function InvoicesTab({ patientId, invoices }: InvoicesTabProps) {
  const role = useAuth();
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Payment history
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {invoices.length === 0 ? (
        <Box 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            bgcolor: '#f9fafb', 
            borderRadius: 2, 
            border: '1px dashed #ccc' 
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No Invoice
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
          <Table sx={{ minWidth: 850 }}>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Create date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Detail</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Create by</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((row) => {
                const statusInfo = getPaymentStatusColor(row.paymentStatus);

                return (
                  <TableRow
                    key={row.invoiceId}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, ':hover': { bgcolor: '#fdfdfd' }, verticalAlign: 'top' }}
                  >
                    {/* ID */}
                    <TableCell component="th" scope="row">
                      #{row.invoiceId}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ReceiptLong fontSize="small" color="action" sx={{ width: 16 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {row.invoiceDate ? dayjs(row.invoiceDate).format("DD/MM/YYYY") : "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Fee Breakdown */}
                    <TableCell>
                      <Stack spacing={0.5}>
                         <Box display="flex" justifyContent="space-between" width={180}>
                            <Typography variant="caption" color="text.secondary">Examination:</Typography>
                            <Typography variant="caption" fontWeight={500}>{formatCurrency(row.examinationFee)}</Typography>
                         </Box>
                         <Box display="flex" justifyContent="space-between" width={180}>
                            <Typography variant="caption" color="text.secondary">Medicine:</Typography>
                            <Typography variant="caption" fontWeight={500}>{formatCurrency(row.medicineFee)}</Typography>
                         </Box>
                         <Box display="flex" justifyContent="space-between" width={180}>
                            <Typography variant="caption" color="text.secondary">Service:</Typography>
                            <Typography variant="caption" fontWeight={500}>{formatCurrency(row.serviceFee)}</Typography>
                         </Box>
                      </Stack>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell>
                       <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {formatCurrency(row.totalAmount)}
                       </Typography>
                    </TableCell>

                    {/* Payment Status & Method */}
                    <TableCell>
                      <Stack spacing={1} alignItems="flex-start">
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: statusInfo.color,
                              bgcolor: statusInfo.bg,
                            }}
                          >
                            {statusInfo.label}
                          </Box>
                          {row.paymentMethod && (
                             <Box display="flex" alignItems="center" gap={0.5}>
                                <AccountBalanceWallet sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                   {row.paymentMethod.methodName}
                                </Typography>
                             </Box>
                          )}
                      </Stack>
                    </TableCell>

                    {/* Issued By */}
                    <TableCell>
                        {row.issueBy ? (
                            <Box display="flex" alignItems="center" gap={1}>
                                <Person fontSize="small" color="action" sx={{ width: 16 }} />
                                <Typography variant="body2">
                                    {row.issueBy.fullName}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="caption" color="text.secondary">System</Typography>
                        )}
                    </TableCell>
                    <TableCell align="center">
                        {role.role!="Doctor"&&<Tooltip title="Detail">
                            <IconButton
                                onClick={() => {
                                    // TODO: Thêm logic chuyển hướng hoặc mở modal tại đây
                                    let prefix="";
                                    if(role.role=="Admin") prefix="admin";
                                    if(role.role=="Receptionist") prefix="receptionist";
                                    
                                    navigate(`/${prefix}/invoices/${row.invoiceId}`)
                                    console.log("appointment ID:", row.invoiceId);
                                }}
                                sx={{
                                    color: 'var(--color-primary-main)', // Hoặc dùng màu cứng '#1976d2' nếu biến CSS chưa có
                                    border: '1px solid currentColor',
                                    borderRadius: 1.5,
                                    height: 32,
                                    width: 32,
                                    padding: 0,
                                    opacity: 0.8,
                                    '&:hover': {
                                        opacity: 1,
                                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                            >
                                <VisibilityOutlined sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}