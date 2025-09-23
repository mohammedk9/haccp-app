// src/types/user.ts
import { Role } from "@prisma/client";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};
