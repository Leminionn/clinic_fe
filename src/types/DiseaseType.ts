export interface DiseaseType {
	diseaseTypeId: number;
	diseaseCode: string;
	diseaseName: string;
	description?: string;
	isChronic: boolean;
	isContagious: boolean;
	isActive: boolean;
}

export interface DiseaseTypeCreateDto {
	diseaseCode: string;
	diseaseName: string;
	description?: string;
	isChronic?: boolean;
	isContagious?: boolean;
	isActive?: boolean;
}

export interface DiseaseTypeFilterDto {
	page?: number;
	size?: number;
	sortBy?: string;
	sortType?: "ASC" | "DESC";
	keyword?: string;
	isActive?: boolean;
	isChronic?: boolean;
	isContagious?: boolean;
}
