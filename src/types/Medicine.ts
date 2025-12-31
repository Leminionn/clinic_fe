export const EMedicineUnit = {
	TABLET: "TABLET",
	CAPSULE: "CAPSULE",
	BLISTER: "BLISTER",
	BOX: "BOX",
	BOTTLE: "BOTTLE",
	TUBE: "TUBE",
	VIAL: "VIAL",
	AMPOULE: "AMPOULE",
	SACHET: "SACHET",
	PACK: "PACK",
	BAG: "BAG",
} as const;

export type EMedicineUnit = (typeof EMedicineUnit)[keyof typeof EMedicineUnit];

export const EMedicineStorageCondition = {
	NORMAL: "NORMAL",
	REFRIGERATED: "REFRIGERATED",
	FROZEN: "FROZEN",
	CONTROLLED_ROOM_TEMPERATURE: "CONTROLLED_ROOM_TEMPERATURE",
} as const;

export type EMedicineStorageCondition =
	(typeof EMedicineStorageCondition)[keyof typeof EMedicineStorageCondition];

export interface Medicine {
	medicineId: number;
	medicineName: string;
	unit: EMedicineUnit;
	concentration?: string;
	form?: string;
	manufacturer?: string;
	usageInstructions?: string;
	image?: string;
	storageCondition: EMedicineStorageCondition;
	totalQuantity?: number;
}

export interface MedicinePrice {
	medicineId: number;
	effectiveDate: string; // ISO date string
	unitPrice: number;
	canDelete: boolean;
}

export interface MedicineInventory {
	importId: number;
	importDate: string;
	expiryDate: string;
	importPrice: number;
	quantityInStock: number;
	supplier: string;
}

export interface MedicineDetail {
	medicine: Medicine;
	currentPrice: number;
	inventories: MedicineInventory[];
	priceHistory: MedicinePrice[];
}

export interface MedicineRequest {
	medicineName: string;
	unit: EMedicineUnit;
	concentration?: string;
	form?: string;
	manufacturer?: string;
	usageInstructions?: string;
	image?: string;
	storageCondition?: EMedicineStorageCondition;
}

export interface MedicinePriceRequest {
	effectiveDate: string;
	unitPrice: number;
}

export interface MedicineFilterRequest {
	page?: number;
	size?: number;
	sortBy?: string;
	sortType?: "ASC" | "DESC";
	keyword?: string;
	unit?: EMedicineUnit;
	manufacturer?: string;
}
