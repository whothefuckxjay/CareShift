import { ApiShift, ApiLeaveRequest, ShiftType, LeaveType, LeaveStatus } from "@/api/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatShiftDate(isoDate: string) {
  const d = new Date(isoDate);
  const day = DAYS[d.getDay()];
  const date = d.getDate();
  const month = MONTHS[d.getMonth()];
  return { day, dateLabel: `${date} ${month}`, iso: isoDate };
}

export function shiftTypeLabel(type: ShiftType) {
  return type === "MORNING" ? "Morning Shift" : type === "EVENING" ? "Evening Shift" : "Night Shift";
}

export function shiftColor(type: ShiftType): "success" | "info" | "primary" {
  return type === "MORNING" ? "success" : type === "EVENING" ? "info" : "primary";
}

export function isToday(isoDate: string) {
  const d = new Date(isoDate);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

export function leaveTypeLabel(type: LeaveType) {
  const map: Record<LeaveType, string> = {
    ANNUAL: "Annual Leave",
    PERSONAL: "Personal Leave",
    SICK: "Sick Leave",
    EMERGENCY: "Emergency Leave",
  };
  return map[type];
}

export function leaveStatusLabel(status: LeaveStatus): "Approved" | "Pending" | "Rejected" {
  return status === "APPROVED" ? "Approved" : status === "REJECTED" ? "Rejected" : "Pending";
}

export function formatDateRange(startDate: string, endDate: string) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (s.toDateString() === e.toDateString()) return fmt(s);
  return `${fmt(s)} – ${fmt(e)}`;
}

export function toApiLeaveType(label: string): LeaveType {
  const map: Record<string, LeaveType> = {
    "Annual Leave": "ANNUAL",
    "Personal Leave": "PERSONAL",
    "Sick Leave": "SICK",
    "Emergency Leave": "EMERGENCY",
  };
  return map[label] ?? "ANNUAL";
}

// Sort shifts by date and group them for the weekly schedule display.
export function groupShiftsByDate(shifts: ApiShift[]) {
  return shifts.reduce<Record<string, ApiShift[]>>((acc, s) => {
    const key = s.date.split("T")[0];
    acc[key] = acc[key] ? [...acc[key], s] : [s];
    return acc;
  }, {});
}
