import { Autocomplete, Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import type { CreateUpdateImportDetailUI, Medicine } from "../../../../types/MedicineImport";
import { DeleteOutline, Warning } from "@mui/icons-material";
import dayjs from "dayjs";

export default function ImportDetailTable({
  data,
  medicineList,
  onDetailChange,
  onRemoveDetail
}: {
  data: CreateUpdateImportDetailUI[];
  medicineList: Medicine[];
  onDetailChange: (rowId: string, field: keyof CreateUpdateImportDetailUI, value: any) => void;
  onRemoveDetail: (rowId: string) => void;
}) {
  // Chỉ hiện cột Status khi có item không editable
  const hasNonEditableItems = data.some(item => item.editable === false);

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
            {hasNonEditableItems && <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hasNonEditableItems ? 9 : 8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                No items added yet, press "Add item" to add
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const isEditable = row.editable !== false; // Mặc định là true
              
              return (
                <TableRow 
                  key={row.rowId}
                  sx={{
                    backgroundColor: isEditable ? 'inherit' : 'rgba(255, 193, 7, 0.08)',
                  }}
                >
                  <TableCell align="center">{index + 1}</TableCell>

                  <TableCell width="22%">
                    {isEditable ? (
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
                    ) : (
                      <Typography variant="body2">
                        {medicineList.find(m => m.medicineId === row.medicineId)?.medicineName || `Medicine ID: ${row.medicineId}`}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell width="10%">
                    {isEditable ? (
                      <TextField
                        type="date"
                        value={dayjs(row.expiryDate).format("YYYY-MM-DD")}
                        onChange={(e) => onDetailChange(row.rowId, 'expiryDate', (e.target.value) || "")}
                        size="small"
                        variant="standard"
                      />
                    ) : (
                      <Typography variant="body2">
                        {dayjs(row.expiryDate).format("DD/MM/YYYY")}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell width="8%">
                    {isEditable ? (
                      <TextField
                        type="number"
                        value={row.quantity}
                        onChange={(e) => onDetailChange(row.rowId, 'quantity', parseInt(e.target.value) || 0)}
                        size="small"
                        variant="standard"
                        inputProps={{ min: 1 }}
                      />
                    ) : (
                      <Typography variant="body2">{row.quantity}</Typography>
                    )}
                  </TableCell>

                  <TableCell width="8%">
                    {medicineList.find(m => m.medicineId === row.medicineId)?.unit?.toLowerCase() || ""}
                  </TableCell>

                  <TableCell width="10%">
                    {isEditable ? (
                      <TextField
                        type="number"
                        value={row.importPrice}
                        onChange={(e) => onDetailChange(row.rowId, 'importPrice', parseInt(e.target.value) || 0)}
                        size="small"
                        variant="standard"
                        inputProps={{ min: 0 }}
                      />
                    ) : (
                      <Typography variant="body2">{row.importPrice.toLocaleString()} đ</Typography>
                    )}
                  </TableCell>

                  <TableCell width="10%">
                    {(row.quantity * row.importPrice).toLocaleString()} đ
                  </TableCell>

                  <TableCell align="center" width="8%">
                    {isEditable ? (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => onRemoveDetail(row.rowId!)}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>

                  {hasNonEditableItems && (
                    <TableCell align="center" width="10%">
                      {!isEditable && (
                        <Tooltip title={row.statusMessage || "Đã bán, không được sửa/xóa"} arrow>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                            <Typography variant="caption" color="warning.main" sx={{ fontSize: 11 }}>
                              Đã bán
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            }))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
