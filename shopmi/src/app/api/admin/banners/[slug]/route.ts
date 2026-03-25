import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBannerConfig, updateBannerConfig } from "@/lib/banners";
import type { BannerSlug, BannerConfigData } from "@/types/banner";

const VALID_SLUGS: BannerSlug[] = [
  "hero",
  "collection-banners",
  "contemporary-banner",
  "video-banner",
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug as BannerSlug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const config = await getBannerConfig(slug as BannerSlug);
  if (!config) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(config);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug as BannerSlug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const body = await req.json();
  const config = body.config as BannerConfigData;

  if (!config) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  const updated = await updateBannerConfig(
    slug as BannerSlug,
    config,
    session.user.email
  );

  return NextResponse.json(updated);
}
