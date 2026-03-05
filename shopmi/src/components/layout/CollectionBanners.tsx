"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "../../lib/shopify";

interface CollectionBannersProps {
  collections: Collection[];
}

const CollectionBanners: React.FC<CollectionBannersProps> = ({ collections }) => {
  const topCollections = collections.slice(0, 2);
  const bottomCollection = collections[2];

  return (
    <section className="w-full">
      {/* Top Row - Two Collection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Collection 1 */}
        <Link
          href={topCollections[0]?.handle ? `/shop/${topCollections[0].handle}` : "/shop"}
          className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden group"
        >
          {topCollections[0]?.image ? (
            <Image
              src={topCollections[0].image.transformedSrc || topCollections[0].image.originalSrc || ""}
              alt={topCollections[0].title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-[#1a1a1a]" />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
              New Drop Class
            </h3>
            <span className="mt-4 text-[10px] sm:text-xs tracking-[0.3em] uppercase border-b border-white/70 pb-1 hover:border-white transition-colors">
              Shop
            </span>
          </div>
        </Link>

        {/* Collection 2 */}
        <Link
          href={topCollections[1]?.handle ? `/shop/${topCollections[1].handle}` : "/shop"}
          className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden group"
        >
          {topCollections[1]?.image ? (
            <Image
              src={topCollections[1].image.transformedSrc || topCollections[1].image.originalSrc || ""}
              alt={topCollections[1].title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-[#e0e0e0]" />
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
        </Link>
      </div>

      {/* Bottom Row - Full Width Banner */}
      <Link
        href={bottomCollection?.handle ? `/shop/${bottomCollection.handle}` : "/shop"}
        className="relative block w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden group"
      >
        {bottomCollection?.image ? (
          <Image
            src={bottomCollection.image.transformedSrc || bottomCollection.image.originalSrc || ""}
            alt={bottomCollection.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#666] to-[#1a1a1a]" />
        )}

        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight max-w-3xl leading-tight">
            A marca cria roupas para fazer{" "}
            <span className="block sm:inline">
              todos se sentirem <span className="italic font-normal">únicos</span>
            </span>
          </h3>
          <button className="mt-8 px-6 py-3 border border-white/80 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-300">
            Lookbook
          </button>
        </div>
      </Link>
    </section>
  );
};

export default CollectionBanners;
