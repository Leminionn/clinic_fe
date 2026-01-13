"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Pagination,
  Typography,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";
import { Eye } from "lucide-react";
import type { MedicineImport } from "../../../../types/MedicineImport";
import { apiCall } from "../../../../api/api";
import { showMessage } from "../../../../components/ActionResultMessage";

export default function MedicineImportTable({
  fromDate,
  toDate,
  searchKey
}: {
  fromDate: string,
  toDate: string,
  searchKey: string
}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [data, setData] = useState<MedicineImport[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Xác định base URL theo role
  const getApiPrefix = () => {
    if (role === 'Admin') return 'admin';
    if (role === 'WarehouseStaff') return 'store_keeper';
    return 'api'; // fallback
  };

  const fetchData = () => {
    const accessToken = localStorage.getItem("accessToken");
    const apiPrefix = getApiPrefix();
    
    setLoading(true);
    
    // Build query params với date range
    let queryParams = `?page=${page - 1}&size=${rowsPerPage}&sortBy=importDate&sortType=DESC`;
    if (searchKey) {
      queryParams += `&keyword=${encodeURIComponent(searchKey)}`;
    }
    if (fromDate) {
      queryParams += `&fromDate=${fromDate}`;
    }
    if (toDate) {
      queryParams += `&toDate=${toDate}`;
    }
    
    apiCall(`${apiPrefix}/imports${queryParams}`, "GET", accessToken, null,
      (response: { data: { content: Array<{ importId: number; importDate: string; importerName: string; supplier: string; totalQuantity: number; totalValue: number }>; totalElements: number } }) => {
        const imports: MedicineImport[] = response.data.content.map((item) => ({
          importId: item.importId,
          importDate: item.importDate,
          importerName: item.importerName,
          supplier: item.supplier,
          totalQuantity: item.totalQuantity,
          totalValue: item.totalValue,
        }));
        setData(imports);
        setTotalItems(response.data.totalElements || 0);
        setLoading(false);
      },
      (error: { message?: string }) => {
        showMessage(error.message || "Failed to load imports", "error");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, fromDate, toDate, searchKey, role]);

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
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Import Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Importer Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total items</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total value</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <CircularProgress size={28} sx={{ my: 2 }} />
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((row) => (
              <TableRow key={row.importId} hover>
                <TableCell width="10%" sx={{ fontWeight: 'bold' }}>
                  {row.importId}
                </TableCell>

                <TableCell width="15%">
                  {dayjs(row.importDate).format("DD/MM/YYYY")}
                </TableCell>

                <TableCell sx={{ width: '20%', maxWidth: 200, }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    pr: 6,
                    gap: 2,
                  }}
                    title={row.importerName}
                  >

                    <Typography sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {row.importerName}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ width: '25%', maxWidth: 200, }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    pr: 6,
                    gap: 2,
                  }}
                    title={row.supplier}
                  >

                    <Typography sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {row.supplier}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell width="12%">
                  {row.totalQuantity}
                </TableCell>

                <TableCell width="12%">
                  {row.totalValue}
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    onClick={() => { navigate(`${row.importId}`) }}
                    sx={{
                      color: 'var(--color-text-info)',
                      border: '1px solid var(--color-primary-main)',
                      borderRadius: 1.2,
                      height: 32,
                      width: 32
                    }}
                    title="View Import Detail"
                  >
                    <Eye />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mr: 5, mt: 3, }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>
            Show
          </Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(e.target.value)}
            sx={{
              "& .MuiInputBase-input": {
                width: '20px',
                py: '6px',
              },
            }}
          >
            {[7, 10, 15].map(item => (
              <MenuItem value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
          <Typography sx={{ color: 'var(--color-text-secondary)' }}>
            results
          </Typography>
        </Box>

        <Pagination
          count={Math.ceil(totalItems / rowsPerPage)}
          page={page}
          onChange={(_, val) => setPage(val)}
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
}