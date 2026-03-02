"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection, getProductsByCollection } from "../../lib/shopify";

interface SpecialCollection {
  id: string;
  handle: string;
  title: string;
  image?: {
    transformedSrc?: string;
    originalSrc?: string;
    altText?: string | null;
  } | null;
  productCount: number;
}

// IDs das coleções específicas
const COLLECTION_IDS = {
  TOP: "272614457409",
  SUNGLASSES: "298746347585",
  BOTTOM: "272614260801",
};

// Mapeamento de handles para títulos de exibição
const DISPLAY_TITLES: Record<string, string> = {
  top: "Tops",
  tops: "Tops",
  sunglasses: "Sunglasses",
  bottom: "Bottoms",
  bottoms: "Bottoms",
};

interface SpecialCollectionsProps {
  collections: Collection[];
}

const SpecialCollections: React.FC<SpecialCollectionsProps> = ({ collections }) => {
  const [specialCollections, setSpecialCollections] = useState<SpecialCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      const targetIds = [
        COLLECTION_IDS.TOP,
        COLLECTION_IDS.SUNGLASSES,
        COLLECTION_IDS.BOTTOM,
      ];

      const loaded: SpecialCollection[] = [];

      for (const collectionId of targetIds) {
        // Procurar nas coleções já carregadas
        const found = collections.find((c) => c.id.includes(collectionId));

        if (found) {
          // Buscar contagem de produtos
          try {
            const collectionWithProducts = await getProductsByCollection({
              collectionHandle: found.handle,
              first: 1,
            });

            const productCount = collectionWithProducts?.products?.edges?.length || 0;

            loaded.push({
              id: found.id,
              handle: found.handle,
              title: DISPLAY_TITLES[found.handle] || found.title,
              image: found.image,
              productCount: productCount,
            });
          } catch (error) {
            // Se der erro, adiciona sem contagem
            loaded.push({
              id: found.id,
              handle: found.handle,
              title: DISPLAY_TITLES[found.handle] || found.title,
              image: found.image,
              productCount: 0,
            });
          }
        }
      }

      setSpecialCollections(loaded);
      setLoading(false);
    };

    if (collections.length > 0) {
      loadCollections();
    }
  }, [collections]);

  if (loading) {
    return (
      <section className="w-full py-12 sm:py-16 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-4" />
                <div className="h-5 bg-gray-200 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 sm:py-16 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-gray-900">
            Nossas coleções <span className="italic">especiais</span>
          </h2>

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900 pb-0.5"
            >
              Ver Todas
            </Link>

            {/* Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="Previous"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center text-gray-900 hover:text-gray-600 transition-colors"
                aria-label="Next"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {specialCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/shop/${collection.handle}`}
              className="group block"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden mb-4">
                {collection.image ? (
                  <Image
                    src={collection.image.transformedSrc || collection.image.originalSrc || ""}
                    alt={collection.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Collection Title with Count */}
              <div className="text-center">
                <h3 className="text-sm sm:text-base font-normal text-gray-900 inline-flex items-baseline">
                  {collection.title}
                  {collection.productCount > 0 && (
                    <sup className="text-[10px] text-gray-400 ml-0.5">
                      {collection.productCount}
                    </sup>
                  )}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialCollections;
