"use client";

import React, { useRef } from "react";
import ShopProductCard from "@/components/shop/ShopProductCard";
import { Product } from "@/lib/shopify";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  title = "Combine com",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("div")?.offsetWidth || 300;
    const scrollAmount = cardWidth + 16; // card width + gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full border-t border-[#e0e0e0]">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] uppercase tracking-wider">
              {title}
            </h2>

            {/* Navigation arrows - only on desktop when more than 4 items */}
            {products.length > 4 && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scroll("left")}
                  className="w-11 h-11 flex items-center justify-center border border-[#e0e0e0] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors text-[#1a1a1a]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="w-11 h-11 flex items-center justify-center border border-[#e0e0e0] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors text-[#1a1a1a]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Products carousel */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          >
            {products.map((product) => {
              const firstVariant = product.variants?.edges[0]?.node;
              const compareAtPrice = firstVariant?.compareAtPrice || undefined;
              const firstImage = product.images.edges[0]?.node;

              // Extract color options from variants
              const colorSet = new Set<string>();
              product.variants?.edges.forEach((edge) => {
                const colorOpt = edge.node.selectedOptions?.find(
                  (opt) =>
                    opt.name.toLowerCase() === "cor" ||
                    opt.name.toLowerCase() === "color"
                );
                if (colorOpt) colorSet.add(colorOpt.value);
              });

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[220px] sm:w-[250px] md:w-[calc(25%-12px)] snap-start"
                >
                  <ShopProductCard
                    id={product.id}
                    title={product.title}
                    handle={product.handle}
                    price={product.priceRange.minVariantPrice}
                    compareAtPrice={compareAtPrice}
                    image={
                      firstImage || {
                        transformedSrc: "",
                        altText: product.title,
                      }
                    }
                    colors={
                      colorSet.size > 0
                        ? Array.from(colorSet)
                        : undefined
                    }
                    variants={product.variants?.edges.map((e) => e.node)}
                    options={product.options}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
