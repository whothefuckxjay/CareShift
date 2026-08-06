import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-me";

export type TokenPayload = {
  userId: string;
  role: "NURSE" | "HR";
};

export function signToken(payload: TokenPayload): string {
  // 30-day expiry — this is a simple/demo auth setup, not a hardened session
  // scheme (no refresh tokens, no rotation).
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}
