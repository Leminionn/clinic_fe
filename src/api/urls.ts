

export const baseURL = import.meta.env.VITE_BASE_URL;
export const receptionistGetPatient = "receptionist/get_all_patients";
export const receptionistGetPatientDetail = (id:string)=>`receptionist/get_patient_by_id/${id}`;
export const receptionistCreatePatient = "receptionist/create_patient";
export const receptionistUpdatePatient=(id:string)=>`receptionist/update_patient/${id}`;
export const receptionistDeletePatient = (id:number)=>`receptionist/delete_patient/${id}`;