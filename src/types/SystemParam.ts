export interface SystemParamGroup {
	groupId: number;
	groupCode: string;
	groupName: string;
	description: string;
	active: boolean;
}

export interface SystemParam {
	paramId: number;
	groupId: number;
	paramCode: string;
	paramName: string;
	paramValue: string;
	dataType: "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "DECIMAL";
	unit?: string;
	effectiveFrom: string;
	active: boolean;
	description?: string;
	// For display purposes
	groupName?: string;
	groupCode?: string;
}

export interface SystemParamCreateDto {
	groupId: number;
	paramCode: string;
	paramName: string;
	paramValue: string;
	dataType: string;
	unit?: string;
	effectiveFrom?: string;
	isActive: boolean;
	description?: string;
}

export interface SystemParamGroupCreateDto {
	groupCode: string;
	groupName: string;
	description?: string;
	isActive: boolean;
}
