import { Box, Card, Typography } from "@mui/material"
import type { MedicineImportDetail } from "../../../../types/MedicineImport"
import { Calendar, Truck, User } from "lucide-react"
import dayjs from "dayjs"

export default function MedicineImportDetailStatCards({
  data,
}: {
  data: MedicineImportDetail
}) {
  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(3, 1fr)" },
      gap: 3,
    }}>
      <Card sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        p: 4,
        borderRadius: 2,
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
      }}>
        <User size={30} color="var(--color-text-secondary)" />
        <Box>
          <Typography sx={{ fontWeight: 'bold', fontSize: 20, textWrap: 'wrap' }}>
            {data.importer.importerName}
          </Typography>
          <Typography>
            Importer
          </Typography>
        </Box>
      </Card>

      <Card sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        p: 4,
        borderRadius: 2,
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
      }}>
        <Calendar size={30} color="var(--color-text-secondary)" />
        <Box>
          <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>
            {dayjs(data.importDate).format("DD/MM/YYYY")}
          </Typography>
          <Typography>
            Import Date
          </Typography>
        </Box>
      </Card>

      <Card sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        p: 4,
        borderRadius: 2,
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.031)",
      }}>
        <Truck size={30} color="var(--color-text-secondary)" />
        <Box sx={{ flex: 1, }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>
            {data.supplier}
          </Typography>
          <Typography>
            Supplier
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}