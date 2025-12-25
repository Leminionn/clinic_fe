import React, { useEffect, useState } from 'react';
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
// Import các component MUI khác nếu cần (ví dụ: Button, IconButton)
// Import BigDecimal hoặc xử lý định dạng số tiền nếu cần

// KHỞI TẠO MOCK DATA (Thay thế bằng API call thực tế)



const ServiceTable = ({ searchKey}:{
  searchKey:string
}) => {
    
const [serviceData,setServiceData] = useState([]);
const loading = false; 
const totalItems = serviceData.length; 
const [currentPage, setCurrentPage] = useState(1);
const [totalPage, setTotalPage] = useState(1);
const [rowsPerPage, setRowsPerPage]= useState(7);
const role= useAuth();
const navigate = useNavigate();
async function getServicesFromServer() {
  let url = `admin/service/search?pageNumber=${currentPage-1}&pageSize=${rowsPerPage}`;
  if(searchKey!="") url+=`&keyWord=${searchKey}`;
    const accessToken = localStorage.getItem("accessToken");
    apiCall(url,"GET",accessToken?accessToken:"",null,onSuccess,onFailure);
}
function onSuccess(data:any) {
    setServiceData(data.data.content);
    setTotalPage(data.data.totalPages);
}
function onFailure() {
    alert("Get dataa failed, please reload page");
}
useEffect(()=>{
    getServicesFromServer();
},[currentPage,rowsPerPage,searchKey]);



  
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND', // Hoặc currency khác như USD
    }).format(amount);
  };

    function handleViewDetail(serviceId: any) {
        navigate("/admin/services/service-detail/"+serviceId);
    }
    const handleDelete = (serviceId:any) => {
        // Trong ứng dụng thực tế, bạn sẽ hiển thị modal xác nhận trước khi xóa
        if (window.confirm(`Do you want to delete service with ID ${serviceId} ?`)) {
            console.log('DELETING Service ID:', serviceId);
            const url ="unsecure/service/delete/"+serviceId;
            apiCall(url,"DELETE",null,null,(response:any)=>{
              alert(response.message);
              window.location.reload();
            },(response:any)=>{
              alert(response.message);
            })
             
        }
      };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    }}>
      <Table sx={{
            '& .MuiTableCell-root': {
              padding: '8px 0px',
              color: 'var(--color-text-table)',
            },
            '& .MuiTypography-root': {
              fontSize: 14,
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
                    serviceData.map((row) => (
                        <TableRow key={row.serviceId} hover>
                            <TableCell width="10%">
                                {row.serviceId}
                            </TableCell>
                            <TableCell width="45%">
                                <Typography sx={{ fontSize: 14 }}>
                                    {row.serviceName}
                                </Typography>
                            </TableCell>
                            <TableCell align="right" width="25%">
                                <Typography sx={{ fontSize: 14, fontWeight: 'bold' }}>
                                    {formatCurrency(row.unitPrice)}
                                </Typography>
                            </TableCell>

                            {/* Cột Action */}
                            <TableCell align="center" width="20%">
                                {/* Nút Xem chi tiết */}
                                <IconButton
                                    onClick={() => { handleViewDetail(row.serviceId) }}
                                    sx={{
                                        color: 'var(--color-primary-main)',
                                        border: '1px solid var(--color-primary-main)',
                                        borderRadius: 1.2,
                                        height: 32,
                                        width: 32,
                                        mr: 1,
                                    }}
                                    title="Detail"
                                >
                                    <VisibilityOutlined sx={{ fontSize: 20 }} />
                                </IconButton>

                                {/* Nút Xóa (Sử dụng style tương tự nút Cancel Appointment cũ) */}
                                <IconButton
                                    onClick={() => { handleDelete(row.serviceId) }}
                                    sx={{
                                        color: 'var(--color-primary-contrast)',
                                        bgcolor: 'var(--color-error-secondary)',
                                        ':hover': {
                                            bgcolor: 'var(--color-text-error)',
                                        },
                                        borderRadius: 1.2,
                                        height: 32,
                                        width: 32,
                                    }}
                                    title="Xóa dịch vụ"
                                >
                                    <CloseRounded sx={{ fontSize: 20 }} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        {/* Cập nhật colSpan = 4 */}
                        <TableCell colSpan={4} align="center">
                            Không có dữ liệu
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>

      {/* Phần Pagination vẫn giữ nguyên nhưng phải đảm bảo props hoạt động đúng */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mr: 5, mt: 3, }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>
            Show
          </Typography>
          <Select
            value={rowsPerPage}
            onChange={(e)=>{
                setRowsPerPage(e.target.value)
            }}
            sx={{
              "& .MuiInputBase-input": {
                width: '20px',
                py: '6px',
              },
            }}
          >
            {[7, 10, 15].map(item => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>
            results
          </Typography>
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
              '&.Mui-selected': {
                color: '#fff',
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ServiceTable;