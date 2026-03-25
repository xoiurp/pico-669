"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "../../lib/shopify";
import type { CollectionBannersConfig, CollectionBannerSection } from "@/types/banner";

const defaultSections: [CollectionBannerSection, CollectionBannerSection] = [
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
];

interface CollectionBannersProps {
  collections: Collection[];
  config?: CollectionBannersConfig | null;
}

const CollectionBanners: React.FC<CollectionBannersProps> = ({ collections, config }) => {
  const sections = config?.sections || defaultSections;
  const topCollections = collections.slice(0, 2);
  const bottomCollection = collections[2];

  const renderSection = (section: CollectionBannerSection, linkHref: string) => (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image
            src={section.leftImage}
            alt={section.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${section.leftOverlayOpacity / 100})` }}
          />
        </div>

        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image
            src={section.rightImage}
            alt="Collection"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${section.rightOverlayOpacity / 100})` }}
          />
        </div>
      </div>

      <Link
        href={linkHref}
        className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 z-10"
      >
        <h3
          className="font-light tracking-tight"
          style={{ fontSize: `clamp(1.875rem, 4vw, ${Number(section.titleFontSize) / 16}rem)` }}
        >
          {section.title}
        </h3>
        <span
          className="mt-4 tracking-[0.3em] uppercase border-b border-white/70 pb-1 hover:border-white transition-colors"
          style={{ fontSize: `${section.buttonFontSize}px` }}
        >
          {section.buttonText}
        </span>
      </Link>
    </div>
  );

  return (
    <section className="w-full">
      {renderSection(
        sections[0],
        sections[0].buttonLink !== "/shop"
          ? sections[0].buttonLink
          : topCollections[0]?.handle
            ? `/shop/${topCollections[0].handle}`
            : "/shop"
      )}
      {renderSection(
        sections[1],
        sections[1].buttonLink !== "/shop"
          ? sections[1].buttonLink
          : bottomCollection?.handle
            ? `/shop/${bottomCollection.handle}`
            : "/shop"
      )}
    </section>
  );
};

export default CollectionBanners;
