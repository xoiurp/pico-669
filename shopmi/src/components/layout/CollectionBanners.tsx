"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "../../lib/shopify";
import leftImage from "../../assets/images/CASSIOANDREASI-4.jpg 1.webp";
import rightImage from "../../assets/images/CASSIOANDREASI-13 .jpg 1.webp";
import bottomLeftImage from "../../assets/images/CASSIOANDREASI-27.jpg 1.webp";
import bottomRightImage from "../../assets/images/CASSIOANDREASI-47.jpg 1.webp";

interface CollectionBannersProps {
  collections: Collection[];
}

const CollectionBanners: React.FC<CollectionBannersProps> = ({ collections }) => {
  const topCollections = collections.slice(0, 2);
  const bottomCollection = collections[2];

  return (
    <section className="w-full">
      {/* Top Row - Two Collection Cards */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Collection 1 */}
          <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
            <Image
              src={leftImage}
              alt={topCollections[0]?.title || "New Drop Class"}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Collection 2 */}
          <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
            <Image
              src={rightImage}
              alt={topCollections[1]?.title || "Collection"}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>

        {/* Centered text overlay spanning both columns */}
        <Link
          href={topCollections[0]?.handle ? `/shop/${topCollections[0].handle}` : "/shop"}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 z-10"
        >
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            New Drop Class
          </h3>
          <span className="mt-4 text-[10px] sm:text-xs tracking-[0.3em] uppercase border-b border-white/70 pb-1 hover:border-white transition-colors">
            Shop
          </span>
        </Link>
      </div>

      {/* Bottom Row - Two Collection Cards */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Bottom Collection 1 */}
          <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
            <Image
              src={bottomLeftImage}
              alt="FALL '26 Collection DROP1"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Bottom Collection 2 */}
          <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
            <Image
              src={bottomRightImage}
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
          href={bottomCollection?.handle ? `/shop/${bottomCollection.handle}` : "/shop"}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 z-10"
        >
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
            FALL '26 collection DROP1
          </h3>
          <span className="mt-4 text-[10px] sm:text-xs tracking-[0.3em] uppercase border-b border-white/70 pb-1 hover:border-white transition-colors">
            Shop
          </span>
        </Link>
      </div>
    </section>
  );
};

export default CollectionBanners;
