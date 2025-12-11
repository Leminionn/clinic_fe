import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import { Save } from '@mui/icons-material';

// Danh sách các trạng thái hợp lệ
const APPOINTMENT_STATUSES = [
    'IN_EXAMINATION',
    'DONE',
    'CANCELLED',
    // Bạn có thể thêm các trạng thái khác như 'SCHEDULED', 'CHECKED_IN', v.v. nếu cần
];

// Định nghĩa props cho Modal
interface ChangeStatusModalProps {
    open: boolean;
    onClose: () => void;
    appointmentId: number | null;
    currentStatus: string;
    onStatusUpdate: (id: number, newStatus: string) => Promise<void>;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
    open,
    onClose,
    appointmentId,
    currentStatus,
    onStatusUpdate,
}) => {
    const [newStatus, setNewStatus] = useState(currentStatus);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cập nhật trạng thái khi Modal mở hoặc khi currentStatus thay đổi
    React.useEffect(() => {
        setNewStatus(currentStatus);
        setError(null);
    }, [currentStatus, open]);

    const handleSave = async () => {
        if (!appointmentId || newStatus === currentStatus) {
            onClose(); // Đóng nếu không có gì thay đổi
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await onStatusUpdate(appointmentId, newStatus);
            // Sau khi API thành công, component cha sẽ tự động làm mới dữ liệu
            onClose();
        } catch (err) {
            // Xử lý lỗi API
            console.error("Err:", err);
            setError("Cập nhật thất bại. Vui lòng thử lại."); 
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm chuyển đổi trạng thái API sang tên hiển thị thân thiện (tùy chọn)
    const getDisplayStatus = (status: string): string => {
        switch (status) {
            case 'IN_EXAMINATION': return 'Đang Khám';
            case 'DONE': return 'Hoàn Thành';
            case 'CANCELLED': return 'Đã Hủy';
            default: return status;
        }
    };


    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="xs" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 } // Bo góc cho Modal
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 1.5 }}>
                Thay đổi Trạng thái Cuộc hẹn
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    ID Cuộc hẹn: #{appointmentId}
                </Typography>

                <FormControl fullWidth margin="dense" variant="outlined">
                    <InputLabel id="new-status-label">Trạng thái mới</InputLabel>
                    <Select
                        labelId="new-status-label"
                        id="new-status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        label="Trạng thái mới"
                        sx={{ borderRadius: 2 }}
                    >
                        {APPOINTMENT_STATUSES.map(status => (
                            <MenuItem key={status} value={status}>
                                {getDisplayStatus(status)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {error && (
                    <Box mt={2}>
                        <Typography color="error" variant="body2">{error}</Typography>
                    </Box>
                )}

            </DialogContent>
            
            <DialogActions sx={{ borderTop: '1px solid #eee', pt: 1.5 }}>
                <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: 'none' }}>
                    Hủy
                </Button>
                <Button 
                    onClick={handleSave} 
                    disabled={isLoading || newStatus === currentStatus}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    variant="contained"
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                    {isLoading ? 'Đang lưu...' : 'Lưu Thay đổi'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangeStatusModal;