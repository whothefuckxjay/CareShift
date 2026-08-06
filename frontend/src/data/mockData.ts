export type Shift = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  day: string;
  dateLabel: string;
  start: string;
  end: string;
  label: "Morning Shift" | "Evening Shift" | "Night Shift" | "No Shift Assigned";
  ward: string;
  color: string;
  isToday?: boolean;
};

export type LeaveRequest = {
  id: string;
  type: "Annual Leave" | "Personal Leave" | "Sick Leave";
  range: string;
  status: "Approved" | "Pending" | "Rejected";
  note: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: "shift" | "leave" | "system";
};

export const nurseProfile = {
  name: "Sarah Johnson",
  role: "Staff Nurse",
  department: "Medical Ward",
  email: "sarah.johnson@hospital.com",
  phone: "+1 234 567 890",
  dateOfBirth: "12 March 1992",
  employeeId: "NUR12567",
  avatar: "https://i.pravatar.cc/300?img=47",
};

export const weekSchedule: Shift[] = [
  { id: "1", day: "Mon", dateLabel: "12 May", date: "2025-05-12", start: "7:00 AM", end: "3:00 PM", label: "Morning Shift", ward: "Medical Ward", color: "success", isToday: true },
  { id: "2", day: "Tue", dateLabel: "13 May", date: "2025-05-13", start: "3:00 PM", end: "11:00 PM", label: "Evening Shift", ward: "Surgical Ward", color: "info" },
  { id: "3", day: "Wed", dateLabel: "14 May", date: "2025-05-14", start: "7:00 AM", end: "3:00 PM", label: "Morning Shift", ward: "Medical Ward", color: "success" },
  { id: "4", day: "Thu", dateLabel: "15 May", date: "2025-05-15", start: "11:00 PM", end: "7:00 AM", label: "Night Shift", ward: "ICU", color: "primary" },
  { id: "5", day: "Fri", dateLabel: "16 May", date: "2025-05-16", start: "7:00 AM", end: "3:00 PM", label: "Morning Shift", ward: "Medical Ward", color: "success" },
  { id: "6", day: "Sat", dateLabel: "17 May", date: "2025-05-17", start: "-", end: "", label: "No Shift Assigned", ward: "-", color: "muted" },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "l1", type: "Annual Leave", range: "24 May - 26 May 2025", status: "Approved", note: "Approved on 30 Apr 2025" },
  { id: "l2", type: "Personal Leave", range: "10 May 2025", status: "Pending", note: "Applied on 2 May 2025" },
  { id: "l3", type: "Sick Leave", range: "5 Apr - 6 Apr 2025", status: "Rejected", note: "Rejected on 1 Apr 2025" },
];

export const notifications: AppNotification[] = [];

export const leaveBalance = { used: 8, total: 20, remaining: 12 };

export const weeklyHoursData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  data: [8, 8, 8, 8, 8, 0, 0],
};

export const shiftDistribution = [
  { name: "Morning", value: 3, color: "#1FA971" },
  { name: "Evening", value: 1, color: "#3B82F6" },
  { name: "Night", value: 1, color: "#6D5DF4" },
  { name: "Off", value: 2, color: "#E24C6D" },
];

export const availabilityDefault = {
  Mon: { morning: true, evening: true, night: false },
  Tue: { morning: false, evening: true, night: false },
  Wed: { morning: true, evening: false, night: false },
  Thu: { morning: false, evening: false, night: false },
  Fri: { morning: true, evening: true, night: true },
  Sat: { morning: false, evening: false, night: false },
  Sun: { morning: false, evening: false, night: false },
};

// ---------- HR Manager Portal data ----------

export const hrProfile = {
  name: "Victoria Mensah",
  role: "HR Manager",
  department: "Human Resources",
  email: "victoria.mensah@hospital.com",
  phone: "+1 234 567 999",
  dateOfBirth: "4 July 1988",
  employeeId: "HR00231",
  avatar: "https://i.pravatar.cc/300?img=32",
};

export type StaffNurse = {
  id: string;
  name: string;
  avatar: string;
  ward: string;
  status: "Active" | "On Leave";
  shiftsThisWeek: number;
  email: string;
  phone: string;
};

export const staffNurses: StaffNurse[] = [
  { id: "n1", name: "Sarah Johnson", avatar: "https://i.pravatar.cc/300?img=47", ward: "Medical Ward", status: "Active", shiftsThisWeek: 5, email: "sarah.johnson@hospital.com", phone: "+1 234 567 890" },
  { id: "n2", name: "Abena Owusu", avatar: "https://i.pravatar.cc/300?img=44", ward: "Medical Ward", status: "On Leave", shiftsThisWeek: 0, email: "abena.owusu@hospital.com", phone: "+1 234 567 801" },
  { id: "n3", name: "Grace Asante", avatar: "https://i.pravatar.cc/300?img=45", ward: "Surgical Ward", status: "Active", shiftsThisWeek: 4, email: "grace.asante@hospital.com", phone: "+1 234 567 802" },
  { id: "n4", name: "Linda Addo", avatar: "https://i.pravatar.cc/300?img=48", ward: "ICU", status: "On Leave", shiftsThisWeek: 0, email: "linda.addo@hospital.com", phone: "+1 234 567 803" },
  { id: "n5", name: "Patricia Boateng", avatar: "https://i.pravatar.cc/300?img=49", ward: "Medical Ward", status: "Active", shiftsThisWeek: 5, email: "patricia.boateng@hospital.com", phone: "+1 234 567 804" },
  { id: "n6", name: "Kwame Mensah", avatar: "https://i.pravatar.cc/300?img=12", ward: "ICU", status: "Active", shiftsThisWeek: 5, email: "kwame.mensah@hospital.com", phone: "+1 234 567 805" },
  { id: "n7", name: "Efua Danso", avatar: "https://i.pravatar.cc/300?img=25", ward: "Surgical Ward", status: "Active", shiftsThisWeek: 3, email: "efua.danso@hospital.com", phone: "+1 234 567 806" },
  { id: "n8", name: "Kojo Antwi", avatar: "https://i.pravatar.cc/300?img=14", ward: "Emergency", status: "Active", shiftsThisWeek: 5, email: "kojo.antwi@hospital.com", phone: "+1 234 567 807" },
];

export type HRLeaveRequest = {
  id: string;
  nurseId: string;
  nurseName: string;
  avatar: string;
  ward: string;
  type: "Annual Leave" | "Personal Leave" | "Sick Leave";
  range: string;
  status: "Pending" | "Approved" | "Rejected";
};

export const hrLeaveRequests: HRLeaveRequest[] = [
  { id: "hl1", nurseId: "n2", nurseName: "Abena Owusu", avatar: "https://i.pravatar.cc/300?img=44", ward: "Medical Ward", type: "Annual Leave", range: "20 - 22 May 2025", status: "Pending" },
  { id: "hl2", nurseId: "n3", nurseName: "Grace Asante", avatar: "https://i.pravatar.cc/300?img=45", ward: "Surgical Ward", type: "Personal Leave", range: "23 May 2025", status: "Pending" },
  { id: "hl3", nurseId: "n4", nurseName: "Linda Addo", avatar: "https://i.pravatar.cc/300?img=48", ward: "ICU", type: "Sick Leave", range: "26 - 28 May 2025", status: "Pending" },
  { id: "hl4", nurseId: "n5", nurseName: "Patricia Boateng", avatar: "https://i.pravatar.cc/300?img=49", ward: "Medical Ward", type: "Personal Leave", range: "30 May 2025", status: "Pending" },
  { id: "hl5", nurseId: "n1", nurseName: "Sarah Johnson", avatar: "https://i.pravatar.cc/300?img=47", ward: "Medical Ward", type: "Annual Leave", range: "24 - 26 May 2025", status: "Approved" },
  { id: "hl6", nurseId: "n7", nurseName: "Efua Danso", avatar: "https://i.pravatar.cc/300?img=25", ward: "Surgical Ward", type: "Sick Leave", range: "5 - 6 Apr 2025", status: "Rejected" },
];

export type ShiftCoverage = {
  day: string;
  dateLabel: string;
  morning: { filled: number; required: number };
  evening: { filled: number; required: number };
  night: { filled: number; required: number };
};

export const weekCoverage: ShiftCoverage[] = [
  { day: "Mon", dateLabel: "12 May", morning: { filled: 28, required: 30 }, evening: { filled: 25, required: 25 }, night: { filled: 18, required: 20 } },
  { day: "Tue", dateLabel: "13 May", morning: { filled: 30, required: 30 }, evening: { filled: 25, required: 25 }, night: { filled: 19, required: 20 } },
  { day: "Wed", dateLabel: "14 May", morning: { filled: 29, required: 30 }, evening: { filled: 24, required: 25 }, night: { filled: 17, required: 20 } },
  { day: "Thu", dateLabel: "15 May", morning: { filled: 30, required: 30 }, evening: { filled: 25, required: 25 }, night: { filled: 20, required: 20 } },
  { day: "Fri", dateLabel: "16 May", morning: { filled: 28, required: 30 }, evening: { filled: 25, required: 25 }, night: { filled: 18, required: 20 } },
  { day: "Sat", dateLabel: "17 May", morning: { filled: 26, required: 30 }, evening: { filled: 22, required: 25 }, night: { filled: 15, required: 20 } },
  { day: "Sun", dateLabel: "18 May", morning: { filled: 22, required: 30 }, evening: { filled: 20, required: 25 }, night: { filled: 14, required: 20 } },
];

export const coverageBreakdown = {
  fullyCoveredPct: 72,
  fullyCoveredShifts: 52,
  partiallyCoveredPct: 18,
  partiallyCoveredShifts: 13,
  understaffedPct: 10,
  understaffedShifts: 7,
  overallCoverage: 92,
};

export const understaffedShifts = [
  { id: "u1", date: "12 May", label: "Night Shift (11:00 PM - 7:00 AM)", ward: "ICU", filled: 2, required: 20 },
  { id: "u2", date: "13 May", label: "Evening Shift (3:00 PM - 11:00 PM)", ward: "Surgical Ward", filled: 3, required: 25 },
  { id: "u3", date: "14 May", label: "Morning Shift (7:00 AM - 3:00 PM)", ward: "Medical Ward", filled: 2, required: 30 },
];

export const hrStats = {
  totalNurses: 128,
  activeNurses: 121,
  todaysShifts: 24,
  coverageRate: 92,
  pendingLeaves: hrLeaveRequests.filter((l) => l.status === "Pending").length,
  understaffedShiftsCount: understaffedShifts.length,
};

export type ReportItem = {
  id: string;
  title: string;
  description: string;
  lastGenerated: string;
};

export const reportsList: ReportItem[] = [
  { id: "r1", title: "Attendance Summary", description: "Clock-in/out trends across all wards", lastGenerated: "2 May 2025" },
  { id: "r2", title: "Overtime Report", description: "Overtime hours by nurse and department", lastGenerated: "1 May 2025" },
  { id: "r3", title: "Leave Summary", description: "Approved, pending and rejected leave totals", lastGenerated: "28 Apr 2025" },
  { id: "r4", title: "Coverage Report", description: "Shift coverage rate by ward and week", lastGenerated: "27 Apr 2025" },
];
