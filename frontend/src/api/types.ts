export type Role = "NURSE" | "HR";
export type NurseStatus = "ACTIVE" | "ON_LEAVE";
export type ShiftType = "MORNING" | "EVENING" | "NIGHT";
export type LeaveType = "ANNUAL" | "PERSONAL" | "SICK" | "EMERGENCY";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  phone: string | null;
  ward: string | null;
  department: string | null;
  status: NurseStatus;
  createdAt: string;
  shiftsThisWeek?: number;
};

export type ApiShift = {
  id: string;
  nurseId: string;
  date: string;
  type: ShiftType;
  ward: string;
  startTime: string;
  endTime: string;
  nurse?: { id: string; name: string };
};

export type ApiLeaveRequest = {
  id: string;
  nurseId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: LeaveStatus;
  createdAt: string;
  nurse?: { id: string; name: string; avatar: string | null; ward: string | null };
};

export type DayCoverage = {
  date: string;
  day: string;
  morning: { filled: number; required: number };
  evening: { filled: number; required: number };
  night: { filled: number; required: number };
};

export type WeeklyAvailability = Record<
  "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun",
  { morning: boolean; evening: boolean; night: boolean }
>;

export type ApiMessage = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  read: boolean;
  createdAt: string;
  sender?: { id: string; name: string; avatar: string | null; role: Role };
};

export type MessageThread = {
  user: { id: string; name: string; avatar: string | null; role: Role };
  lastMessage: ApiMessage;
  unreadCount: number;
};

export type ScheduleShortfall = {
  ward: string;
  date: string;
  day: string;
  type: ShiftType;
  required: number;
  filled: number;
};

export type GenerateScheduleResult = {
  created: number;
  weekStart: string;
  weekEnd: string;
  totalRequired: number;
  totalFilled: number;
  shortfalls: ScheduleShortfall[];
};

export type HRStats = {
  totalNurses: number;
  activeNurses: number;
  todaysShifts: number;
  coverageRate: number;
  pendingLeaves: number;
  pendingRequests: ApiLeaveRequest[];
};
