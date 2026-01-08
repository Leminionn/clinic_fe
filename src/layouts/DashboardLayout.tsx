import { Box, } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarItem } from "../components/Sidebar";
import { useAuth } from "../auth/AuthContext";
import {
  Home,
  People,
  MedicalInformation,
  Inventory,
  Person,
  Medication,
  MedicationLiquid,
  ReceiptLong,
  MedicalServices,
  Payment,
  Settings,
  LocalHospital,
  FolderOpen,
} from "@mui/icons-material";
import { Calendar1, ChartArea, FolderTree } from "lucide-react";

export default function DashboardLayout() {
  const { role } = useAuth();

  const menuByRole: Record<string, SidebarItem[]> = {
    Admin: [
      { label: "Dashboard", path: "/admin", icon: <Home /> },
      {
        label: "Staffs",
        icon: <People />,
        children: [
          { label: "Doctors", path: "/admin/staff/doctors", icon: <People /> },
          { label: "Receptionists", path: "/admin/staff/receptionists", icon: <People /> },
          { label: "Warehouse Staffs", path: "/admin/staff/warehouse-staffs", icon: <People /> },

        ],
      },
      { label: "Patients", path: "/admin/patients", icon: <People /> },
      { label: "Appointments", path: "/admin/appointments", icon: <Calendar1 /> },
      { label: "Staff Schedules", path: "/admin/schedules", icon: <Calendar1 /> },
      { label: "Services", path: "/admin/services", icon: <MedicalServices /> },
      { label: "Payment Methods", path: "/admin/payment-methods", icon: <Payment /> },
      { label: "Receipts", path: "/admin/invoices", icon: <ReceiptLong /> },
      { label: "Disease Types", path: "/admin/disease-types", icon: <LocalHospital /> },
      { label: "Medicine Inventory", path: "/admin/inventory", icon: <Inventory /> },
      { label: "Report & Statistic", path: "/admin/statistic", icon: <ChartArea /> },
      {label:"Reception list", path:"/admin/reception-list",icon: <People/>},
      {
        label: "Settings",
        icon: <Settings />,
        children: [
          { label: "System Parameters", path: "/admin/system-params", icon: <Settings /> },
          { label: "Parameter Groups", path: "/admin/system-param-groups", icon: <FolderTree /> },
        ],
      },
    ],
    Doctor: [
      { label: "Dashboard", path: "/doctor", icon: <Home /> },
      { label: "Reception List", path: "/doctor/reception-list", icon: <People /> },
      { label: "Medical Records", path: "/doctor/medical-records", icon: <MedicalInformation /> },
      { label: "Medical Examination", path: "/doctor/medical-examination", icon: <MedicalInformation /> },
      { label: "My Appointments", path: "/doctor/appointments", icon: <Calendar1 /> },
      
      { label: "Prescriptions", path: "/doctor/prescriptions", icon: <MedicationLiquid /> }

    ],
    Receptionist: [
      { label: "Dashboard", path: "/receptionist", icon: <Home /> },
      { label: "Reception List", path: "/receptionist/reception-list", icon: <People /> },
      { label: "Appointments", path: "/receptionist/appointments", icon: <Calendar1 /> },
      { label: "Receipts", path: "/receptionist/invoices", icon: <ReceiptLong /> },
      
      { label: "Patients", path: "/receptionist/patients", icon: <Person></Person> }
    ],
    WarehouseStaff: [
      { label: "Dashboard", path: "/warehouse-staff", icon: <Home /> },
      { label: "Medicines", path: "/warehouse-staff/medicines", icon: <Medication /> },
      { label: "Medicine Inventory", path: "/warehouse-staff/inventory", icon: <Inventory /> },
      
    ],
    Patient: [
      { label: "Dashboard", path: "/patient", icon: <Home /> },
      { label: "My Appointments", path: "/patient/appointments", icon: <Calendar1 /> },
      { label: "Medical Records", path: "/patient/medical-records", icon: <FolderOpen /> },
      { label: "Invoice History", path: "/patient/invoices", icon: <ReceiptLong /> },
      { label: "Recent Prescriptions", path: "/patient/prescriptions", icon: <MedicationLiquid /> },
      
    ],
  };

  return (
    <Box display="flex" height="100vh" width="100vw">
      {role && <Sidebar items={menuByRole[role]} />}
      <Box flex={1} bgcolor="var(--color-bg-default)">
        <Outlet />
      </Box>
    </Box>
  );
}
