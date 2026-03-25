import { NextRequest, NextResponse } from "next/server";
import { getBannerConfig } from "@/lib/banners";
import type { BannerSlug } from "@/types/banner";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const config = await getBannerConfig(slug as BannerSlug);

  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
