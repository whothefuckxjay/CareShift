import { api } from "./client";
import { ApiMessage, MessageThread } from "./types";

export async function listThreads() {
  const res = await api.get<{ threads: MessageThread[] }>("/messages/threads");
  return res.data.threads;
}

export async function getThread(userId: string) {
  const res = await api.get<{ messages: ApiMessage[] }>(`/messages/thread/${userId}`);
  return res.data.messages;
}

export async function sendMessage(recipientId: string, body: string) {
  const res = await api.post<{ message: ApiMessage }>("/messages", { recipientId, body });
  return res.data.message;
}

export async function markThreadRead(userId: string) {
  await api.patch(`/messages/thread/${userId}/read`);
}

export async function deleteMessage(id: string) {
  await api.delete(`/messages/${id}`);
}
