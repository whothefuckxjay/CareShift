import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { ALL_WARDS, requiredFor } from "../utils/coverage";

const router = Router();
router.use(requireAuth);

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay() + 1); // Monday
  return date;
}
function endOfWeek(d = new Date()) {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

// GET /api/shifts/me — the logged-in nurse's shifts for the current week
router.get("/me", async (req: AuthedRequest, res) => {
  const shifts = await prisma.shift.findMany({
    where: { nurseId: req.user!.id, date: { gte: startOfWeek(), lte: endOfWeek() } },
    orderBy: { date: "asc" },
  });
  res.json({ shifts });
});

// GET /api/shifts/:id
router.get("/:id", async (req: AuthedRequest, res) => {
  const shift = await prisma.shift.findUnique({ where: { id: req.params.id }, include: { nurse: true } });
  if (!shift) return res.status(404).json({ error: "Shift not found." });
  if (req.user!.role !== "HR" && shift.nurseId !== req.user!.id) {
    return res.status(403).json({ error: "You do not have permission to view this shift." });
  }
  res.json({
    shift: {
      id: shift.id,
      date: shift.date,
      type: shift.type,
      ward: shift.ward,
      startTime: shift.startTime,
      endTime: shift.endTime,
      nurse: { id: shift.nurse.id, name: shift.nurse.name },
    },
  });
});

// GET /api/shifts?start=YYYY-MM-DD&end=YYYY-MM-DD&nurseId=  — HR: any nurse; Nurse: only self
router.get("/", async (req: AuthedRequest, res) => {
  const start = req.query.start ? new Date(req.query.start as string) : startOfWeek();
  const end = req.query.end ? new Date(req.query.end as string) : endOfWeek();
  const nurseIdParam = req.query.nurseId as string | undefined;

  const nurseId = req.user!.role === "HR" ? nurseIdParam : req.user!.id;

  const shifts = await prisma.shift.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(nurseId ? { nurseId } : {}),
    },
    include: { nurse: { select: { id: true, name: true } } },
    orderBy: { date: "asc" },
  });
  res.json({ shifts });
});

// GET /api/shifts/coverage/week?start=YYYY-MM-DD  — HR only. Returns a 7-day x
// 3-shift grid of filled vs required headcount across all wards.
router.get("/coverage/week", requireRole("HR"), async (req, res) => {
  const start = req.query.start ? new Date(req.query.start as string) : startOfWeek();
  start.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const end = new Date(days[6]);
  end.setHours(23, 59, 59, 999);

  const shifts = await prisma.shift.findMany({
    where: { date: { gte: days[0], lte: end } },
  });

  const requiredPerShift = {
    MORNING: ALL_WARDS.reduce((s, w) => s + requiredFor(w, "MORNING"), 0),
    EVENING: ALL_WARDS.reduce((s, w) => s + requiredFor(w, "EVENING"), 0),
    NIGHT: ALL_WARDS.reduce((s, w) => s + requiredFor(w, "NIGHT"), 0),
  };

  const coverage = days.map((day) => {
    const dayStr = day.toISOString().split("T")[0];
    const dayShifts = shifts.filter((s) => s.date.toISOString().split("T")[0] === dayStr);
    const count = (type: "MORNING" | "EVENING" | "NIGHT") => dayShifts.filter((s) => s.type === type).length;
    return {
      date: dayStr,
      day: day.toLocaleDateString(undefined, { weekday: "short" }),
      morning: { filled: count("MORNING"), required: requiredPerShift.MORNING },
      evening: { filled: count("EVENING"), required: requiredPerShift.EVENING },
      night: { filled: count("NIGHT"), required: requiredPerShift.NIGHT },
    };
  });

  res.json({ coverage });
});

const createShiftSchema = z.object({
  nurseId: z.string().min(1),
  date: z.string().min(1), // YYYY-MM-DD
  type: z.enum(["MORNING", "EVENING", "NIGHT"]),
  ward: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

// POST /api/shifts  — HR only, assign a shift to a nurse
router.post("/", requireRole("HR"), async (req, res) => {
  const parsed = createShiftSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input." });
  }
  const { nurseId, date, type, ward, startTime, endTime } = parsed.data;
  const shift = await prisma.shift.create({
    data: { nurseId, date: new Date(date), type, ward, startTime, endTime },
  });
  res.status(201).json({ shift });
});

// DELETE /api/shifts/:id — HR only
router.delete("/:id", requireRole("HR"), async (req, res) => {
  await prisma.shift.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
