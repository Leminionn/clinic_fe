export interface MedicalRecord {
	recordId: number;
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
	orderedServices: string;
	notes: string;
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
