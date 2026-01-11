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

export interface CreateMedicineImportUI {
  importDate: string;
  importerId: number;
  supplier: string;
  importDetails: CreateImportDetailUI[]
}

export interface CreateImportDetailUI {
  rowId: string;
  medicineId: number | null;
  quantity: number;
  expiryDate: string;
  importPrice: number;
}

export interface Medicine {
  medicineId: number;
  medicineName: string;
  unit: string;
}