"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../../lib/shopify";
import { useCart } from "../../context/CartContext";

interface ItemOfTheWeekProps {
  product: Product | null;
}

const ItemOfTheWeek: React.FC<ItemOfTheWeekProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { addToCart, setCartSheetOpen } = useCart();

  // Extract dynamic sizes from product variants
  const availableSizes = useMemo(() => {
    if (!product?.variants?.edges) return [];
    const sizes = new Set<string>();
    product.variants.edges.forEach((edge) => {
      const sizeOpt = edge.node.selectedOptions?.find(
        (opt) => opt.name.toLowerCase() === "tamanho" || opt.name.toLowerCase() === "size"
      );
      if (sizeOpt) sizes.add(sizeOpt.value);
    });
    return Array.from(sizes);
  }, [product]);

  // Extract dynamic colors from product variants
  const availableColors = useMemo(() => {
    if (!product?.variants?.edges) return [];
    const colorMap = new Map<string, string>();
    product.variants.edges.forEach((edge) => {
      const colorOpt = edge.node.selectedOptions?.find(
        (opt) => opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color"
      );
      if (colorOpt && !colorMap.has(colorOpt.value)) {
        const hex = edge.node.metafield?.value || "#cccccc";
        colorMap.set(colorOpt.value, hex);
      }
    });
    return Array.from(colorMap, ([name, value]) => ({ name, value }));
  }, [product]);

  // Initialize selections
  React.useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  React.useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].name);
    }
  }, [availableColors, selectedColor]);

  if (!product) {
    return null;
  }

  const images = product.images?.edges || [];
  const totalImages = images.length;
  const maxPairIndex = Math.max(0, Math.ceil(totalImages / 2) - 1);

  const leftImage = images[currentPairIndex * 2]?.node;
  const rightImage = images[currentPairIndex * 2 + 1]?.node;

  const price = product.priceRange?.minVariantPrice?.amount;
  const currency = product.priceRange?.minVariantPrice?.currencyCode;

  const handleAddToCart = () => {
    if (product.variants?.edges?.[0]?.node) {
      const variant = product.variants.edges[0].node;
      addToCart({
        id: variant.id,
        variantId: variant.id,
        quantity: quantity,
        title: product.title,
        price: parseFloat(variant.price.amount),
        currencyCode: variant.price.currencyCode,
        image: images[0]?.node?.transformedSrc || "",
        productId: product.id,
        handle: product.handle,
      });
      setCartSheetOpen(true);
    }
  };

  const nextPair = () => {
    if (currentPairIndex >= maxPairIndex) return;
    setDirection(1);
    setCurrentPairIndex((prev) => prev + 1);
  };

  const prevPair = () => {
    if (currentPairIndex <= 0) return;
    setDirection(-1);
    setCurrentPairIndex((prev) => prev - 1);
  };

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(amount));
  };

  return (
    <div className="w-full bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <h2 className="text-3xl sm:text-4xl font-light text-[#1a1a1a] mb-8 sm:mb-12">
          Item da <span className="italic">semana</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">
          {/* Left - Dual Image Gallery */}
          <div className="relative">
            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10">
              <span className="text-xs text-[#666]">
                {currentPairIndex * 2 + 1} | {totalImages}
              </span>
            </div>

            {/* Gallery Container */}
            <div className="relative overflow-hidden bg-white">
              <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                <motion.div
                  key={currentPairIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="grid grid-cols-2 gap-px"
                >
                  {/* Left Image */}
                  <div className="relative aspect-[3/4] bg-white">
                    {leftImage ? (
                      <Image
                        src={leftImage.transformedSrc || ""}
                        alt={leftImage.altText || product.title}
                        fill
                        className="object-contain p-6"
                        sizes="(max-width: 1024px) 50vw, 30vw"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#e0e0e0]">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Right Image */}
                  <div className="relative aspect-[3/4] bg-white">
                    {rightImage ? (
                      <Image
                        src={rightImage.transformedSrc || ""}
                        alt={rightImage.altText || product.title}
                        fill
                        className="object-contain p-6"
                        sizes="(max-width: 1024px) 50vw, 30vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#e0e0e0]">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {totalImages > 2 && (
                <>
                  <button
                    onClick={prevPair}
                    disabled={currentPairIndex <= 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#ccc] bg-white/80 hover:bg-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default z-10"
                    aria-label="Imagens anteriores"
                    type="button"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
                  </button>
                  <button
                    onClick={nextPair}
                    disabled={currentPairIndex >= maxPairIndex}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#ccc] bg-white/80 hover:bg-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default z-10"
                    aria-label="Próximas imagens"
                    type="button"
                  >
                    <ChevronRight className="w-5 h-5 text-[#1a1a1a]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right - Product Details */}
          <div className="flex flex-col">
            {/* Product Title */}
            <h3 className="text-sm sm:text-base font-semibold text-[#1a1a1a] uppercase tracking-wide mb-2">
              {product.title}
            </h3>

            {/* Product Type */}
            <p className="text-[10px] sm:text-xs text-[#1a1a1a] uppercase tracking-wider mb-4 border-b border-[#1a1a1a] w-fit pb-0.5">
              {product.productType || "Destaque"}
            </p>

            {/* Price */}
            <p className="text-sm sm:text-base text-[#1a1a1a] mb-8">
              {price ? formatPrice(price) : "R$ 0,00"}{" "}
              <span className="text-[10px] sm:text-xs text-[#999] uppercase tracking-wider ml-1">Impostos inclusos.</span>
            </p>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#1a1a1a]">
                    Tamanho {selectedSize}
                  </span>
                  <button
                    type="button"
                    className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1a1a1a] underline underline-offset-2 hover:text-[#666] cursor-pointer"
                  >
                    Guia de tamanhos
                  </button>
                </div>
                <div className="flex gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      type="button"
                      className={`min-w-[40px] h-10 px-3 text-xs font-medium border transition-colors cursor-pointer ${
                        selectedSize === size
                          ? "border-[#1a1a1a] text-[#1a1a1a]"
                          : "border-[#e0e0e0] text-[#666] hover:border-[#999]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="mb-8">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#1a1a1a] block mb-3">
                  Cor {selectedColor}
                </span>
                <div className="flex gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      type="button"
                      className={`min-w-[40px] h-10 px-3 text-xs font-medium border transition-colors cursor-pointer ${
                        selectedColor === color.name
                          ? "border-[#1a1a1a] text-[#1a1a1a]"
                          : "border-[#e0e0e0] text-[#666] hover:border-[#999]"
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart (inline) */}
            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Selector - pill */}
                <div className="flex items-center border border-[#e0e0e0] flex-shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    type="button"
                    className="w-11 h-11 flex items-center justify-center text-[#666] hover:text-[#1a1a1a] transition-colors cursor-pointer text-lg"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm text-[#1a1a1a] font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    type="button"
                    className="w-11 h-11 flex items-center justify-center text-[#666] hover:text-[#1a1a1a] transition-colors cursor-pointer text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  type="button"
                  className="flex-1 py-3.5 bg-[#1a1a1a] text-white text-xs sm:text-sm tracking-[0.15em] uppercase font-medium hover:bg-black transition-colors cursor-pointer"
                >
                  Adicionar ao carrinho
                </button>
              </div>

              {/* Buy It Now */}
              <button
                type="button"
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => { window.location.href = "/checkout"; }, 300);
                }}
                className="w-full py-3.5 border border-[#1a1a1a] text-[#1a1a1a] text-xs sm:text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
              >
                Comprar agora
              </button>

              {/* View Product */}
              <Link
                href={`/product/${product.handle}`}
                className="block text-center text-[10px] sm:text-xs tracking-[0.15em] uppercase text-[#666] hover:text-[#1a1a1a] underline underline-offset-4 transition-colors py-3"
              >
                Ver produto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemOfTheWeek;
