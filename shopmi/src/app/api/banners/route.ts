import { NextResponse } from "next/server";
import { getAllBannerConfigs } from "@/lib/banners";

export async function GET() {
  const configs = await getAllBannerConfigs();

  return NextResponse.json(configs, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
