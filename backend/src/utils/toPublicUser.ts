import { User } from "@prisma/client";

export function toPublicUser(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}
