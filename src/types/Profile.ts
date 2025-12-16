export interface ProfileResponse {
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

export interface UpdateProfileRequest {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  idCard?: string;
  address?: string;
}
