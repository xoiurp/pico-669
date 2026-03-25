import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { upsertBannerConfig } from "@/lib/banners";
import type {
  HeroBannerConfig,
  CollectionBannersConfig,
  ContemporaryBannerConfig,
  VideoBannerConfig,
} from "@/types/banner";

const heroConfig: HeroBannerConfig = {
  backgroundImage: "/assets/images/banner-hero-section 1.webp",
  overlayGradient: "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.1), transparent)",
  title: "SALE ATÉ 50% OFF",
  titleFontSize: "72",
  subtitle: "FRETE GRÁTIS EM COMPRAS ACIMA DE R$500\n6X SEM JUROS",
  subtitleFontSize: "16",
  button: {
    text: "Descubra mais",
    link: "/shop",
    bgColor: "transparent",
    textColor: "#ffffff",
    borderColor: "#ffffff",
    style: "outline",
    fontSize: "12",
  },
};

const collectionBannersConfig: CollectionBannersConfig = {
  sections: [
    {
      leftImage: "/assets/images/CASSIOANDREASI-4.jpg 1.webp",
      rightImage: "/assets/images/CASSIOANDREASI-13 .jpg 1.webp",
      leftOverlayOpacity: 20,
      rightOverlayOpacity: 10,
      title: "New Drop Class",
      titleFontSize: "48",
      buttonText: "Shop",
      buttonLink: "/shop",
      buttonFontSize: "12",
    },
    {
      leftImage: "/assets/images/CASSIOANDREASI-27.jpg 1.webp",
      rightImage: "/assets/images/CASSIOANDREASI-47.jpg 1.webp",
      leftOverlayOpacity: 20,
      rightOverlayOpacity: 10,
      title: "FALL '26 collection DROP1",
      titleFontSize: "48",
      buttonText: "Shop",
      buttonLink: "/shop",
      buttonFontSize: "12",
    },
  ],
};

const contemporaryBannerConfig: ContemporaryBannerConfig = {
  leftImage: "/assets/images/IMG_9906 1.webp",
  rightImage: "/assets/images/IMG_9908 1.webp",
  leftOverlayOpacity: 20,
  rightOverlayOpacity: 10,
  title: "New Drop Singapura Disponível",
  titleFontSize: "48",
  mobileTitleFontSize: "20",
  buttonText: "Shop",
  buttonLink: "/shop",
  buttonFontSize: "12",
  mobileButtonFontSize: "14",
};

const videoBannerConfig: VideoBannerConfig = {
  videoUrl: "https://cdn.shopify.com/videos/c/o/v/23161f90de4d40578eed3144dc5cf372.mp4",
  overlayOpacity: 20,
  tagline: "Nova temporada",
  taglineFontSize: "10",
  title: "Transforme seu estilo nesta estação",
  titleItalicWord: "estilo",
  titleFontSize: "60",
  primaryButton: {
    text: "Comprar agora",
    link: "/shop",
    bgColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#ffffff",
    style: "filled",
    fontSize: "12",
  },
  secondaryButton: {
    text: "Explorar",
    link: "/shop",
    bgColor: "transparent",
    textColor: "#ffffff",
    borderColor: "#ffffff",
    style: "outline",
    fontSize: "12",
  },
  saleBar: {
    enabled: true,
    title: "Liquidação, ao vivo agora",
    titleFontSize: "24",
    buttonText: "Explorar",
    buttonLink: "/shop",
    countdownTargetDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await upsertBannerConfig("hero", "Hero Banner", heroConfig);
    await upsertBannerConfig("collection-banners", "Collection Banners", collectionBannersConfig);
    await upsertBannerConfig("contemporary-banner", "Contemporary Banner", contemporaryBannerConfig);
    await upsertBannerConfig("video-banner", "Video Banner", videoBannerConfig);

    return NextResponse.json({ success: true, message: "Banner configs seeded" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("POST /api/admin/banners/seed error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
