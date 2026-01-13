import { Box, Card, Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import type { MedicineImportDetail } from "../../../../types/MedicineImport"
import dayjs from "dayjs"

export default function ImportItemsCard({
  data,
}: {
  data: MedicineImportDetail
}) {
  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      p: 4,
      borderRadius: 2,
      boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
    }}>
      <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
        Import Items
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">STT</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Medicine Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Import Quantity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity In Stock</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit Cost</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Cost</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.importDetails.map((item, index) => (
            <TableRow key={index}>
              <TableCell width="5%" align="center">{index + 1}</TableCell>
              <TableCell width="20%">
                {item.medicine.medicineName}
              </TableCell>
              <TableCell width="12%">
                {dayjs(item.expiryDate).format("DD/MM/YYYY")}
              </TableCell>
              <TableCell width="10%">
                {item.quantity}
              </TableCell>
              <TableCell width="10%">
                <Typography 
                  color={item.quantityInStock < item.quantity ? 'warning.main' : 'text.primary'}
                  fontWeight={item.quantityInStock < item.quantity ? 'bold' : 'normal'}
                >
                  {item.quantityInStock ?? item.quantity}
                </Typography>
              </TableCell>
              <TableCell width="10%">
                {item.medicine.unit.toLowerCase()}
              </TableCell>
              <TableCell width="13%">
                {item.importPrice.toLocaleString()} đ
              </TableCell>
              <TableCell>
                {(item.importPrice * item.quantity).toLocaleString()} đ
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'flex-end',
        mr: 4,
        mt: 2,
        gap: 1.2,
      }}>
        <Box sx={{
          display: 'flex',
          width: '300px',
          justifyContent: 'space-between',

        }}>
          <Typography>
            Total Medicine Updated:
          </Typography>
          <Typography>
            {data.importDetails.length}
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          width: '300px',
          justifyContent: 'space-between',
          mb: 1,
        }}>
          <Typography>
            Total Items Imported:
          </Typography>
          <Typography>
            {data.totalQuantity}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{
          display: 'flex',
          width: '300px',
          justifyContent: 'space-between',
          mt: 1,
        }}>
          <Typography fontWeight='bold' fontSize={18}>
            Total Cost
          </Typography>
          <Typography fontWeight='bold' fontSize={18}>
            {data.totalValue.toLocaleString()} đ
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}