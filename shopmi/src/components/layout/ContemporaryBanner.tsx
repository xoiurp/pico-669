"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "../../lib/shopify";

interface ContemporaryBannerProps {
  collection?: Collection;
}

const ContemporaryBanner: React.FC<ContemporaryBannerProps> = ({ collection }) => {
  return (
    <section className="w-full bg-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[450px] sm:min-h-[500px] lg:min-h-[600px]">
        {/* Left - Image */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-full overflow-hidden">
          {collection?.image ? (
            <Image
              src={collection.image.transformedSrc || collection.image.originalSrc || ""}
              alt={collection.title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
              <span className="text-[#666]">Imagem da coleção</span>
            </div>
          )}
        </div>

        {/* Right - Content */}
        <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight mb-4">
            New Drop Singapura Disponível
          </h2>
          <p className="text-sm sm:text-base text-[#999] max-w-md mb-8 leading-relaxed">
            Redefina estilos atemporais com um toque moderno — explore a Coleção Heritage e o Future Edit.
          </p>
          <Link
            href={collection?.handle ? `/shop/${collection.handle}` : "/shop"}
            className="px-8 py-3 bg-white text-black text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#f5f5f5] transition-colors"
          >
            Shop
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContemporaryBanner;
