export type ShiftType = 'MORNING' | 'AFTERNOON';
export type ScheduleStatus = 'AVAILABLE' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
export type ConflictAction = 'SKIP' | 'OVERWRITE' | 'CANCEL';

// Schedule Slot (single time slot - 1 hour)
export interface ScheduleSlot {
  scheduleId: number;
  staffId: number;
  staffName: string;
  staffPosition: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  appointmentId?: number;
  patientName?: string;
}

// Shift Response (4 time slots = 1 shift)
export interface ShiftResponse {
  staffId: number;
  staffName: string;
  staffPosition: string;
  scheduleDate: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  timeSlots: { staffScheduleId: number }[];
  totalSlotsCount: number;
  bookedSlotsCount: number;
}

// Monthly Schedule Response
export interface StaffColorMapping {
  staffId: number;
  staffName: string;
  color: string;
}

export interface DayScheduleSummary {
  staffId: number;
  staffName: string;
  staffColor: string;
  shiftType: string;
  slotCount: number;
}

export interface MonthlyScheduleResponse {
  month: number;
  year: number;
  currentMonth: boolean;
  pastMonth: boolean;
  totalShifts: number;
  hasPreviousMonthSchedule: boolean;
  staffColors: StaffColorMapping[];
  scheduleByDay: { [dayOfMonth: number]: DayScheduleSummary[] };
}

// Daily Schedule Response
export interface DailyScheduleResponse {
  date: string;
  pastDate: boolean;
  today: boolean;
  dayOfWeek: number;
  dayOfWeekName: string;
  shifts: ShiftResponse[];
  totalShifts: number;
}

// Request DTOs
export interface StaffScheduleRequest {
  staffId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  status?: ScheduleStatus;
}

export interface ShiftAssignmentRequest {
  staffId: number;
  scheduleDate: string;
  shiftType: ShiftType;
  status?: ScheduleStatus;
}

export interface BulkShiftAssignmentRequest {
  staffId: number;
  scheduleDates: string[];
  shiftType: ShiftType;
  status?: ScheduleStatus;
}

export interface RecurringScheduleRequest {
  staffId: number;
  year: number;
  month: number;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  shiftType: ShiftType;
  status?: ScheduleStatus;
  conflictAction: ConflictAction;
}

export interface CopyScheduleFromPreviousMonthRequest {
  sourceMonth: number;
  sourceYear: number;
  targetMonth: number;
  targetYear: number;
  staffId?: number;
  conflictAction: ConflictAction;
}

// Bulk Operation Response
export interface ConflictInfo {
  date: string;
  staffId: number;
  staffName?: string;
  shiftType?: string;
  existingShiftInfo: string;
}

export interface BulkOperationResponse {
  success: boolean;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  conflicts: ConflictInfo[];
  createdDates: string[];
  message: string;
}

// Staff (for dropdown selection)
export interface StaffOption {
  staffId: number;
  fullName: string;
  position: string;
}
