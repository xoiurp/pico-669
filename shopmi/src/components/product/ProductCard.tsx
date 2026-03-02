'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { Heart } from 'lucide-react';

interface ProductCardProps {
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
  descricaoCurta?: string;
  colors?: string[];
  totalStock?: number;
  availableForSale?: boolean;
  isNew?: boolean;
  hasFreeShipping?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  handle,
  price,
  compareAtPrice,
  image,
  descricaoCurta,
  colors,
  totalStock,
  availableForSale = true,
  isNew = false,
  hasFreeShipping = true,
}) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (amount: string, currencyCode: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      title,
      price: parseFloat(price.amount),
      currencyCode: price.currencyCode,
      image: image.transformedSrc,
      variantId: id,
      productId: id,
      handle: handle,
      quantity: 1,
    });
  };

  const discountPercent = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount)
    ? Math.round(
        ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
          parseFloat(compareAtPrice.amount)) *
          100
      )
    : 0;

  return (
    <div
      className="group bg-white overflow-hidden relative flex flex-col cursor-pointer transition-shadow duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container with badges */}
      <div className="relative">
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-1.5">
            {hasFreeShipping && (
              <span className="bg-[#1a1a1a] text-white text-[10px] font-medium px-2 py-1 tracking-wide">
                Frete Grátis
              </span>
            )}
            {isNew && (
              <span className="bg-white text-[#1a1a1a] text-[10px] font-medium px-2 py-1 tracking-wide border border-[#e0e0e0]">
                Lançamento
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-[#313131] text-white text-[10px] font-semibold px-2 py-1 tracking-wide">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="pointer-events-auto p-1.5 bg-white/80 hover:bg-white transition-colors cursor-pointer"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-[#999] hover:text-[#666]'
              }`}
            />
          </button>
        </div>

        {/* Product image */}
        <Link
          href={`/product/${handle}`}
          className="block relative aspect-[3/4] overflow-hidden bg-white"
        >
          {image.transformedSrc ? (
            <Image
              src={image.transformedSrc}
              alt={image.altText || title}
              fill
              sizes="(max-width: 375px) 50vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5] text-[#e0e0e0]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 sm:h-16 sm:w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </Link>
      </div>

      {/* Product details */}
      <div className="pt-3 pb-12 flex flex-col">
        <Link href={`/product/${handle}`} className="block">
          <h3 className="text-xs sm:text-sm font-medium text-[#1a1a1a] uppercase tracking-wide hover:text-[#555] transition-colors line-clamp-2 leading-tight">
            {title}
          </h3>
        </Link>

        {descricaoCurta && (
          <p className="text-xs text-[#666] line-clamp-2 mt-1 leading-relaxed">
            {descricaoCurta}
          </p>
        )}

        {/* Color swatches */}
        {colors && colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {colors.slice(0, 4).map((color, index) => (
              <span
                key={index}
                className="block w-4 h-4 border border-[#e0e0e0]"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] text-[#999]">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-2">
          {compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
            <div className="text-xs text-[#999] line-through">
              {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
            </div>
          )}
          <div className="text-sm font-medium text-[#1a1a1a]">
            {formatPrice(price.amount, price.currencyCode)}
          </div>
        </div>
      </div>

      {/* Buy button - slides up on hover without overlapping content */}
      <div
        className={`absolute left-0 right-0 bottom-0 p-3 bg-white border-t border-[#f0f0f0] transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <button
          onClick={handleAddToCart}
          disabled={!availableForSale || totalStock === 0}
          className={`w-full py-3 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer
            ${!availableForSale || totalStock === 0
              ? 'bg-[#e0e0e0] text-[#999] cursor-not-allowed'
              : 'bg-[#1a1a1a] text-white hover:bg-black'
            }`}
        >
          {!availableForSale || totalStock === 0 ? 'Indisponível' : 'Comprar'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
