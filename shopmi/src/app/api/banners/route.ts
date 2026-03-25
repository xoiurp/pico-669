import { NextResponse } from "next/server";
import { getAllBannerConfigs } from "@/lib/banners";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configs = await getAllBannerConfigs();
    return NextResponse.json(configs, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json([], {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }
}
