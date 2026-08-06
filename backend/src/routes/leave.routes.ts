import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/leave?status=PENDING  — Nurse: own requests. HR: everyone's.
router.get("/", async (req: AuthedRequest, res) => {
  const status = req.query.status as "PENDING" | "APPROVED" | "REJECTED" | undefined;
  const requests = await prisma.leaveRequest.findMany({
    where: {
      ...(req.user!.role === "NURSE" ? { nurseId: req.user!.id } : {}),
      ...(status ? { status } : {}),
    },
    include: { nurse: { select: { id: true, name: true, avatar: true, ward: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ requests });
});

// GET /api/leave/:id
router.get("/:id", async (req: AuthedRequest, res) => {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: req.params.id },
    include: { nurse: { select: { id: true, name: true, avatar: true, ward: true } } },
  });
  if (!request) return res.status(404).json({ error: "Leave request not found." });
  if (req.user!.role !== "HR" && request.nurseId !== req.user!.id) {
    return res.status(403).json({ error: "You do not have permission to view this request." });
  }
  res.json({ request });
});

const createLeaveSchema = z.object({
  type: z.enum(["ANNUAL", "PERSONAL", "SICK", "EMERGENCY"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().optional(),
});

// POST /api/leave  — nurse applies for leave
router.post("/", async (req: AuthedRequest, res) => {
  if (req.user!.role !== "NURSE") {
    return res.status(403).json({ error: "Only nurses can submit a leave request." });
  }
  const parsed = createLeaveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input." });
  }
  const { type, startDate, endDate, reason } = parsed.data;
  const request = await prisma.leaveRequest.create({
    data: {
      nurseId: req.user!.id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });
  res.status(201).json({ request });
});

const updateStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

// PATCH /api/leave/:id  — HR approves/rejects
router.patch("/:id", requireRole("HR"), async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Status must be APPROVED or REJECTED." });
  }
  const request = await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
    include: { nurse: { select: { id: true, name: true, avatar: true, ward: true } } },
  });
  res.json({ request });
});

export default router;
