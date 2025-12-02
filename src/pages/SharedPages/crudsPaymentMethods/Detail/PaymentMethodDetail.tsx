import { useEffect, useState } from "react";
import { Box, Typography, Card } from "@mui/material";
import { apiCall } from "../../../../api/api";
import { paymentMethodsGetById } from "../../../../api/urls";
import { useParams } from "react-router-dom";

export default function PaymentMethodDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("accessToken");
    apiCall(paymentMethodsGetById(Number(id)), "GET", token, null, (res: any) => {
      setData(res.data || null);
    }, (err: any) => console.error(err));
  }, [id]);

  if (!data) return <Box p={4}>Loading...</Box>;

  return (
    <Box p={4}>
      <Typography variant="h5" fontWeight="bold" mb={2}>Payment Method Detail</Typography>
      <Card sx={{ padding: 3 }}>
        <Typography><strong>Code:</strong> {data.methodCode}</Typography>
        <Typography><strong>Name:</strong> {data.methodName}</Typography>
        <Typography><strong>Description:</strong> {data.description}</Typography>
        <Typography><strong>Sort Order:</strong> {data.sortOrder}</Typography>
        <Typography><strong>Active:</strong> {data.isActive ? 'Yes' : 'No'}</Typography>
      </Card>
    </Box>
  );
}
