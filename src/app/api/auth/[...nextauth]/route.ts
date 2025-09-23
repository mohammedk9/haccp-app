// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // تأكد أن lib/auth.ts فيه export صحيح

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
