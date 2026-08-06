import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";

export type AuthedRequest = Request & {
  user?: { id: string; role: "NURSE" | "HR" };
};

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: "User no longer exists." });
    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireRole(...roles: Array<"NURSE" | "HR">) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to do this." });
    }
    next();
  };
}
