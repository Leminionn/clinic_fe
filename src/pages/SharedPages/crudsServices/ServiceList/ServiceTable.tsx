import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    CircularProgress,
    Pagination,
    Select,
    MenuItem,
    IconButton,
} from '@mui/material';
import { CloseRounded, VisibilityOutlined } from '@mui/icons-material';
import { apiCall } from '../../../../api/api';
import { useAuth } from '../../../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../../crudsReceptionList/ReceptionList/Alert'; 

const ServiceTable = ({ searchKey }: { searchKey: string }) => {
    const navigate = useNavigate();
    const role = useAuth();
    
    const [serviceData, setServiceData] = useState([]);
    const [loading, setLoading] = useState(false); 
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(7);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [resultDialog, setResultDialog] = useState({
        open: false,
        title: '',
        type: 'info' as 'error' | 'warning' | 'info' | 'success'
    });

    const getServicesFromServer = useCallback(async () => {
        setLoading(true);
        let url = `admin/service/search?pageNumber=${currentPage - 1}&pageSize=${rowsPerPage}`;
        if (searchKey !== "") url += `&keyWord=${searchKey}`;
        
        const accessToken = localStorage.getItem("accessToken");
        apiCall(url, "GET", accessToken ? accessToken : "", null, 
            (data: any) => {
                setServiceData(data.data.content);
                setTotalPage(data.data.totalPages);
                setLoading(false);
            }, 
            () => {
                setResultDialog({ open: true, title: "Get data fail", type: "error" });
                setLoading(false);
            }
        );
    }, [currentPage, rowsPerPage, searchKey]);

    useEffect(() => {
        getServicesFromServer();
    }, [getServicesFromServer]);

    const handleDeleteClick = (serviceId: number) => {
        setSelectedServiceId(serviceId);
        setIsDeleteDialogOpen(true);
    };

    const onConfirmDelete = () => {
        if (!selectedServiceId) return;
        const url = `unsecure/service/delete/${selectedServiceId}`;
        apiCall(url, "DELETE", null, null, 
            (response: any) => {
                setResultDialog({ open: true, title: response.message || "Delete success", type: "success" });
                getServicesFromServer();
            }, 
            (response: any) => {
                setResultDialog({ open: true, title: response.message || "Delete fail", type: "error" });
            }
        );
    };

    const formatCurrency = (amount: any) => {
        if (amount === null || amount === undefined) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Table sx={{
                '& .MuiTableCell-root': { 
                    padding: '8px 0px', 
                    color: 'var(--color-text-table)' 
                },
                '& .MuiTypography-root': { 
                    fontSize: 14 
                },
            }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }} width="10%">ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} width="45%">Service name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right" width="25%">Unit price</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center" width="20%">Action</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                <CircularProgress size={28} sx={{ my: 2 }} />
                            </TableCell>
                        </TableRow>
                    ) : serviceData.length > 0 ? (
                        serviceData.map((row: any) => (
                            <TableRow key={row.serviceId} hover>
                                <TableCell>{row.serviceId}</TableCell>
                                <TableCell>
                                    <Typography sx={{ fontWeight: 500 }}>{row.serviceName}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(row.unitPrice)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    {/* Nút Xem Chi Tiết - Đồng bộ style View Patient */}
                                    <IconButton
                                        onClick={() => navigate("/admin/services/service-detail/" + row.serviceId)}
                                        sx={{
                                            color: 'var(--color-text-info)',
                                            border: '1px solid var(--color-primary-main)',
                                            borderRadius: 1.2, 
                                            height: 32, 
                                            width: 32, 
                                            mr: 1,
                                        }}
                                        title="Detail"
                                    >
                                        <VisibilityOutlined sx={{ fontSize: 18 }} />
                                    </IconButton>

                                    {/* Nút Xóa - Đồng bộ style Cancel Appointment */}
                                    <IconButton
                                        onClick={() => handleDeleteClick(row.serviceId)}
                                        sx={{
                                            color: 'var(--color-primary-contrast)',
                                            bgcolor: 'var(--color-error-secondary)',
                                            ':hover': { bgcolor: 'var(--color-text-error)' },
                                            borderRadius: 1.2, 
                                            height: 32, 
                                            width: 32,
                                        }}
                                        title="Xóa dịch vụ"
                                    >
                                        <CloseRounded sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">No data</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination Section - Đồng bộ style AppointmentTable */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mr: 5, mt: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ color: 'var(--color-text-secondary)' }}>Show</Typography>
                    <Select
                        value={rowsPerPage}
                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        sx={{ 
                            "& .MuiInputBase-input": { width: '20px', py: '6px' },
                            fontSize: 14
                        }}
                    >
                        {[7, 10, 15].map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                    <Typography sx={{ color: 'var(--color-text-secondary)' }}>results</Typography>
                </Box>

                <Pagination
                    count={totalPage}
                    page={currentPage}
                    onChange={(_, val) => setCurrentPage(val)}
                    color="primary"
                    shape="rounded"
                    sx={{
                        '& .MuiPaginationItem-root': {
                            color: 'var(--color-primary-main)',
                            '&.Mui-selected': { color: '#fff' }
                        }
                    }}
                />
            </Box>

            {/* Dialogs */}
            <AlertDialog
                open={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
                title="Confirm delete service"
                description={`Do you want to delete service with ID #${selectedServiceId}? You can not undo this action.`}
                type="warning"
                buttonCancel="Cancel"
                buttonConfirm="Yes"
                onConfirm={onConfirmDelete}
            />

            <AlertDialog
                open={resultDialog.open}
                setOpen={(val) => setResultDialog(prev => ({ ...prev, open: val }))}
                title={resultDialog.title}
                type={resultDialog.type}
                buttonConfirm="Close"
                onConfirm={() => {}}
            />
        </Box>
    );
};

export default ServiceTable;