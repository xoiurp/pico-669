"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "../../lib/shopify";
import type { ContemporaryBannerConfig } from "@/types/banner";

const defaults: ContemporaryBannerConfig = {
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

interface ContemporaryBannerProps {
  collection?: Collection;
  config?: ContemporaryBannerConfig | null;
}

const ContemporaryBanner: React.FC<ContemporaryBannerProps> = ({
  collection,
  config: cfg,
}) => {
  const c = { ...defaults, ...cfg };
  const linkHref =
    c.buttonLink !== "/shop"
      ? c.buttonLink
      : collection?.handle
        ? `/shop/${collection.handle}`
        : "/shop";

  return (
    <section className="w-full relative">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Column 1 */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image
            src={c.leftImage}
            alt={c.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${c.leftOverlayOpacity / 100})` }}
          />
          {/* Mobile only: title centered on image 1 */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4 z-10 md:hidden">
            <h3
              className="font-light tracking-tight whitespace-nowrap"
              style={{ fontSize: `${c.mobileTitleFontSize}px` }}
            >
              {c.title}
            </h3>
          </div>
        </div>

        {/* Column 2 */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image
            src={c.rightImage}
            alt="Collection"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${c.rightOverlayOpacity / 100})` }}
          />
          {/* Mobile only: shop button centered on image 2 */}
          <Link
            href={linkHref}
            className="absolute inset-0 flex items-center justify-center z-10 md:hidden"
          >
            <span
              className="tracking-[0.3em] uppercase text-white border-b border-white/70 pb-1 hover:border-white transition-colors"
              style={{ fontSize: `${c.mobileButtonFontSize}px` }}
            >
              {c.buttonText}
            </span>
          </Link>
        </div>
      </div>

      {/* Desktop only: centered text overlay spanning both columns */}
      <Link
        href={linkHref}
        className="absolute inset-0 hidden md:flex flex-col items-center justify-center text-white text-center p-6 z-10"
      >
        <h3
          className="font-light tracking-tight"
          style={{ fontSize: `clamp(1.875rem, 4vw, ${Number(c.titleFontSize) / 16}rem)` }}
        >
          {c.title}
        </h3>
        <span
          className="mt-4 tracking-[0.3em] uppercase border-b border-white/70 pb-1 hover:border-white transition-colors"
          style={{ fontSize: `${c.buttonFontSize}px` }}
        >
          {c.buttonText}
        </span>
      </Link>
    </section>
  );
};

export default ContemporaryBanner;
