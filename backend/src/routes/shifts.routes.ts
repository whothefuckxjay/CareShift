import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { ALL_WARDS, requiredFor } from "../utils/coverage";

type ShiftTypeKey = "MORNING" | "EVENING" | "NIGHT";

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const SHIFT_TYPES: ShiftTypeKey[] = ["MORNING", "EVENING", "NIGHT"];
const SHIFT_TIME: Record<ShiftTypeKey, { startTime: string; endTime: string }> = {
  MORNING: { startTime: "07:00", endTime: "15:00" },
  EVENING: { startTime: "15:00", endTime: "23:00" },
  NIGHT: { startTime: "23:00", endTime: "07:00" },
};
const AVAILABILITY_KEY: Record<ShiftTypeKey, "morning" | "evening" | "night"> = {
  MORNING: "morning",
  EVENING: "evening",
  NIGHT: "night",
};

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

// POST /api/shifts/generate?week=next|this — HR only. Fills remaining gaps
// in a week's schedule (next week by default) from nurses' saved
// availability and each ward's required headcount. Existing shifts for the
// week are left untouched — this only adds shifts for slots that are still
// short, so it's safe to re-run.
router.post("/generate", requireRole("HR"), async (req, res) => {
  const targetWeek = req.query.week === "this" ? "this" : "next";
  const weekStart = startOfWeek();
  if (targetWeek === "next") weekStart.setDate(weekStart.getDate() + 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const [nurses, availabilities, leaveRequests, existingShifts] = await Promise.all([
    prisma.user.findMany({ where: { role: "NURSE", status: "ACTIVE" } }),
    prisma.availability.findMany(),
    prisma.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { lte: weekEnd }, endDate: { gte: weekStart } },
    }),
    prisma.shift.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
  ]);

  const availabilityByNurse = new Map(availabilities.map((a) => [a.nurseId, a.data as any]));
  const isOnLeave = (nurseId: string, date: Date) =>
    leaveRequests.some((lr) => lr.nurseId === nurseId && date >= lr.startDate && date <= lr.endDate);

  const assignedDatesByNurse = new Map<string, Set<string>>();
  const shiftCountByNurse = new Map<string, number>();
  for (const nurse of nurses) {
    assignedDatesByNurse.set(nurse.id, new Set());
    shiftCountByNurse.set(nurse.id, 0);
  }

  const filledCount = new Map<string, number>(); // key: `${ward}|${dateStr}|${type}`
  for (const shift of existingShifts) {
    const dateStr = shift.date.toISOString().split("T")[0];
    const key = `${shift.ward}|${dateStr}|${shift.type}`;
    filledCount.set(key, (filledCount.get(key) ?? 0) + 1);
    assignedDatesByNurse.get(shift.nurseId)?.add(dateStr);
    shiftCountByNurse.set(shift.nurseId, (shiftCountByNurse.get(shift.nurseId) ?? 0) + 1);
  }

  const newShifts: { nurseId: string; date: Date; type: ShiftTypeKey; ward: string; startTime: string; endTime: string }[] = [];
  const shortfalls: { ward: string; date: string; day: string; type: ShiftTypeKey; required: number; filled: number }[] = [];
  let totalRequired = 0;

  for (const day of days) {
    const dateStr = day.toISOString().split("T")[0];
    const dayKey = DAY_KEYS[day.getDay()];
    const dayLabel = day.toLocaleDateString(undefined, { weekday: "short" });

    for (const type of SHIFT_TYPES) {
      const availKey = AVAILABILITY_KEY[type];

      // Process the ward with the largest current shortfall first, so
      // cross-ward floaters go to the neediest ward.
      const wardsByNeed = [...ALL_WARDS].sort((a, b) => {
        const need = (w: string) => requiredFor(w, type) - (filledCount.get(`${w}|${dateStr}|${type}`) ?? 0);
        return need(b) - need(a);
      });

      for (const ward of wardsByNeed) {
        const required = requiredFor(ward, type);
        totalRequired += required;
        const key = `${ward}|${dateStr}|${type}`;
        let filled = filledCount.get(key) ?? 0;
        const needed = Math.max(0, required - filled);
        if (needed === 0) continue;

        const candidates = nurses
          .filter((n) => {
            if (assignedDatesByNurse.get(n.id)?.has(dateStr)) return false;
            if (isOnLeave(n.id, day)) return false;
            const avail = availabilityByNurse.get(n.id);
            return Boolean(avail?.[dayKey]?.[availKey]);
          })
          .sort((a, b) => {
            const aHome = a.ward === ward ? 0 : 1;
            const bHome = b.ward === ward ? 0 : 1;
            if (aHome !== bHome) return aHome - bHome;
            const aCount = shiftCountByNurse.get(a.id) ?? 0;
            const bCount = shiftCountByNurse.get(b.id) ?? 0;
            if (aCount !== bCount) return aCount - bCount;
            return a.name.localeCompare(b.name);
          });

        for (const nurse of candidates.slice(0, needed)) {
          newShifts.push({ nurseId: nurse.id, date: day, type, ward, ...SHIFT_TIME[type] });
          assignedDatesByNurse.get(nurse.id)?.add(dateStr);
          shiftCountByNurse.set(nurse.id, (shiftCountByNurse.get(nurse.id) ?? 0) + 1);
          filled += 1;
        }
        filledCount.set(key, filled);

        if (filled < required) {
          shortfalls.push({ ward, date: dateStr, day: dayLabel, type, required, filled });
        }
      }
    }
  }

  if (newShifts.length > 0) {
    await prisma.shift.createMany({ data: newShifts });
  }

  const totalShortfall = shortfalls.reduce((sum, s) => sum + (s.required - s.filled), 0);

  res.json({
    created: newShifts.length,
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: weekEnd.toISOString().split("T")[0],
    totalRequired,
    totalFilled: totalRequired - totalShortfall,
    shortfalls,
  });
});

export default router;
