import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const DEFAULT_AVAILABILITY = {
  Mon: { morning: false, evening: false, night: false },
  Tue: { morning: false, evening: false, night: false },
  Wed: { morning: false, evening: false, night: false },
  Thu: { morning: false, evening: false, night: false },
  Fri: { morning: false, evening: false, night: false },
  Sat: { morning: false, evening: false, night: false },
  Sun: { morning: false, evening: false, night: false },
};

// GET /api/availability/me
router.get("/me", async (req: AuthedRequest, res) => {
  const record = await prisma.availability.findUnique({ where: { nurseId: req.user!.id } });
  res.json({ data: record?.data ?? DEFAULT_AVAILABILITY });
});

const dayShape = z.object({ morning: z.boolean(), evening: z.boolean(), night: z.boolean() });
const availabilitySchema = z.object({
  data: z.object({
    Mon: dayShape,
    Tue: dayShape,
    Wed: dayShape,
    Thu: dayShape,
    Fri: dayShape,
    Sat: dayShape,
    Sun: dayShape,
  }),
});

// PUT /api/availability/me
router.put("/me", async (req: AuthedRequest, res) => {
  const parsed = availabilitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid availability payload." });
  }
  const record = await prisma.availability.upsert({
    where: { nurseId: req.user!.id },
    update: { data: parsed.data.data },
    create: { nurseId: req.user!.id, data: parsed.data.data },
  });
  res.json({ data: record.data });
});

export default router;
