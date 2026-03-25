import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllBannerConfigs } from "@/lib/banners";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configs = await getAllBannerConfigs();
  return NextResponse.json(configs);
}
