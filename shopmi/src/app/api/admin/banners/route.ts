import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllBannerConfigs } from "@/lib/banners";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configs = await getAllBannerConfigs();
    return NextResponse.json(configs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("GET /api/admin/banners error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
