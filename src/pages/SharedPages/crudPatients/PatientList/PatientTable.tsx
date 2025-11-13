import { useState } from "react";
import {
  Box,
  IconButton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DeleteOutline, Edit, } from "@mui/icons-material";
import type { Patient } from "../../../../types/Patient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../auth/AuthContext";

const patientsList: Patient[] = [
	{
		patientId: 1,
		fullName: "Nguyen Van An",
		dateOfBirth: "1995-04-12",
		gender: "Male",
		address: "12 Nguyen Trai, Ha Noi",
		phone: "0901234567",
		email: "an.nguyen@example.com",
		idCard: "012345678901",
		firstVisitDate: "2023-01-10",
	},
	{
		patientId: 2,
		fullName: "Tran Thi Bich",
		dateOfBirth: "1998-07-25",
		gender: "Female",
		address: "45 Le Loi, Ho Chi Minh City",
		phone: "0908765432",
		email: "bich.tran@example.com",
		idCard: "023456789012",
		firstVisitDate: "2023-02-15",
	},
	{
		patientId: 3,
		fullName: "Le Quang Huy",
		dateOfBirth: "1990-11-05",
		gender: "Male",
		address: "89 Tran Hung Dao, Da Nang",
		phone: "0934567890",
		email: "huy.le@example.com",
		idCard: "034567890123",
		firstVisitDate: "2023-03-02",
	},
	{
		patientId: 4,
		fullName: "Pham Thi Hong",
		dateOfBirth: "1985-02-20",
		gender: "Female",
		address: "10 Nguyen Van Linh, Hue",
		phone: "0912345678",
		email: "hong.pham@example.com",
		idCard: "045678901234",
		firstVisitDate: "2023-04-18",
	},
	{
		patientId: 5,
		fullName: "Do Minh Tuan",
		dateOfBirth: "1992-09-09",
		gender: "Male",
		address: "33 Le Duan, Hai Phong",
		phone: "0976543210",
		email: "tuan.do@example.com",
		idCard: "056789012345",
		firstVisitDate: "2023-05-12",
	},
	{
		patientId: 6,
		fullName: "Vu Thi Lan",
		dateOfBirth: "1999-03-17",
		gender: "Female",
		address: "21 Phan Chu Trinh, Da Lat",
		phone: "0909998888",
		email: "lan.vu@example.com",
		idCard: "067890123456",
		firstVisitDate: "2023-06-10",
	},
	{
		patientId: 7,
		fullName: "Nguyen Thanh Long",
		dateOfBirth: "1987-12-30",
		gender: "Male",
		address: "67 Hoang Hoa Tham, Can Tho",
		phone: "0981234567",
		email: "long.nguyen@example.com",
		idCard: "078901234567",
		firstVisitDate: "2023-07-22",
	},
	{
		patientId: 8,
		fullName: "Tran Thi Mai",
		dateOfBirth: "1996-08-11",
		gender: "Female",
		address: "99 Cach Mang Thang 8, HCMC",
		phone: "0945671234",
		email: "mai.tran@example.com",
		idCard: "089012345678",
		firstVisitDate: "2023-08-03",
	},
	{
		patientId: 9,
		fullName: "Hoang Van Nam",
		dateOfBirth: "1983-10-22",
		gender: "Male",
		address: "14 Nguyen Hue, Ha Noi",
		phone: "0922334455",
		email: "nam.hoang@example.com",
		idCard: "090123456789",
		firstVisitDate: "2023-08-29",
	},
	{
		patientId: 10,
		fullName: "Pham Thi Huong",
		dateOfBirth: "1991-01-14",
		gender: "Female",
		address: "5 Hai Ba Trung, Vung Tau",
		phone: "0933322110",
		email: "huong.pham@example.com",
		idCard: "101234567890",
		firstVisitDate: "2023-09-10",
	},
	{
		patientId: 11,
		fullName: "Le Van Phuc",
		dateOfBirth: "1989-06-06",
		gender: "Male",
		address: "77 Nguyen Dinh Chieu, Ha Noi",
		phone: "0904445566",
		email: "phuc.le@example.com",
		idCard: "112345678901",
		firstVisitDate: "2023-09-20",
	},
	{
		patientId: 12,
		fullName: "Nguyen Thi Thanh",
		dateOfBirth: "1997-09-19",
		gender: "Female",
		address: "23 Le Lai, Da Nang",
		phone: "0977332211",
		email: "thanh.nguyen@example.com",
		idCard: "123456789012",
		firstVisitDate: "2023-10-05",
	},
	{
		patientId: 13,
		fullName: "Doan Minh Khang",
		dateOfBirth: "2000-02-10",
		gender: "Male",
		address: "58 Nguyen Kiem, HCMC",
		phone: "0966223344",
		email: "khang.doan@example.com",
		idCard: "134567890123",
		firstVisitDate: "2023-10-12",
	},
	{
		patientId: 14,
		fullName: "Tran Thi Thu",
		dateOfBirth: "1994-11-30",
		gender: "Female",
		address: "81 Ba Trieu, Ha Noi",
		phone: "0911556677",
		email: "thu.tran@example.com",
		idCard: "145678901234",
		firstVisitDate: "2023-11-02",
	},
	{
		patientId: 15,
		fullName: "Pham Van Dung",
		dateOfBirth: "1988-05-15",
		gender: "Male",
		address: "3 Nguyen Thi Minh Khai, Can Tho",
		phone: "0955667788",
		email: "dung.pham@example.com",
		idCard: "156789012345",
		firstVisitDate: "2023-11-09",
	},
	{
		patientId: 16,
		fullName: "Ho Thi Kim",
		dateOfBirth: "1993-07-21",
		gender: "Female",
		address: "12 Dinh Tien Hoang, Hue",
		phone: "0944556677",
		email: "kim.ho@example.com",
		idCard: "167890123456",
		firstVisitDate: "2023-11-20",
	},
	{
		patientId: 17,
		fullName: "Nguyen Quoc Viet",
		dateOfBirth: "1990-12-01",
		gender: "Male",
		address: "4 Tran Phu, HCMC",
		phone: "0901112233",
		email: "viet.nguyen@example.com",
		idCard: "178901234567",
		firstVisitDate: "2023-12-05",
	},
	{
		patientId: 18,
		fullName: "Le Thi Hanh",
		dateOfBirth: "1995-08-25",
		gender: "Female",
		address: "89 Le Van Sy, Da Nang",
		phone: "0988776655",
		email: "hanh.le@example.com",
		idCard: "189012345678",
		firstVisitDate: "2023-12-15",
	},
	{
		patientId: 19,
		fullName: "Tran Van Loc",
		dateOfBirth: "1986-03-08",
		gender: "Male",
		address: "22 Phan Dinh Phung, HCMC",
		phone: "0977889900",
		email: "loc.tran@example.com",
		idCard: "190123456789",
		firstVisitDate: "2024-01-03",
	},
	{
		patientId: 20,
		fullName: "Phan Thi Ngoc",
		dateOfBirth: "1999-10-19",
		gender: "Female",
		address: "10 Ly Thuong Kiet, Ha Noi",
		phone: "0911223344",
		email: "ngoc.phan@example.com",
		idCard: "201234567890",
		firstVisitDate: "2024-01-10",
	},
];

export default function PatientTable({
  handleDelete,
}: {
  handleDelete: (id: any) => void,
}) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [data, setData] = useState(patientsList);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const pageData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    }}>
      <Table sx={{
        '& .MuiTableCell-root': {
          padding: '9px 0px',
        }
      }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date of Birth</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Citizen ID Number</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Email ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {pageData.map((p) => (
            <TableRow key={p.patientId} hover>
              <TableCell width="15%">
                {p.fullName}
              </TableCell>
              <TableCell width="12%">{p.dateOfBirth}</TableCell>
              <TableCell width="8%">{p.gender}</TableCell>
              <TableCell width="15%">{p.idCard}</TableCell>
              <TableCell width="12%">{p.phone}</TableCell>

              <TableCell
                width="15%"
                sx={{
                  maxWidth: 150,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={p.email}
              >
                {p.email}
              </TableCell>

              <TableCell
                width="12%"
                align="center"
              >
                <IconButton
                  onClick={() => { navigate(`update-patient/${p.patientId}`) }}
                  sx={{
                    color: 'var(--color-primary-contrast)',
                    bgcolor: 'var(--color-primary-main)',
                    borderRadius: 1.2,
                    p: '6px',
                    mr: 1,
                  }}
                >
                  <Edit sx={{ fontSize: 20 }} />
                </IconButton>

                {role === "Admin" &&
                  <IconButton
                    onClick={() => handleDelete(p.patientId)}
                    sx={{
                      color: 'var(--color-text-error)',
                      border: '1px solid var(--color-text-error)',
                      borderRadius: 1.2,
                      p: '6px',
                      mr: 1,
                    }}>
                    <DeleteOutline sx={{ fontSize: 20 }} />
                  </IconButton>
                }

                <IconButton
                  onClick={() => navigate(`patient-detail/${p.patientId}`)}
                  sx={{
                    color: 'var(--color-text-info)',
                    border: '1px solid var(--color-primary-main)',
                    borderRadius: 1.2,
                    height: 32,
                    width: 32
                  }}
                >
                  <Typography>i</Typography>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mr: 4, }}>
        <Pagination
          count={Math.ceil(data.length / rowsPerPage)}
          page={page}
          onChange={(_, val) => setPage(val)}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>
  );
}
