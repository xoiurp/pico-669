// ============================================
// Banner Configuration Types
// ============================================

export interface ButtonConfig {
  text: string;
  link: string;
  bgColor: string;       // hex, e.g. "#ffffff"
  textColor: string;     // hex, e.g. "#000000"
  borderColor: string;   // hex, e.g. "#ffffff"
  style: "filled" | "outline";
  fontSize: string;      // e.g. "12", "14" (px)
}

// ---------- Hero Banner ----------
export interface HeroBannerConfig {
  backgroundImage: string;
  overlayGradient: string;        // CSS gradient
  title: string;
  titleFontSize: string;          // px value, e.g. "72"
  subtitle: string;
  subtitleFontSize: string;
  button: ButtonConfig;
}

// ---------- Collection Banners (2 sections) ----------
export interface CollectionBannerSection {
  leftImage: string;
  rightImage: string;
  leftOverlayOpacity: number;     // 0-100
  rightOverlayOpacity: number;
  title: string;
  titleFontSize: string;
  buttonText: string;
  buttonLink: string;
  buttonFontSize: string;
}

export interface CollectionBannersConfig {
  sections: [CollectionBannerSection, CollectionBannerSection];
}

// ---------- Contemporary Banner ----------
export interface ContemporaryBannerConfig {
  leftImage: string;
  rightImage: string;
  leftOverlayOpacity: number;
  rightOverlayOpacity: number;
  title: string;
  titleFontSize: string;
  mobileTitleFontSize: string;
  buttonText: string;
  buttonLink: string;
  buttonFontSize: string;
  mobileButtonFontSize: string;
}

// ---------- Video Banner ----------
export interface VideoBannerConfig {
  videoUrl: string;
  overlayOpacity: number;
  tagline: string;
  taglineFontSize: string;
  title: string;
  titleItalicWord: string;
  titleFontSize: string;
  primaryButton: ButtonConfig;
  secondaryButton: ButtonConfig;
  saleBar: {
    enabled: boolean;
    title: string;
    titleFontSize: string;
    buttonText: string;
    buttonLink: string;
    countdownTargetDate: string;  // ISO date string
  };
}

// ---------- Union type ----------
export type BannerConfigData =
  | HeroBannerConfig
  | CollectionBannersConfig
  | ContemporaryBannerConfig
  | VideoBannerConfig;

// ---------- Slug mapping ----------
export type BannerSlug =
  | "hero"
  | "collection-banners"
  | "contemporary-banner"
  | "video-banner";

// ---------- DB record type ----------
export interface BannerRecord {
  id: string;
  slug: string;
  title: string;
  config: BannerConfigData;
  isActive: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
