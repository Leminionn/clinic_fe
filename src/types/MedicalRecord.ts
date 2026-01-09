export interface MedicalRecord {
	recordId: number;
	patient?: {
		patientId: number;
		fullName: string;
		dateOfBirth: string;
		gender: string;
		address: string;
		phone: string;
		email: string;
		idCard: string;
		firstVisitDate: string;
	};
	doctorId: number;
	doctorName: string;
	examinateDate: string;
	symptoms: string;
	diagnosis: string;
	diseaseType?: {
		diseaseTypeId: number;
		diseaseName: string;
		diseaseCode: string;
		description?: string;
		isChronic?: boolean;
		isContagious?: boolean;
		isActive?: boolean;
	};
	orderedServices:
		| Array<{
				serviceId: number;
				serviceName: string;
				quantity: number;
		  }>
		| string; // Support both new DTO array and old string format
	notes: string;
	prescription?: {
		prescriptionId: number;
		prescriptionDate: string;
		notes: string;
		prescriptionDetail: Array<{
			medicine: {
				medicineId: number;
				medicineName: string;
				unit: string;
			};
			quantity: number;
			dosage: string;
			days: number;
			dispenseStatus: string;
		}>;
	};
}

export interface Prescription {
	prescriptionId: number;
	prescriptionDate: string;
	notes: string;
	record: {
		recordId: number;
	};
}

export interface PrescriptionDetail {
	medicine: {
		medicineId: number;
		medicineName: string;
		unit: string;
	};
	quantity: number;
	dosage: string;
	days: number;
	dispenseStatus: string;
}

export interface Reception {
	receptionId: number;
	patient: {
		patientId: number;
		fullName: string;
		phone: string;
	};
	receptionDate: string;
	status: string;
	receptionist: {
		staffId: number;
		fullName: string;
	};
}
