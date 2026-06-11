import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "التسجيل الذاتي متوقف حاليًا. يُرجى التواصل مع الإدارة." },
    { status: 403 }
  );
}