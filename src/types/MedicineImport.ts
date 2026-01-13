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
  editable: boolean; // true if ALL details are editable (no items sold from this import)
}

export interface ImportItem {
  medicine: {
    medicineId: number;
    medicineName: string;
    unit: string;
  };
  quantity: number; // Import quantity (static - original import amount)
  quantityInStock: number; // Current inventory quantity (dynamic)
  expiryDate: string;
  importPrice: number;
  editable: boolean; // true if quantityInStock == quantity (no items sold from this batch)
  statusMessage: string; // Warning message if not editable (e.g., "Đã bán, không được sửa/xóa")
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
  editable?: boolean; // true if this item can be edited (no items sold)
  statusMessage?: string; // Warning message if not editable
  quantityInStock?: number; // Current inventory quantity (for display purposes)
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