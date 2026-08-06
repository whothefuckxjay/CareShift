import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { ALL_WARDS, requiredFor } from "../utils/coverage";

const router = Router();
router.use(requireAuth, requireRole("HR"));

// GET /api/stats/hr — powers the HR Dashboard in a single call
router.get("/hr", async (_req, res) => {
  const totalNurses = await prisma.user.count({ where: { role: "NURSE" } });
  const activeNurses = await prisma.user.count({ where: { role: "NURSE", status: "ACTIVE" } });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todaysShifts = await prisma.shift.count({ where: { date: { gte: todayStart, lte: todayEnd } } });

  const requiredToday = ["MORNING", "EVENING", "NIGHT"].reduce(
    (sum, type) => sum + ALL_WARDS.reduce((s, w) => s + requiredFor(w, type as any), 0),
    0
  );
  const coverageRate = requiredToday > 0 ? Math.min(100, Math.round((todaysShifts / requiredToday) * 100)) : 0;

  const pendingLeaves = await prisma.leaveRequest.count({ where: { status: "PENDING" } });

  const pendingRequests = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { nurse: { select: { id: true, name: true, avatar: true, ward: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  res.json({
    totalNurses,
    activeNurses,
    todaysShifts,
    coverageRate,
    pendingLeaves,
    pendingRequests,
  });
});

export default router;
