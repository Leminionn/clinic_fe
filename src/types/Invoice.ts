// Invoice types for the clinic management system

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface InvoiceListItem {
	invoiceId: number;
	patientId: number;
	patientName: string;
	patientPhone: string;
	recordId: number | null;
	invoiceDate: string;
	examinationFee: number;
	medicineFee: number;
	serviceFee: number;
	totalAmount: number;
	paymentMethodName: string | null;
	paymentStatus: PaymentStatus;
	issuedByName: string | null;
}

export interface PatientInfo {
	patientId: number;
	fullName: string;
	phone: string;
	address: string;
	dateOfBirth: string;
}

export interface RecordInfo {
	recordId: number;
	examinateDate: string;
	diagnosis: string;
	symptoms: string;
	doctorName: string;
}

export interface PaymentMethodInfo {
	paymentMethodId: number;
	methodCode: string;
	methodName: string;
}

export interface StaffInfo {
	staffId: number;
	fullName: string;
}

export interface InvoiceServiceDetailItem {
	detailId: number;
	serviceId: number;
	serviceName: string;
	quantity: number;
	salePrice: number;
	amount: number;
}

export interface InvoiceMedicineDetailItem {
	detailId: number;
	medicineId: number;
	medicineName: string;
	unit: string;
	concentration: string;
	quantity: number;
	salePrice: number;
	amount: number;
}

export interface InvoiceDetail {
	invoiceId: number;
	patient: PatientInfo;
	record: RecordInfo | null;
	invoiceDate: string;
	examinationFee: number;
	medicineFee: number;
	serviceFee: number;
	totalAmount: number;
	paymentMethod: PaymentMethodInfo | null;
	paymentStatus: PaymentStatus;
	issuedBy: StaffInfo | null;
	serviceDetails: InvoiceServiceDetailItem[];
	medicineDetails: InvoiceMedicineDetailItem[];
}

export interface AvailableMedicine {
	medicineId: number;
	medicineName: string;
	unit: string;
	concentration: string;
	form: string;
	manufacturer: string;
	availableQuantity: number;
	unitPrice: number;
	nearestExpiryDate: string;
}

export interface InvoiceSearchParams {
	patientName?: string;
	patientPhone?: string;
	patientId?: number;
	recordId?: number;
	paymentStatus?: PaymentStatus;
	fromDate?: string;
	toDate?: string;
	page?: number;
	size?: number;
}

export interface UpdateInvoiceRequest {
	paymentMethodId?: number;
}

export interface InvoiceMedicineDetailRequest {
	detailId?: number;
	medicineId: number;
	quantity: number;
	salePrice?: number;
}

export interface InvoiceServiceDetailRequest {
	detailId?: number;
	serviceId: number;
	quantity: number;
	salePrice?: number;
}

// Payment (PayOS) types
export interface CreatePaymentRequest {
	invoiceId: number;
	amount?: number;
	description?: string;
	buyerName?: string;
	buyerEmail?: string;
	buyerPhone?: string;
	buyerAddress?: string;
}

export interface PaymentLinkResponse {
	bin: string;
	accountNumber: string;
	accountName: string;
	amount: number;
	description: string;
	orderCode: number;
	currency: string;
	paymentLinkId: string;
	status: string;
	checkoutUrl: string;
	qrCode: string;
}

export interface PaymentInfoResponse {
	id: string;
	orderCode: number;
	amount: number;
	amountPaid: number;
	amountRemaining: number;
	status: string;
	createdAt: string;
	canceledAt: string | null;
	cancellationReason: string | null;
}

export interface VerifyPaymentRequest {
	invoiceId: number;
	orderCode: number;
}
