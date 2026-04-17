import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getBannerConfig, updateBannerConfig } from "@/lib/banners";
import type { BannerSlug, BannerConfigData } from "@/types/banner";

export const dynamic = "force-dynamic";

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
  try {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("GET /api/admin/banners/[slug] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    try {
      revalidatePath("/");
      revalidatePath("/api/banners");
      revalidatePath(`/api/banners/${slug}`);
    } catch (e) {
      console.warn("revalidatePath falhou (ok em dev):", e);
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PUT /api/admin/banners/[slug] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
