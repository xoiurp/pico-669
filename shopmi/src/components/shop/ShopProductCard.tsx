"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProductOptionsModal from "../product/ProductOptionsModal";

interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions?: { name: string; value: string }[];
}

interface ProductOption {
  name: string;
  values: string[];
}

interface ShopProductCardProps {
  id: string;
  title: string;
  handle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  image: {
    transformedSrc: string;
    altText: string | null;
  };
  images?: { transformedSrc: string }[];
  colors?: string[];
  availableForSale?: boolean;
  isPreOrder?: boolean;
  variants?: ProductVariant[];
  options?: ProductOption[];
}

const ShopProductCard: React.FC<ShopProductCardProps> = ({
  id,
  title,
  handle,
  price,
  compareAtPrice,
  image,
  images,
  colors,
  availableForSale = true,
  isPreOrder = false,
  variants = [],
  options = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Format price
  const formatPrice = (amount: string, currencyCode: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  // Calculate discount percentage
  const discountPercent =
    compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount)
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100
        )
      : 0;

  // Parse colors from strings (they could be color names or hex values)
  const parseColor = (colorStr: string): string => {
    if (!colorStr || typeof colorStr !== 'string') return '#CCCCCC';
    
    // If it's already a hex color or rgb, return as is
    if (colorStr.startsWith("#") || colorStr.startsWith("rgb")) {
      return colorStr;
    }
    
    // Common color name to hex mapping
    const colorMap: Record<string, string> = {
      "bege": "#D4C4B0",
      "beige": "#D4C4B0",
      "preto": "#000000",
      "black": "#000000",
      "branco": "#FFFFFF",
      "white": "#FFFFFF",
      "cinza": "#808080",
      "gray": "#808080",
      "grey": "#808080",
      "marrom": "#8B4513",
      "brown": "#8B4513",
      "azul": "#0000FF",
      "blue": "#0000FF",
      "verde": "#008000",
      "green": "#008000",
      "vermelho": "#FF0000",
      "red": "#FF0000",
      "amarelo": "#FFFF00",
      "yellow": "#FFFF00",
      "rosa": "#FFC0CB",
      "pink": "#FFC0CB",
      "laranja": "#FFA500",
      "orange": "#FFA500",
      "roxo": "#800080",
      "purple": "#800080",
      "vinho": "#722F37",
      "burgundy": "#722F37",
      "nude": "#F5DEB3",
      "creme": "#FFFDD0",
      "cream": "#FFFDD0",
      "khaki": "#F0E68C",
      "caqui": "#F0E68C",
      "camel": "#C19A6B",
    };
    
    const lowerColor = colorStr.toLowerCase().trim();
    return colorMap[lowerColor] || colorStr;
  };

  const parsedColors = colors?.map(parseColor) || [];

  // Prepare product data for modal
  const productData = {
    id,
    title,
    handle,
    price,
    compareAtPrice,
    image: image.transformedSrc,
    images: images?.map((img) => img.transformedSrc) || [image.transformedSrc],
    variants: variants.length > 0 ? variants : [{
      id,
      title: "Default",
      price,
      availableForSale: availableForSale !== false, // Garante true se não for explicitamente false
      quantityAvailable: 99,
      selectedOptions: [],
    }],
    options: options.length > 0 ? options : undefined,
  };

  const handleOpenOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (availableForSale) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div
        className="group relative flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <Link
          href={`/product/${handle}`}
          className="relative block aspect-[3/4] overflow-hidden bg-white"
        >
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {discountPercent > 0 && (
              <span className="bg-[#313131] text-white text-[10px] font-semibold px-2 py-1 tracking-wide">
                {discountPercent}% OFF
              </span>
            )}
            {isPreOrder && (
              <span className="bg-white text-[#333] text-[10px] font-medium px-2 py-1 tracking-wide border border-[#e0e0e0]">
                PRE-ORDER
              </span>
            )}
          </div>

          {/* Product Image with hover swap */}
          {image.transformedSrc ? (
            <>
              {/* Primary image */}
              <Image
                src={image.transformedSrc}
                alt={image.altText || title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-contain p-4 bg-white transition-all duration-500 ${
                  isHovered && images && images.length > 1
                    ? "opacity-0 scale-105"
                    : "opacity-100 scale-100"
                }`}
              />
              {/* Secondary image - shown on hover */}
              {images && images.length > 1 && images[1]?.transformedSrc && (
                <Image
                  src={images[1].transformedSrc}
                  alt={`${title} - vista alternativa`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`object-contain p-4 bg-white transition-all duration-500 absolute inset-0 ${
                    isHovered
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <svg
                className="h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          {/* Add to Cart Button - Bottom Right on Hover */}
          <button
            onClick={handleOpenOptions}
            disabled={!availableForSale}
            className={`absolute bottom-3 right-3 z-10 w-11 h-11 rounded-lg bg-[#1a1a1a] flex items-center justify-center transition-all duration-300 ${
              isHovered && availableForSale
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            } ${!availableForSale ? "bg-gray-400 cursor-not-allowed" : "hover:bg-black"}`}
            aria-label="Escolher opções"
          >
            <Plus size={20} className="text-white" />
          </button>
        </Link>

        {/* Product Info */}
        <div className="pt-3 flex flex-col">
          <Link href={`/product/${handle}`}>
            <h3 className="text-xs sm:text-sm font-medium text-[#1a1a1a] uppercase tracking-wide hover:text-[#666] transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Price */}
          <div className="mt-1 flex items-center gap-2">
            {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
              <span className="text-xs text-[#999] line-through">
                {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-semibold text-[#313131]">
              {formatPrice(price.amount, price.currencyCode)}
            </span>
          </div>

          {/* Color Labels */}
          {colors && colors.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              {colors.slice(0, 4).map((color, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(selectedColor === color ? null : color);
                  }}
                  className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border transition-all duration-200 ${
                    selectedColor === color
                      ? "border-[#1a1a1a] text-[#1a1a1a] font-semibold"
                      : "border-[#e0e0e0] text-[#666] hover:border-[#999]"
                  }`}
                >
                  {color}
                </button>
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-[#999]">
                  +{colors.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Availability text */}
          {!availableForSale && (
            <span className="mt-1 text-[10px] text-[#999]">
              Indisponível
            </span>
          )}
        </div>
      </div>

      {/* Product Options Modal */}
      <ProductOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={productData}
      />
    </>
  );
};

export default ShopProductCard;
