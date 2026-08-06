import { api } from "./client";
import { ApiLeaveRequest, LeaveStatus, LeaveType } from "./types";

export async function listLeave(status?: LeaveStatus) {
  const res = await api.get<{ requests: ApiLeaveRequest[] }>("/leave", {
    params: status ? { status } : undefined,
  });
  return res.data.requests;
}

export async function getLeave(id: string) {
  const res = await api.get<{ request: ApiLeaveRequest }>(`/leave/${id}`);
  return res.data.request;
}

export async function applyForLeave(input: { type: LeaveType; startDate: string; endDate: string; reason?: string }) {
  const res = await api.post<{ request: ApiLeaveRequest }>("/leave", input);
  return res.data.request;
}

export async function updateLeaveStatus(id: string, status: "APPROVED" | "REJECTED") {
  const res = await api.patch<{ request: ApiLeaveRequest }>(`/leave/${id}`, { status });
  return res.data.request;
}
