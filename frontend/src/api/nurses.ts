import { api } from "./client";
import { ApiUser } from "./types";

export async function listNurses(params?: { search?: string; ward?: string }) {
  const res = await api.get<{ nurses: ApiUser[] }>("/nurses", { params });
  return res.data.nurses;
}

export async function getNurse(id: string) {
  const res = await api.get<{ nurse: ApiUser }>(`/nurses/${id}`);
  return res.data.nurse;
}

export async function createNurse(input: { name: string; email: string; phone?: string; ward: string; password?: string }) {
  const res = await api.post<{ nurse: ApiUser }>("/nurses", input);
  return res.data.nurse;
}

export async function updateNurse(id: string, input: Partial<{ status: "ACTIVE" | "ON_LEAVE"; ward: string; phone: string }>) {
  const res = await api.patch<{ nurse: ApiUser }>(`/nurses/${id}`, input);
  return res.data.nurse;
}
