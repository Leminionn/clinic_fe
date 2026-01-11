import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/page";
import LandingPage from "../pages/LandingPage/page";
import DashboardLayout from "../layouts/DashboardLayout";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";

// Các trang
import AdminDashboard from "../pages/Admin/Dashboard/page";
import PatientList from "../pages/SharedPages/crudsPatients/PatientList/page";
import CreateUpdatePatient from "../pages/SharedPages/crudsPatients/CreateUpdatePatient/page";
import PatientDetail from "../pages/SharedPages/crudsPatients/PatientDetail/page";
import PaymentMethodsList from "../pages/SharedPages/crudsPaymentMethods/List/page";

import SystemParamsList from "../pages/SharedPages/crudsSystemParams/List/page";
import SystemParamGroupsList from "../pages/SharedPages/crudsSystemParams/Groups/page";
import PaymentMethodDetail from "../pages/SharedPages/crudsPaymentMethods/Detail/page";
import CreateUpdatePaymentMethod from "../pages/SharedPages/crudsPaymentMethods/CreateUpdate/page";

import DiseaseTypesList from "../pages/Admin/DiseaseTypes/List/page";
import CreateUpdateDiseaseType from "../pages/Admin/DiseaseTypes/CreateUpdate/page";
import DiseaseTypeDetail from "../pages/Admin/DiseaseTypes/Detail/page";

// Staff Management
import DoctorsList from "../pages/Admin/Staff/Doctors/page";
import ReceptionistsList from "../pages/Admin/Staff/Receptionists/page";
import WarehouseStaffsList from "../pages/Admin/Staff/WarehouseStaffs/page";
import CreateUpdateStaff from "../pages/Admin/Staff/CreateUpdate/page";
import StaffDetail from "../pages/Admin/Staff/Detail/page";
import StaffSchedule from "../pages/Admin/Staff/Schedule/page";
import ScheduleList from "../pages/Admin/Schedules/List/page";
import ShiftDetail from "../pages/Admin/Schedules/Detail/page";

import DoctorDashboard from "../pages/Doctor/Dashboard/page";
import MedicalExamination from "../pages/Doctor/MedicalExam/page";
import MedicalRecordsList from "../pages/SharedPages/crudMedicalRecords/MedicalRecordList/page";
import MedicalRecordDetail from "../pages/SharedPages/crudMedicalRecords/MedicalRecordDetail/MedicalRecordDetail";

import ReceptionistDashboard from "../pages/Receptionist/Dashboard/page";
import ReceptionList from "../pages/SharedPages/crudsReceptionList/ReceptionList/page";
import AppointmentList from "../pages/SharedPages/crudsAppointments/AppointmentList/page";
import ServiecList from "../pages/SharedPages/crudsServices/ServiceList/page";
import ServiceDetailPage from "../pages/SharedPages/crudsServices/ServiceDetail/ServiceDetail";
import ServiceCreateForm from "../pages/SharedPages/crudsServices/CreateService/CreateService";
import AppointmentBooking from "../pages/SharedPages/crudsAppointments/AppointmentBooking.tsx/page";
import AppointmentDetail from "../pages/SharedPages/crudsAppointments/AppointmentDetail/AppointmentDetail";
import InvoiceDetail from "../pages/SharedPages/crudInvoice/InvoiceDetail/InvoiceDetail";
import PrescriptionListPage from "../pages/Doctor/Prescriptions/page";
import PrescriptionDetail from "../pages/Doctor/Prescriptions/detail";
import PrescriptionCreatePage from "../pages/Doctor/Prescriptions/create";
import PrescriptionUpdatePage from "../pages/Doctor/Prescriptions/update";
import AppointmentUpdate from "../pages/SharedPages/crudsAppointments/AppointmentDetail/EditAppointment";

// Invoice Management
import { InvoiceList, InvoiceDetailPage } from "../pages/Receptionist/Invoice";
import { PatientInvoiceHistory, PatientInvoiceDetail } from "../pages/Patient/Invoice";

// Patient Medical Records
import MedicalRecordsPage from "../pages/Patient/MedicalRecords/MedicalRecordsPage";
import MedicalRecordDetailPage from "../pages/Patient/MedicalRecords/MedicalRecordDetailPage";
import PatientRegister from "../pages/Register/RegisterNewPatient";
import ChangePassword from "../pages/ChangePassword/ChangePassword";
import CreateAccount from "../pages/Register/CreateAccount";
import ForgotPassword from "../pages/ForgetPassword/ForgetPassword";
import VerifyCode from "../pages/ForgetPassword/VerifyCode";
import ResetPassword from "../pages/ForgetPassword/ResetPassword";
import SmartConsultation from "../pages/Consultation/ConsultationPage";
import ReceptionDetail from "../pages/SharedPages/crudsReceptionList/ReceptionDetail/page";

// Warehouse Staff - Dashboard
import WarehouseStaffDashboard from "../pages/WarehouseStaff/Dashboard/page";

// Warehouse Staff - Medicine Management
import MedicinesList from "../pages/WarehouseStaff/Medicines/List/page";
import MedicineDetailPage from "../pages/WarehouseStaff/Medicines/Detail/page";
import MedicineCreateUpdatePage from "../pages/WarehouseStaff/Medicines/CreateUpdate/page";
import MedicineImportsList from "../pages/SharedPages/crudMedicineImports/MedicineImportList/page";
import CreateImport from "../pages/SharedPages/crudMedicineImports/CreateImport/page";
import PriceManagementPage from "../pages/WarehouseStaff/Medicines/Prices/page";

import PatientDashboard from "../pages/Patient/Dashboard/page";
import MedicineImportDetail from "../pages/SharedPages/crudMedicineImports/MedicineImportDetail/page";

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register_patient" element={<PatientRegister />} />
      <Route path="/change_password" element={<ChangePassword />} />
      <Route path="/create_account" element={<CreateAccount />} />
      <Route path="/forget_password" element={<ForgotPassword />} />
      <Route path="/verify_code" element={<VerifyCode />} />
      <Route path="/reset_password" element={<ResetPassword />} />
      <Route path="/consultation" element={<SmartConsultation />} />
      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow="Admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="reception-list" element={<ReceptionList />} />
        <Route path="reception/:id" element={<ReceptionDetail />} />
        <Route path="appointment/:id" element={<AppointmentDetail />} />
        <Route path="medical_record/:id" element={<MedicalRecordDetail />} />
        <Route path="invoice/:id" element={<InvoiceDetail />} />
        <Route path="patients">
          <Route index element={<PatientList />} />
          <Route path="create-patient" element={<CreateUpdatePatient />} />
          <Route path="update-patient/:id" element={<CreateUpdatePatient />} />
          <Route path="patient-detail/:id" element={<PatientDetail />} />
        </Route>
        <Route path="payment-methods">
          <Route index element={<PaymentMethodsList />} />
          <Route path="create" element={<CreateUpdatePaymentMethod />} />
          <Route path="update/:id" element={<CreateUpdatePaymentMethod />} />
          <Route path="detail/:id" element={<PaymentMethodDetail />} />
        </Route>
        <Route path="disease-types">
          <Route index element={<DiseaseTypesList />} />
          <Route path="create" element={<CreateUpdateDiseaseType />} />
          <Route path="update/:id" element={<CreateUpdateDiseaseType />} />
          <Route path="detail/:id" element={<DiseaseTypeDetail />} />
        </Route>
        <Route path="staff">
          <Route path="doctors" element={<DoctorsList />} />
          <Route path="receptionists" element={<ReceptionistsList />} />
          <Route path="warehouse-staffs" element={<WarehouseStaffsList />} />
          <Route path="create" element={<CreateUpdateStaff />} />
          <Route path="edit/:id" element={<CreateUpdateStaff />} />
          <Route path=":id" element={<StaffDetail />} />
          <Route path="schedule/:id" element={<StaffSchedule />} />
        </Route>
        <Route path="system-params">
          <Route index element={<SystemParamsList />} />
        </Route>
        <Route path="system-param-groups">
          <Route index element={<SystemParamGroupsList />} />
        </Route>
        <Route path="appointments">
          <Route index element={<AppointmentList />} />
        </Route>
        <Route path="services">
          <Route index element={<ServiecList />} />
          <Route path="service-detail/:serviceId" element={<ServiceDetailPage />} />
          <Route path="create" element={<ServiceCreateForm />} />
        </Route>
        <Route path="schedules">
          <Route index element={<ScheduleList />} />
          <Route path="shift/:staffId/:date/:shiftType" element={<ShiftDetail />} />
        </Route>
        <Route path="invoices">
          <Route index element={<InvoiceList />} />
          <Route path=":invoiceId" element={<InvoiceDetailPage />} />
        </Route>
      </Route>

      {/* Doctor */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allow="Doctor">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
        <Route path="reception/:id" element={<ReceptionDetail />} />
        <Route path="reception-list" element={<ReceptionList />} />
        <Route path="medical-examination" element={<MedicalExamination />} />
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="appointment/:id" element={<AppointmentDetail />} />
        <Route path="patients">
          <Route index element={<PatientList />} />
          <Route path="patient-detail/:id" element={<PatientDetail />} />
        </Route>
        <Route path="medical-records">
          <Route index element={<MedicalRecordsList />} />
          <Route path=":id" element={<MedicalRecordDetail />} />
          {/** 
          <Route path="create" element={<CreateMedicalRecord />} />
          */}
        </Route>
        <Route path="prescriptions" element={<PrescriptionListPage />} />
        <Route path="prescription/:id" element={<PrescriptionDetail />} />
        <Route path="prescription/create" element={<PrescriptionCreatePage />} />
        <Route path="prescription/update/:prescriptionId" element={<PrescriptionUpdatePage />} />
      </Route>

      {/* Receptionist */}
      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allow="Receptionist">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReceptionistDashboard />} />
        <Route path="patients">
          <Route index element={<PatientList />} />
          <Route path="create-patient" element={<CreateUpdatePatient />} />
          <Route path="update-patient/:id" element={<CreateUpdatePatient />} />
          <Route path="patient-detail/:id" element={<PatientDetail />} />
        </Route>
        <Route path="reception-list" element={<ReceptionList />} />
        <Route path="appointments">
          <Route index element={<AppointmentList />} />
          <Route path="new" element={<AppointmentBooking />} />
        </Route>
        <Route path="reception/:id" element={<ReceptionDetail />} />



        <Route path="appointment/:id" element={<AppointmentDetail />} />
        <Route path="medical_record/:id" element={<MedicalRecordDetail />} />
        <Route path="invoice/:id" element={<InvoiceDetail />} />
        <Route path="invoices">
          <Route index element={<InvoiceList />} />
          <Route path=":invoiceId" element={<InvoiceDetailPage />} />
        </Route>
        <Route path="appointment/update/:appointmentId" element={<AppointmentUpdate />} />

      </Route>

      {/* WarehouseStaff */}
      <Route
        path="/warehouse-staff"
        element={
          <ProtectedRoute allow="WarehouseStaff">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WarehouseStaffDashboard />} />
        <Route path="dashboard" element={<WarehouseStaffDashboard />} />
        <Route path="medicines">
          <Route index element={<MedicinesList />} />
          <Route path="create" element={<MedicineCreateUpdatePage />} />
          <Route path="edit/:id" element={<MedicineCreateUpdatePage />} />
          <Route path=":id" element={<MedicineDetailPage />} />
          <Route path=":id/prices" element={<PriceManagementPage />} />
        </Route>
        <Route path="medicine-imports">
          <Route index element={<MedicineImportsList />} />
          <Route path=":id" element={<MedicineImportDetail />} />   
          <Route path="create" element={<CreateImport />} />
        </Route>
      </Route>

      {/* Patient */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allow="Patient">
            <DashboardLayout />

          </ProtectedRoute>

        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="medical-record/:recordId" element={<MedicalRecordDetailPage />} />

        <Route path="invoices">
          <Route index element={<PatientInvoiceHistory />} />
          <Route path=":invoiceId" element={<PatientInvoiceDetail />} />
        </Route>
        <Route path="appointments" element={<AppointmentList />} />
        <Route path="book_appointment" element={<AppointmentBooking />} />
        <Route path="appointment/:id" element={<AppointmentDetail />} />
        <Route path="appointment/update/:appointmentId" element={<AppointmentUpdate />} />
        <Route path="prescriptions" element={<PrescriptionListPage />} />
        <Route path="prescription/:id" element={<PrescriptionDetail />} />
      </Route>

      {/* Redirect fallback */}
      <Route
        path="*"
        element={
          role ? (
            role === "Admin" ? (
              <Navigate to="/admin" replace />
            ) : role === "Doctor" ? (
              <Navigate to="/doctor" replace />
            ) : role === "Receptionist" ? (
              <Navigate to="/receptionist" replace />
            ) : role === "WarehouseStaff" ? (
              <Navigate to="/warehouse-staff" replace />
            ) : (
              <Navigate to="/patient" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      {/*
      <Route path="/not_found" element={<NotFound/>}/>

      <Route path="/test/list_patient" element= {<PatientPage/>}/>
      <Route path="/test/create_patient" element= {<CreatePatient/>}/>
      <Route path="/test/patient_detail/:id" element={<PatientDetail/>}/>
      <Route path="/test/update_patient/:id" element={<UpdatePatient/>}/>
      */}
    </Routes>
  );
}
