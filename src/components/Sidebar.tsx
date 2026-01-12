import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  Collapse,
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Logout,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import UserProfile from "./UserProfile";

export interface SidebarItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: SidebarItem[]; // submenu
}

interface SidebarProps {
  items: SidebarItem[];
}

const drawerWidth = 280;

export default function Sidebar({ items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: SidebarItem, depth = 0) => {
    const active = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const open = openMenus.includes(item.label);


    return (
      <Box key={item.label}>
        <Tooltip
          title={collapsed ? item.label : ""}
          placement="right"
          arrow
        >
          <ListItemButton
            selected={active}
            onClick={() => {
              if (hasChildren) toggleMenu(item.label);
              else if (item.path) navigate(item.path);
            }}
            sx={{
              pl: collapsed ? 0 : 5 + depth * 2,
              pr: collapsed ? 0 : 2,
              borderRightColor: 'var(--color-primary-main)',
              borderRightWidth: active ? '4px' : 0,
              borderRightStyle: 'solid',
              justifyContent: collapsed ? "center" : "flex-start",
              minHeight: 52,
              "&.Mui-selected": {
                backgroundColor: "rgba(63,81,181,0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
                color: active ? "var(--color-primary-main)" : "var(--color-text-disabled)",
              }}
            >
              {item.icon}
            </ListItemIcon>

            {!collapsed && (
              <>
                <Typography
                  sx={{
                    flexGrow: 1,
                    color: active ? "var(--color-text-primary)" : "var(--color-text-disabled)",
                    fontWeight: active ? "bold" : "normal",
                  }}
                >
                  {item.label}
                </Typography>
                {hasChildren && (
                  <ChevronRight
                    style={{
                      transform: open ? "rotate(90deg)" : "rotate(0)",
                      transition: "transform 200ms ease-in-out",
                    }}
                  />
                )}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {hasChildren && (
          <Collapse in={open && !collapsed}>
            <List disablePadding>
              {item.children!.map((child) =>
                renderMenuItem(child, depth + 1)
              )}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 72 : drawerWidth,
        "& .MuiDrawer-paper": {
          width: collapsed ? 72 : drawerWidth,
          transition: "width 0.3s",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          paddingLeft: collapsed ? "0px" : "40px",
          paddingRight: collapsed ? "0px" : "10px",
          paddingTop: "40px",
          paddingBottom: "50px",
        }}
      >
        {!collapsed && (
          <Typography variant="h4" fontWeight="bold" color="var(--color-primary-main)">
            Clinic
          </Typography>
        )}
        <IconButton size="large" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Menu */}
      <List sx={{ overflow: 'auto', scrollbarWidth: 'none' }}>
        {items.map((item) => renderMenuItem(item))}
      </List>

      <Box flexGrow={1} />

      <Divider />

      {/* User Profile */}
      <UserProfile collapsed={collapsed} />

      <Divider />

      {/* Logout */}
      <List>
        <Tooltip title={collapsed ? "Logout" : ""} placement="right" arrow>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              paddingX: collapsed ? "0px" : "40px",
              minHeight: 52,
              marginY: "5px",
            }}
          >
            <ListItemIcon sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: "center",
            }}>
              <Logout />
            </ListItemIcon>

            {!collapsed && (
              <Typography fontWeight="bold">
                Log out
              </Typography>
            )}
          </ListItemButton>
        </Tooltip>
      </List>
    </Drawer>
  );
}
