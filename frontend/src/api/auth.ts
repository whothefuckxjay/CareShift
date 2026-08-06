import { api } from "./client";
import { ApiUser, Role } from "./types";

export async function login(email: string, password: string) {
  const res = await api.post<{ token: string; user: ApiUser }>("/auth/login", { email, password });
  return res.data;
}

export async function register(name: string, email: string, password: string, role: Role, ward?: string) {
  const res = await api.post<{ token: string; user: ApiUser }>("/auth/register", {
    name,
    email,
    password,
    role,
    ward,
  });
  return res.data;
}

export async function me() {
  const res = await api.get<{ user: ApiUser }>("/auth/me");
  return res.data.user;
}
