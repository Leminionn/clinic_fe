export const baseURL = import.meta.env.VITE_BASE_URL;

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
export const staffGetAll = "admin/staff/all";
export const staffGetByRole = (role: string) => `admin/staff/role/${role}`;

// Admin - Staff Schedule (BE: /admin/staff-schedule)
export const staffScheduleGetByStaffId = (staffId: number) =>
	`admin/staff-schedule/staff/${staffId}`;
