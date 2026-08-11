import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { toPublicUser } from "../utils/toPublicUser";

const router = Router();
router.use(requireAuth);

// GET /api/nurses?search=&ward=   (HR only)
router.get("/", requireRole("HR"), async (req, res) => {
  const search = (req.query.search as string) ?? "";
  const ward = (req.query.ward as string) ?? "";

  const nurses = await prisma.user.findMany({
    where: {
      role: "NURSE",
      name: { contains: search, mode: "insensitive" },
      ...(ward && ward !== "All" ? { ward } : {}),
    },
    orderBy: { name: "asc" },
  });

  const withShiftCounts = await Promise.all(
    nurses.map(async (n) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const shiftsThisWeek = await prisma.shift.count({
        where: { nurseId: n.id, date: { gte: weekStart } },
      });
      return { ...toPublicUser(n), shiftsThisWeek };
    })
  );

  res.json({ nurses: withShiftCounts });
});

// GET /api/nurses/:id   (HR, or the nurse viewing themself)
router.get("/:id", async (req: AuthedRequest, res) => {
  const { id } = req.params;
  if (req.user!.role !== "HR" && req.user!.id !== id) {
    return res.status(403).json({ error: "You do not have permission to view this nurse." });
  }
  const nurse = await prisma.user.findUnique({ where: { id } });
  if (!nurse || nurse.role !== "NURSE") return res.status(404).json({ error: "Nurse not found." });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const shiftsThisWeek = await prisma.shift.count({ where: { nurseId: id, date: { gte: weekStart } } });

  res.json({ nurse: { ...toPublicUser(nurse), shiftsThisWeek } });
});

const createNurseSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  ward: z.string().min(1),
  password: z.string().min(4).optional(),
});

// POST /api/nurses   (HR only) — add a new nurse
router.post("/", requireRole("HR"), async (req, res) => {
  const parsed = createNurseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input." });
  }
  const { name, email, phone, ward, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "A nurse with this email already exists." });

  const passwordHash = await bcrypt.hash(password ?? "welcome1", 10);
  const nurse = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      ward,
      passwordHash,
      role: "NURSE",
      avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
    },
  });

  res.status(201).json({ nurse: toPublicUser(nurse) });
});

// DELETE /api/nurses/:id   (HR only) — remove a nurse and everything tied to them.
// Deletes related records sequentially (not in a transaction) in a fixed order —
// shifts, leave requests, availability, messages — before the user row itself,
// so no delete ever runs against a row still referenced by a foreign key.
router.delete("/:id", requireRole("HR"), async (req, res) => {
  const { id } = req.params;
  const nurse = await prisma.user.findUnique({ where: { id } });
  if (!nurse || nurse.role !== "NURSE") return res.status(404).json({ error: "Nurse not found." });

  await prisma.shift.deleteMany({ where: { nurseId: id } });
  await prisma.leaveRequest.deleteMany({ where: { nurseId: id } });
  await prisma.availability.deleteMany({ where: { nurseId: id } });
  await prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { recipientId: id }] } });
  await prisma.user.delete({ where: { id } });

  res.json({ ok: true });
});

const updateNurseSchema = z.object({
  status: z.enum(["ACTIVE", "ON_LEAVE"]).optional(),
  ward: z.string().optional(),
  phone: z.string().optional(),
});

// PATCH /api/nurses/:id   (HR only)
router.patch("/:id", requireRole("HR"), async (req, res) => {
  const parsed = updateNurseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }
  const nurse = await prisma.user.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ nurse: toPublicUser(nurse) });
});

export default router;
