import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { email: true, role: true, name: true },
    });
    return NextResponse.json({
      ok: true,
      userCount,
      adminUser,
      dbUrl: process.env.DATABASE_URL?.slice(0, 50) + "...",
      nodeEnv: process.env.NODE_ENV,
      netlify: process.env.NETLIFY,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
