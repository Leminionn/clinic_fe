

export const baseURL = import.meta.env.VITE_BASE_URL;

// Receptionist - Patients
export const receptionistGetPatient = "receptionist/get_all_patients";
export const receptionistGetPatientDetail = (id:string)=>`receptionist/get_patient_by_id/${id}`;
export const receptionistCreatePatient = "receptionist/create_patient";
export const receptionistUpdatePatient=(id:string)=>`receptionist/update_patient/${id}`;
export const receptionistDeletePatient = (id:number)=>`receptionist/delete_patient/${id}`;

// Auth
export const authLogin = "auth/login";

// Admin - Payment Methods (theo backend controller)
export const paymentMethodsSearch = (query: string) => `admin/payment-methods${query}`;
export const paymentMethodsCreate = "admin/payment-methods";
export const paymentMethodsUpdate = (id: number) => `admin/payment-methods/${id}`;
export const paymentMethodsDelete = (id: number) => `admin/payment-methods/${id}`;
export const paymentMethodsGetById = (id: number) => `payment-methods/${id}`;
export const paymentMethodsGetAll = "payment-methods";
export const paymentMethodsGetActive = "payment-methods/active";