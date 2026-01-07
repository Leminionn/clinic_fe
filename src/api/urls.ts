export const baseURL = import.meta.env.VITE_BASE_URL;
export const aiURL=import.meta.env.VITE_AI_URL;
// Receptionist - Patients
export const receptionistGetPatient = "receptionist/get_all_patients";
export const receptionistGetPatientDetail = (id: string) =>
	`receptionist/get_patient_by_id/${id}`;
export const receptionistCreatePatient = "receptionist/create_patient";
export const receptionistUpdatePatient = (id: string) =>
	`receptionist/update_patient/${id}`;
export const receptionistDeletePatient = (id: number) =>
	`receptionist/delete_patient/${id}`;

// Auth
export const authLogin = "auth/login";

export const paymentMethodsSearch = (query: string) =>
	`admin/payment-methods${query}`;
export const paymentMethodsCreate = "admin/payment-methods";
export const paymentMethodsUpdate = (id: number) =>
	`admin/payment-methods/${id}`;
export const paymentMethodsDelete = (id: number) =>
	`admin/payment-methods/${id}`;
export const paymentMethodsGetById = (id: number) => `payment-methods/${id}`;
export const paymentMethodsGetAll = "payment-methods";
export const paymentMethodsGetActive = "payment-methods/active";

// Admin - System Param Groups (BE: /admin/sys-param-groups)
export const systemParamGroupsSearch = (query: string) =>
	`admin/sys-param-groups/search${query}`;
export const systemParamGroupsCreate = "admin/sys-param-groups";

export const warehouseDashboardStats = "warehouse/dashboard";
export const systemParamGroupsUpdate = (id: number) =>
	`admin/sys-param-groups/${id}`;
export const systemParamGroupsDelete = (id: number) =>
	`admin/sys-param-groups/${id}`;
export const systemParamGroupsGetById = (id: number) =>
	`admin/sys-param-groups/${id}`;
export const systemParamGroupsGetAll = "admin/sys-param-groups";
export const systemParamGroupsGetActive = "admin/sys-param-groups/active";

// Admin - System Params (BE: /admin/sys-params)
export const systemParamsSearch = (query: string) =>
	`admin/sys-params/search${query}`;
export const systemParamsCreate = "admin/sys-params";
export const systemParamsUpdate = (id: number) => `admin/sys-params/${id}`;
export const systemParamsDelete = (id: number) => `admin/sys-params/${id}`;
export const systemParamsGetById = (id: number) => `admin/sys-params/${id}`;
export const systemParamsGetByGroup = (groupId: number) =>
	`admin/sys-params/group/${groupId}`;
export const systemParamsGetAll = "admin/sys-params";

// Admin - Disease Types (BE: /admin/disease-types)
export const diseaseTypesSearch = (query: string) =>
	`admin/disease-types${query}`;
export const diseaseTypesCreate = "admin/disease-types";
export const diseaseTypesUpdate = (id: number) => `admin/disease-types/${id}`;
export const diseaseTypesDelete = (id: number) => `admin/disease-types/${id}`;
export const diseaseTypesGetById = (id: number) => `admin/disease-types/${id}`;
export const diseaseTypesGetAll = "admin/disease-types/all";
export const diseaseTypesGetActive = "admin/disease-types/active";

// Admin - Staff Management (BE: /admin/staff)
export const staffSearch = (query: string) => `admin/staff${query}`;
export const staffCreate = "admin/staff";
export const staffUpdate = (id: number) => `admin/staff/${id}`;
export const staffDelete = (id: number) => `admin/staff/${id}`;
export const staffGetById = (id: number) => `admin/staff/${id}`;
export const staffGetByRole = (role: string) => `admin/staff/role/${role}`;

// Admin - Staff Schedule (BE: /admin/staff-schedule)
export const staffScheduleGetByStaffId = (staffId: number) =>
	`admin/staff-schedule/staff/${staffId}`;
// Profile API
export const profileGetMe = "account/me";
export const profileUpdateMe = "account/me";

// Admin - Staff Schedules (BE: /admin/schedules)
export const scheduleGetMonthly = (month: number, year: number) =>
	`admin/schedules/monthly?month=${month}&year=${year}`;
export const scheduleGetMonthlyByStaff = (
	staffId: number,
	month: number,
	year: number
) => `admin/schedules/monthly/staff/${staffId}?month=${month}&year=${year}`;
export const scheduleGetDaily = (date: string) =>
	`admin/schedules/daily?date=${date}`;
export const scheduleGetDailyByStaff = (staffId: number, date: string) =>
	`admin/schedules/daily/staff/${staffId}?date=${date}`;
export const scheduleGetSlotById = (scheduleId: number) =>
	`admin/schedules/${scheduleId}`;
export const scheduleCreateSlot = "admin/schedules";
export const scheduleUpdateSlot = (scheduleId: number) =>
	`admin/schedules/${scheduleId}`;
export const scheduleDeleteSlot = (scheduleId: number) =>
	`admin/schedules/${scheduleId}`;
export const scheduleAssignShift = "admin/schedules/shift";
export const scheduleBulkAssign = "admin/schedules/bulk";
export const scheduleRecurring = "admin/schedules/recurring";
export const scheduleCopyFromPrevious = "admin/schedules/copy-from-previous";
export const scheduleGetStaffList = (month: number, year: number) =>
	`admin/schedules/staff-list?month=${month}&year=${year}`;
export const scheduleCanModify = (date: string) =>
	`admin/schedules/can-modify?date=${date}`;

// Admin - Staff (for dropdowns)
export const staffGetDoctors = "admin/staffs/doctors";
export const staffGetAll = "admin/staffs";

// ==================== INVOICE APIs ====================
// Staff (Receptionist/Admin) Invoice APIs
export const invoiceSearch = (role: string, query: string) =>
	`${role}/invoices${query}`;
export const invoiceGetById = (role: string, invoiceId: number) =>
	`${role}/invoices/${invoiceId}`;
export const invoiceUpdate = (role: string, invoiceId: number) =>
	`${role}/invoices/${invoiceId}`;
export const invoiceMedicineDetails = (role: string, invoiceId: number) =>
	`${role}/invoices/${invoiceId}/medicine-details`;
export const invoiceMedicineDetailDelete = (
	role: string,
	invoiceId: number,
	detailId: number
) => `${role}/invoices/${invoiceId}/medicine-details/${detailId}`;
export const invoiceServiceDetails = (role: string, invoiceId: number) =>
	`${role}/invoices/${invoiceId}/service-details`;
export const invoiceServiceDetailDelete = (
	role: string,
	invoiceId: number,
	detailId: number
) => `${role}/invoices/${invoiceId}/service-details/${detailId}`;
export const invoiceAvailableMedicines = (role: string) =>
	`${role}/invoices/available-medicines`;
export const invoiceMarkPaid = (role: string, invoiceId: number) =>
	`${role}/invoices/${invoiceId}/mark-paid`;

// Patient Invoice APIs
export const patientInvoices = "patient/invoices";
export const patientInvoiceById = (invoiceId: number) =>
	`patient/invoices/${invoiceId}`;

// Payment (PayOS) APIs
export const paymentCreatePayment = (role: string) =>
	`${role}/payment/create-payment`;
export const paymentGetPaymentRequest = (role: string, orderCode: number) =>
	`${role}/payment/payment-requests/${orderCode}`;
export const paymentCancelPayment = (role: string, orderCode: number) =>
	`${role}/payment/payment-requests/${orderCode}/cancel`;
export const paymentVerifyPayment = (role: string) =>
	`${role}/payment/verify-payment`;

// ==================== WAREHOUSE - MEDICINE APIs ====================
// Medicine Management
export const warehouseMedicines = (query: string) =>
	`warehouse/medicines${query}`;
export const warehouseMedicinesAll = "warehouse/medicines/all";
export const warehouseMedicineById = (id: number) =>
	`warehouse/medicines/${id}`;
export const warehouseMedicineCreate = "warehouse/medicines";
export const warehouseMedicineUpdate = (id: number) =>
	`warehouse/medicines/${id}`;
export const warehouseMedicineDelete = (id: number) =>
	`warehouse/medicines/${id}`;
export const warehouseMedicineManufacturers =
	"warehouse/medicines/manufacturers";

// Medicine Price Management
export const warehouseMedicinePrices = (medicineId: number) =>
	`warehouse/medicines/${medicineId}/prices`;
export const warehouseMedicinePriceAdd = (medicineId: number) =>
	`warehouse/medicines/${medicineId}/prices`;
export const warehouseMedicinePriceUpdate = (medicineId: number) =>
	`warehouse/medicines/${medicineId}/prices`;
export const warehouseMedicinePriceDelete = (medicineId: number) =>
	`warehouse/medicines/${medicineId}/prices`;
