import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { emitToUser } from "../socket";

const router = Router();
router.use(requireAuth);

const userSelect = { id: true, name: true, avatar: true, role: true } as const;

// GET /api/messages/threads — conversations for the current user, newest first.
router.get("/threads", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    include: { sender: { select: userSelect }, recipient: { select: userSelect } },
    orderBy: { createdAt: "desc" },
  });

  const threads = new Map<string, { user: typeof messages[number]["sender"]; lastMessage: (typeof messages)[number]; unreadCount: number }>();
  for (const message of messages) {
    const other = message.senderId === userId ? message.recipient : message.sender;
    const existing = threads.get(other.id);
    const isUnreadForMe = message.recipientId === userId && !message.read;
    if (!existing) {
      threads.set(other.id, { user: other, lastMessage: message, unreadCount: isUnreadForMe ? 1 : 0 });
    } else if (isUnreadForMe) {
      existing.unreadCount += 1;
    }
  }

  res.json({ threads: Array.from(threads.values()) });
});

// GET /api/messages/thread/:userId — full message history with one other user.
router.get("/thread/:userId", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const otherId = req.params.userId;
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherId },
        { senderId: otherId, recipientId: userId },
      ],
    },
    include: { sender: { select: userSelect } },
    orderBy: { createdAt: "asc" },
  });
  res.json({ messages });
});

const sendMessageSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().trim().min(1, "Message can't be empty."),
});

// POST /api/messages — send a message.
router.post("/", async (req: AuthedRequest, res) => {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input." });
  }
  const { recipientId, body } = parsed.data;

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) return res.status(404).json({ error: "Recipient not found." });

  const message = await prisma.message.create({
    data: { senderId: req.user!.id, recipientId, body },
    include: { sender: { select: userSelect } },
  });

  emitToUser(recipientId, "message:new", message);
  res.status(201).json({ message });
});

// PATCH /api/messages/thread/:userId/read — mark all messages from :userId as read.
router.patch("/thread/:userId/read", async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const otherId = req.params.userId;
  await prisma.message.updateMany({
    where: { senderId: otherId, recipientId: userId, read: false },
    data: { read: true },
  });
  emitToUser(otherId, "message:read", { by: userId });
  res.json({ ok: true });
});

// DELETE /api/messages/:id
router.delete("/:id", async (req: AuthedRequest, res) => {
  const message = await prisma.message.findUnique({ where: { id: req.params.id } });
  if (!message) return res.status(404).json({ error: "Message not found." });
  if (message.senderId !== req.user!.id && message.recipientId !== req.user!.id) {
    return res.status(403).json({ error: "You do not have permission to delete this message." });
  }
  await prisma.message.delete({ where: { id: message.id } });
  emitToUser(message.senderId, "message:deleted", { id: message.id });
  emitToUser(message.recipientId, "message:deleted", { id: message.id });
  res.json({ ok: true });
});

export default router;
