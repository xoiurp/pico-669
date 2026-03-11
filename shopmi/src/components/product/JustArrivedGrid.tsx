"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../../lib/shopify";

interface JustArrivedGridProps {
  products: Product[];
}

const JustArrivedGrid: React.FC<JustArrivedGridProps> = ({ products }) => {
  const displayProducts = products.slice(0, 8);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, displayProducts.length]);

  const isScrolling = useRef(false);

  const smoothScrollTo = (el: HTMLElement, target: number, duration: number) => {
    if (isScrolling.current) return;
    isScrolling.current = true;
    const start = el.scrollLeft;
    const delta = target - start;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      el.scrollLeft = start + delta * easeInOutCubic(progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        isScrolling.current = false;
      }
    };

    requestAnimationFrame(step);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el || isScrolling.current) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > a")?.offsetWidth || 280;
    const gap = 24;
    const distance = cardWidth + gap;
    const target = el.scrollLeft + (direction === "left" ? -distance : distance);
    const clamped = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth));
    smoothScrollTo(el, clamped, 500);
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-gray-900">
            Novidades
          </h2>

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900 pb-0.5"
            >
              Ver Todos
            </Link>

            {/* Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-10 h-10 flex items-center justify-center text-gray-900 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
                aria-label="Próximo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide"
        >
          {displayProducts.map((product) => {
            const price = product.priceRange?.minVariantPrice?.amount;
            const currency = product.priceRange?.minVariantPrice?.currencyCode;
            const image = product.images?.edges?.[0]?.node;

            const variantCount = product.variants?.edges?.length || 1;
            const hasMultipleColors = variantCount > 1;

            return (
              <Link
                key={product.id}
                href={`/product/${product.handle}`}
                className="group block cursor-pointer flex-shrink-0 w-[45%] sm:w-[calc(25%-18px)]"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-white overflow-hidden mb-4">
                  {image ? (
                    <Image
                      src={image.transformedSrc || image.originalSrc || ""}
                      alt={image.altText || product.title}
                      fill
                      className="object-contain object-center group-hover:scale-105 transition-transform duration-500 p-4"
                      sizes="(max-width: 768px) 45vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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

                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="text-[11px] sm:text-xs tracking-wide uppercase text-gray-900 font-normal group-hover:text-[#555] transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-gray-600">
                    {currency === "BRL" ? "R$" : currency}{" "}
                    {price
                      ? parseFloat(price).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "0,00"}
                  </p>

                  <p className="text-[10px] text-gray-400">
                    {hasMultipleColors
                      ? `Disponível em ${variantCount} ${variantCount > 1 ? "cores" : "cor"}`
                      : "Disponível em 1 cor"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JustArrivedGrid;
