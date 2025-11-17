export interface Appointment {
  appointment_id: number;
  patient_id: number;
  patient_name: string;
  patient_image: string;
  doctor_name: string;
  doctor_image: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}