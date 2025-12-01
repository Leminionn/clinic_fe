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

// Admin - Payment Methods
export const paymentMethodsSearch = (query: string) =>
	`admin/payment-methods/search${query}`;
export const paymentMethodsCreate = "admin/payment-methods/create";
export const paymentMethodsUpdate = (id: number) =>
	`admin/payment-methods/update/${id}`;
export const paymentMethodsDelete = (id: number) =>
	`admin/payment-methods/delete/${id}`;
export const paymentMethodsGetById = (id: number) =>
	`admin/payment-methods/${id}`;
export const paymentMethodsGetAll = "admin/payment-methods/all";
export const paymentMethodsGetActive = "admin/payment-methods/active";

// Admin - System Param Groups
export const systemParamGroupsSearch = (query: string) =>
	`admin/system-param-groups/search${query}`;
export const systemParamGroupsCreate = "admin/system-param-groups/create";
export const systemParamGroupsUpdate = (id: number) =>
	`admin/system-param-groups/update/${id}`;
export const systemParamGroupsDelete = (id: number) =>
	`admin/system-param-groups/delete/${id}`;
export const systemParamGroupsGetById = (id: number) =>
	`admin/system-param-groups/${id}`;
export const systemParamGroupsGetAll = "admin/system-param-groups/all";
export const systemParamGroupsGetActive = "admin/system-param-groups/active";

// Admin - System Params
export const systemParamsSearch = (query: string) =>
	`admin/system-params/search${query}`;
export const systemParamsCreate = "admin/system-params/create";
export const systemParamsUpdate = (id: number) =>
	`admin/system-params/update/${id}`;
export const systemParamsDelete = (id: number) =>
	`admin/system-params/delete/${id}`;
export const systemParamsGetById = (id: number) => `admin/system-params/${id}`;
export const systemParamsGetByGroup = (groupId: number) =>
	`admin/system-params/by-group/${groupId}`;
export const systemParamsGetAll = "admin/system-params/all";
