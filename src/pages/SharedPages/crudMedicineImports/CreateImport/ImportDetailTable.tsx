import { Autocomplete, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import type { CreateImportDetailUI, Medicine } from "../../../../types/MedicineImport";
import { DeleteOutline } from "@mui/icons-material";

export default function ImportDetailTable({
  data,
  medicineList,
  onDetailChange,
  onRemoveDetail
}: {
  data: CreateImportDetailUI[];
  medicineList: Medicine[];
  onDetailChange: (rowId: string, field: keyof CreateImportDetailUI, value: any) => void;
  onRemoveDetail: (rowId: string) => void;
}) {

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">STT</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Medicine Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit Cost</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Cost</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                No items added yet, press "Add item" to add
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={row.rowId}>
                <TableCell align="center">{index + 1}</TableCell>

                <TableCell width="25%">
                  <Autocomplete
                    options={medicineList}
                    getOptionLabel={(option) => `${option.medicineName} (${option.unit.toLowerCase()})`}
                    value={medicineList.find(m => m.medicineId === row.medicineId) || null}
                    onChange={(_, newValue) => {
                      onDetailChange(row.rowId!, 'medicineId', newValue ? newValue.medicineId : null);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select medicine..." size="small" variant="standard" />
                    )}
                  />
                </TableCell>

                <TableCell width="10%">
                  <TextField
                    type="date"
                    value={row.expiryDate}
                    onChange={(e) => onDetailChange(row.rowId, 'expiryDate', (e.target.value) || "")}
                    size="small"
                    variant="standard"
                  />
                </TableCell>

                <TableCell width="10%">
                  <TextField
                    type="number"
                    value={row.quantity}
                    onChange={(e) => onDetailChange(row.rowId, 'quantity', parseInt(e.target.value) || 0)}
                    size="small"
                    variant="standard"
                    inputProps={{ min: 1 }}
                  />
                </TableCell>

                <TableCell width="10%">{medicineList.find(m => m.medicineId === row.medicineId)?.unit || ""}</TableCell>

                <TableCell width="12%">
                  <TextField
                    type="number"
                    value={row.importPrice}
                    onChange={(e) => onDetailChange(row.rowId, 'importPrice', parseInt(e.target.value) || 0)}
                    size="small"
                    variant="standard"
                    inputProps={{ min: 0 }}
                  />
                </TableCell>

                <TableCell width="13%">
                  {(row.quantity * row.importPrice).toLocaleString()}
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onRemoveDetail(row.rowId!)}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
