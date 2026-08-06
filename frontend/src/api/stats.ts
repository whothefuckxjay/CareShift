import { api } from "./client";
import { HRStats } from "./types";

export async function getHRStats() {
  const res = await api.get<HRStats>("/stats/hr");
  return res.data;
}
