import { Autocomplete, Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { type OrderedService, type Service } from "./MedicalRecordDetail"
import { useEffect, useState } from "react"
import { DeleteOutline } from "@mui/icons-material";
import { Edit, Plus, Save } from "lucide-react";
import { apiCall } from "../../../../api/api";
import { useAuth } from "../../../../auth/AuthContext";
import { unsecureAllServices } from "../../../../api/urls";

const fakeServices: Service[] = [
  {
    serviceId: 1,
    serviceName: "Xét nghiệm máu",
  },
  {
    serviceId: 2,
    serviceName: "Chụp X quang",
  },
  {
    serviceId: 3,
    serviceName: "Nội soi",
  }
];

export default function ServiceInformation({
  initialData,
  isEditing = false,
  setIsEditing,
  onConfirmSave,
  onSaveData,
}: {
  initialData: OrderedService[],
  isEditing: boolean,
  setIsEditing: (isEditing: boolean) => void,
  onConfirmSave: () => void,
  onSaveData: (data: any) => void,
}) {
  const { role } = useAuth();
  const [data, setData] = useState<OrderedService[]>(initialData || []);
  const [services, setServices] = useState<Service[]>([]);

  const handleSave = () => {
    onSaveData(data);
    onConfirmSave();
  };

  useEffect(() => {
    // Chỉ load danh sách services khi role là Doctor (để edit)
    if (role === "Patient") return;

    // fetch services from backend (unsecure endpoint returns paged results)
    const accessToken = localStorage.getItem("accessToken");
    const url = `${unsecureAllServices}?pageNumber=0&pageSize=1000`;
    apiCall(url, "GET", accessToken || "", null,
      (response: any) => {
        // response.data may be a Page with content or a list
        const payload = response.data;
        if (payload) {
          const list = payload.content ? payload.content : payload;
          setServices(list || []);
        } else {
          setServices([]);
        }
      },
      (error: any) => {
        console.error("Failed to load services:", error);
        setServices(fakeServices);
      }
    );

  }, []);

  // Chỉ sync với initialData khi không đang edit (tránh reset local changes)
  useEffect(() => {
    if (!isEditing) {
      setData(initialData || []);
    }
  }, [initialData, isEditing]);

  // Thêm dòng mới
  const handleAddDetail = () => {
    const newDetail: OrderedService = {
      serviceId: null,
      serviceName: "",
      quantity: 1,
    };
    setData(prev => ([...prev, newDetail]));
  };

  // Xóa dòng theo index
  const handleRemoveDetail = (index: number) => {
    setData(prev => (prev.filter((_, i) => i !== index)));
  };

  // Thay đổi thông tin trong dòng theo index
  const handleDetailChange = (index: number, field: keyof OrderedService, value: any) => {
    setData(prev => (
      prev.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      )
    ));
  };

  const handleCancel = () => {
    setData(initialData)
    setIsEditing(false)
  };

  if (data) return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
          Order Service
        </Typography>

        {role === "Doctor" &&
          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              minWidth: '120px',
              boxShadow: 'none',
              gap: 2,
            }}
            onClick={() => {
              isEditing
                ? handleAddDetail()
                : setIsEditing(true)
            }}
          >
            {isEditing ? <Plus size={16} /> : <Edit size={16} />}
            {isEditing ? "Add service" : "Edit"}
          </Button>
        }
      </Box>

      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table sx={{ minWidth: 700 }} size="small">
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Service Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  {role === "Doctor" ? 'No service, press "Add service" to add' : 'No service'}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>

                  <TableCell width="60%">
                    {!isEditing ? (
                      <TextField
                        value={row.serviceName || ''}
                        size="small"
                        variant="standard"
                        disabled
                        fullWidth
                      />
                    ) : (
                      <Autocomplete
                        options={services}
                        getOptionDisabled={(option) =>
                          data
                            .map(detail => detail.serviceId)
                            .includes(option.serviceId)
                        }
                        getOptionLabel={(option) => `${option.serviceName}`}
                        value={services.find(m => m.serviceId === row.serviceId) || null}
                        onChange={(_, newValue) => {
                          if (newValue) {
                            // Cập nhật cả serviceId và serviceName
                            handleDetailChange(index, 'serviceId', newValue.serviceId);
                            handleDetailChange(index, 'serviceName', newValue.serviceName);
                          } else {
                            handleDetailChange(index, 'serviceId', null);
                            handleDetailChange(index, 'serviceName', '');
                          }
                        }}
                        disabled={!isEditing}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select service..." size="small" variant="standard" />
                        )}
                      />
                    )}
                  </TableCell>

                  <TableCell width="20%">
                    <TextField
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleDetailChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      size="small"
                      variant="standard"
                      disabled={!isEditing}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      color="error"
                      size="small"
                      disabled={!isEditing}
                      onClick={() => handleRemoveDetail(index)}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {isEditing && role === "Doctor" &&
        <Box sx={{
          display: "flex",
          gap: 3,
          alignSelf: 'flex-end',
        }}>
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              width: '120px',
              boxShadow: 'none'
            }}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              width: '120px',
              boxShadow: 'none',
              gap: 2,
            }}
            onClick={handleSave}
          >
            <Save size={16} />
            Save
          </Button>
        </Box>
      }
    </Box>
  )
}
