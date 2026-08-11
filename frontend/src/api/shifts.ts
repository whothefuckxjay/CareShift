import { api } from "./client";
import { ApiShift, DayCoverage, GenerateScheduleResult, ShiftType } from "./types";

export async function getMyShifts() {
  const res = await api.get<{ shifts: ApiShift[] }>("/shifts/me");
  return res.data.shifts;
}

export async function getShift(id: string) {
  const res = await api.get<{ shift: ApiShift }>(`/shifts/${id}`);
  return res.data.shift;
}

export async function getShiftsInRange(params: { start: string; end: string; nurseId?: string }) {
  const res = await api.get<{ shifts: ApiShift[] }>("/shifts", { params });
  return res.data.shifts;
}

export async function getWeekCoverage(start?: string) {
  const res = await api.get<{ coverage: DayCoverage[] }>("/shifts/coverage/week", {
    params: start ? { start } : undefined,
  });
  return res.data.coverage;
}

export async function createShift(input: {
  nurseId: string;
  date: string;
  type: ShiftType;
  ward: string;
  startTime: string;
  endTime: string;
}) {
  const res = await api.post<{ shift: ApiShift }>("/shifts", input);
  return res.data.shift;
}

export async function deleteShift(id: string) {
  await api.delete(`/shifts/${id}`);
}

export async function generateSchedule() {
  const res = await api.post<GenerateScheduleResult>("/shifts/generate");
  return res.data;
}
