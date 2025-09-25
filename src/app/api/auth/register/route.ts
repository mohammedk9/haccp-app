import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "../controllers/authController";

export async function POST(req: NextRequest) {
  return await registerUser(req);
}
