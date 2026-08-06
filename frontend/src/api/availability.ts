import { api } from "./client";
import { WeeklyAvailability } from "./types";

export async function getMyAvailability() {
  const res = await api.get<{ data: WeeklyAvailability }>("/availability/me");
  return res.data.data;
}

export async function saveMyAvailability(data: WeeklyAvailability) {
  const res = await api.put<{ data: WeeklyAvailability }>("/availability/me", { data });
  return res.data.data;
}
