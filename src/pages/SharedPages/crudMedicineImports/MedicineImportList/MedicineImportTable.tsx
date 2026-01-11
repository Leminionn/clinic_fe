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

const fakeData: MedicineImport[] = [
  {
    importId: 1001,
    importDate: "2025-12-01",
    importerName: "Nguyễn Văn An",
    supplier: "Công ty Dược Minh Long",
    totalQuantity: 120,
    totalValue: 18500000,
  },
  {
    importId: 1002,
    importDate: "2025-12-03",
    importerName: "Trần Thị Bích",
    supplier: "Công ty Dược Phúc Hưng",
    totalQuantity: 80,
    totalValue: 12400000,
  },
  {
    importId: 1003,
    importDate: "2025-12-05",
    importerName: "Lê Hoàng Nam",
    supplier: "Công ty Dược An Khang",
    totalQuantity: 200,
    totalValue: 31200000,
  },
  {
    importId: 1004,
    importDate: "2025-12-07",
    importerName: "Phạm Thu Trang",
    supplier: "Công ty Dược Medipharco",
    totalQuantity: 65,
    totalValue: 9800000,
  },
  {
    importId: 1005,
    importDate: "2025-12-10",
    importerName: "Võ Minh Tuấn",
    supplier: "Công ty Dược OPC",
    totalQuantity: 150,
    totalValue: 22600000,
  },
  {
    importId: 1006,
    importDate: "2025-12-12",
    importerName: "Ngô Thị Lan",
    supplier: "Công ty Dược Trường Thọ",
    totalQuantity: 95,
    totalValue: 14750000,
  },
  {
    importId: 1007,
    importDate: "2025-12-14",
    importerName: "Đặng Quốc Huy",
    supplier: "Công ty Dược Bình An",
    totalQuantity: 40,
    totalValue: 6200000,
  },
  {
    importId: 1008,
    importDate: "2025-12-16",
    importerName: "Bùi Thanh Hằng",
    supplier: "Công ty Dược Nam Việt",
    totalQuantity: 175,
    totalValue: 26800000,
  },
  {
    importId: 1009,
    importDate: "2025-12-18",
    importerName: "Đỗ Minh Khoa",
    supplier: "Công ty Dược Hậu Giang",
    totalQuantity: 220,
    totalValue: 35500000,
  },
  {
    importId: 1010,
    importDate: "2025-12-20",
    importerName: "Trịnh Mỹ Linh",
    supplier: "Công ty Dược Imexpharm",
    totalQuantity: 60,
    totalValue: 9100000,
  },
];

export default function MedicineImportTable({
  selectedDate,
  searchKey
}: {
  selectedDate: string,
  searchKey: string
}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [data, setData] = useState<MedicineImport[]>(fakeData);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fake data
    setData(fakeData.slice(0, rowsPerPage))
    setTotalItems(fakeData.length)
  }, [page, rowsPerPage, selectedDate, searchKey])

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
                    onClick={() => { navigate(`/${role?.toLowerCase()}/medicine-imports/${row.importId}`) }}
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