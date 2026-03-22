"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "../../lib/shopify";
import leftImage from "../../assets/images/IMG_9906 1.webp";
import rightImage from "../../assets/images/IMG_9908 1.webp";

interface ContemporaryBannerProps {
  collection?: Collection;
}

const ContemporaryBanner: React.FC<ContemporaryBannerProps> = ({ collection }) => {
  return (
    <section className="w-full relative">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Column 1 */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image
            src={leftImage}
            alt="New Drop Singapura"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Column 2 */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image
            src={rightImage}
            alt="Collection"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      {/* Centered text overlay spanning both columns */}
      <Link
        href={collection?.handle ? `/shop/${collection.handle}` : "/shop"}
        className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 z-10"
      >
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
          New Drop Singapura Disponível
        </h3>
        <span className="mt-4 text-[10px] sm:text-xs tracking-[0.3em] uppercase border-b border-white/70 pb-1 hover:border-white transition-colors">
          Shop
        </span>
      </Link>
    </section>
  );
};

export default ContemporaryBanner;
