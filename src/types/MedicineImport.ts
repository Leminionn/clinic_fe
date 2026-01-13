export interface MedicineImport {
  importId: number;
  importDate: string;
  importerName: string;
  supplier: string;
  totalQuantity: number;
  totalValue: number;
}

export interface MedicineImportDetail {
  importId: number;
  importDate: string;
  importer: {
    importerId: number;
    importerName: string;
  }
  supplier: string;
  importDetails: ImportItem[];
  totalQuantity: number;
  totalValue: number;
  editable: boolean;
}

export interface ImportItem {
  medicine: {
    medicineId: number;
    medicineName: string;
    unit: string;
  };
  quantity: number;
  expiryDate: string;
  importPrice: number;
}

export interface CreateMedicineImport {
  importDate: string;
  importerId: number;
  supplier: string;
  importDetails: CreateUpdateImportDetail[]
}

export interface CreateUpdateImportDetail {
  medicineId: number | null;
  quantity: number;
  expiryDate: string;
  importPrice: number;
}

export interface CreateUpdateImportDetailUI extends CreateUpdateImportDetail {
  rowId: string;
}

export interface UpdateMedicineImport {
  importId: number;
  importDate: string;
  importer: {
    importerId: number;
    importerName: string;
  };
  supplier: string;
  importDetails: CreateUpdateImportDetail[]
}

export interface Medicine {
  medicineId: number;
  medicineName: string;
  unit: string;
}