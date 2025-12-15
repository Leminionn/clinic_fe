import { useState, useEffect } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Drawer,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Close, Person } from "@mui/icons-material";
import { apiCall } from "../api/api";
import { profileGetMe, profileUpdateMe } from "../api/urls";
import { showMessage } from "./ActionResultMessage";

// Profile types
interface ProfileResponse {
  username: string;
  role: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  idCard: string | null;
  address: string | null;
  position: string | null;
  firstVisitDate: string | null;
}

interface UpdateProfileRequest {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  idCard?: string;
  address?: string;
}

interface UserProfileProps {
  collapsed: boolean;
}

export default function UserProfile({ collapsed }: UserProfileProps) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<UpdateProfileRequest>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const token = localStorage.getItem("accessToken");
    apiCall(
      profileGetMe,
      "GET",
      token,
      null,
      (res: any) => {
        setProfile(res.data);
        setLoading(false);
      },
      (err: any) => {
        console.error("Failed to fetch profile:", err);
        setLoading(false);
      }
    );
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    if (profile) {
      setEditForm({
        fullName: profile.fullName || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        phone: profile.phone || "",
        email: profile.email || "",
        idCard: profile.idCard || "",
        address: profile.address || "",
      });
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    const token = localStorage.getItem("accessToken");
    apiCall(
      profileUpdateMe,
      "PUT",
      token,
      JSON.stringify(editForm),
      (res: any) => {
        setProfile(res.data);
        setSaving(false);
        setEditing(false);
        showMessage("Profile updated successfully!", "success");
      },
      (err: any) => {
        console.error("Failed to update profile:", err);
        setSaving(false);
        showMessage("Failed to update profile", "error");
      }
    );
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      ADMIN: "Admin",
      DOCTOR: "Doctor",
      RECEPTIONIST: "Receptionist",
      WAREHOUSE_STAFF: "Warehouse Staff",
      PATIENT: "Patient",
    };
    return roleMap[role] || role;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <>
      {/* Profile Summary in Sidebar */}
      <Box
        onClick={handleOpenDrawer}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: collapsed ? 1 : 3,
          py: 2,
          cursor: "pointer",
          borderRadius: 2,
          mx: collapsed ? 1 : 2,
          mb: 1,
          transition: "all 0.2s",
          "&:hover": {
            backgroundColor: "rgba(63, 81, 181, 0.08)",
          },
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "var(--color-primary-main)",
            width: 40,
            height: 40,
            fontSize: 14,
          }}
        >
          {getInitials(profile?.fullName || null)}
        </Avatar>
        {!collapsed && (
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              sx={{
                fontWeight: 600,
                color: "var(--color-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 14,
              }}
            >
              {profile?.fullName || "User"}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {getRoleDisplayName(profile?.role || "")}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Profile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: 400, p: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            My Profile
          </Typography>
          <IconButton onClick={handleCloseDrawer}>
            <Close />
          </IconButton>
        </Box>

        {/* Avatar Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "var(--color-primary-main)",
              width: 100,
              height: 100,
              fontSize: 36,
              mb: 2,
            }}
          >
            {getInitials(profile?.fullName || null)}
          </Avatar>
          <Typography variant="h6" fontWeight="600">
            {profile?.fullName || "User"}
          </Typography>
          <Typography color="text.secondary">
            {getRoleDisplayName(profile?.role || "")}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Profile Details */}
        {!editing ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <ProfileField label="Username" value={profile?.username} />
            <ProfileField label="Full Name" value={profile?.fullName} />
            <ProfileField label="Date of Birth" value={profile?.dateOfBirth} />
            <ProfileField label="Gender" value={profile?.gender} />
            <ProfileField label="Phone" value={profile?.phone} />
            <ProfileField label="Email" value={profile?.email} />
            <ProfileField label="ID Card" value={profile?.idCard} />
            {profile?.role === "PATIENT" && (
              <>
                <ProfileField label="Address" value={profile?.address} />
                <ProfileField
                  label="First Visit Date"
                  value={profile?.firstVisitDate}
                />
              </>
            )}
            {profile?.role !== "PATIENT" && (
              <ProfileField label="Position" value={profile?.position} />
            )}

            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Edit Profile
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Full Name"
              value={editForm.fullName || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, fullName: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={editForm.dateOfBirth || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, dateOfBirth: e.target.value })
              }
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={editForm.gender || ""}
                label="Gender"
                onChange={(e) =>
                  setEditForm({ ...editForm, gender: e.target.value })
                }
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Phone"
              value={editForm.phone || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="ID Card"
              value={editForm.idCard || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, idCard: e.target.value })
              }
              fullWidth
              size="small"
            />
            {profile?.role === "PATIENT" && (
              <TextField
                label="Address"
                value={editForm.address || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setEditing(false)}
                sx={{ flex: 1, textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ flex: 1, textTransform: "none" }}
              >
                {saving ? <CircularProgress size={20} /> : "Save"}
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || "-"}
      </Typography>
    </Box>
  );
}
