"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/shopify";
import { Minus, Plus, Check, ShieldCheck, Truck, RefreshCw, Store, Ruler } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ShippingCalculator from "@/components/shipping/ShippingCalculator";

interface ColorOption {
  name: string;
  hex: string;
  image?: string;
}

interface VariantNode {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  quantityAvailable?: number;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  image?: {
    transformedSrc: string;
  };
}

type SizeChartData =
  | { type: "json"; headers: string[]; rows: string[][] }
  | { type: "html"; html: string }
  | null;

interface NewProductDetailsProps {
  product: Product;
  variants: VariantNode[];
  uniqueColors: ColorOption[];
  images: { transformedSrc: string; altText: string | null }[];
  sizeChartData?: SizeChartData;
}

const formatPrice = (amount: string | number, currencyCode: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currencyCode,
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
};

const NewProductDetails: React.FC<NewProductDetailsProps> = ({
  product,
  variants,
  uniqueColors,
  images,
  sizeChartData,
}) => {
  const { addToCart, setCartSheetOpen } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  // Get available sizes from variants
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    variants.forEach((variant) => {
      if (!variant.selectedOptions) return;
      const sizeOption = variant.selectedOptions.find(
        (opt) => opt.name.toLowerCase() === "tamanho" || opt.name.toLowerCase() === "size"
      );
      if (sizeOption) {
        sizes.add(sizeOption.value);
      }
    });
    return Array.from(sizes);
  }, [variants]);

  // Find selected variant based on color and size
  const selectedVariant = useMemo(() => {
    if (!selectedColor) return null;
    
    // Se o produto tem tamanhos mas nenhum está selecionado, não pode adicionar
    const hasSizes = availableSizes.length > 0;
    if (hasSizes && !selectedSize) return null;
    
    return variants.find((variant) => {
      if (!variant.selectedOptions) return false;
      
      const colorMatch = variant.selectedOptions.find(
        (opt) =>
          (opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color") &&
          opt.value === selectedColor
      );
      
      if (!colorMatch) return false;
      
      if (selectedSize) {
        const sizeMatch = variant.selectedOptions.find(
          (opt) =>
            (opt.name.toLowerCase() === "tamanho" || opt.name.toLowerCase() === "size") &&
            opt.value === selectedSize
        );
        if (!sizeMatch) return false;
      }
      
      return true;
    });
  }, [variants, selectedColor, selectedSize, availableSizes]);

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (selectedVariant?.compareAtPrice) {
      const original = parseFloat(selectedVariant.compareAtPrice.amount);
      const current = parseFloat(selectedVariant.price.amount);
      if (original > current) {
        return Math.round(((original - current) / original) * 100);
      }
    }
    const minVariant = product.variants?.edges[0]?.node;
    if (minVariant?.compareAtPrice) {
      const original = parseFloat(minVariant.compareAtPrice.amount);
      const current = parseFloat(minVariant.price.amount);
      if (original > current) {
        return Math.round(((original - current) / original) * 100);
      }
    }
    return 0;
  }, [selectedVariant, product]);

  // Get current price
  const currentPrice = useMemo(() => {
    if (selectedVariant) {
      return formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode);
    }
    return formatPrice(
      product.priceRange.minVariantPrice.amount,
      product.priceRange.minVariantPrice.currencyCode
    );
  }, [selectedVariant, product]);

  // Get current numeric price for installment calculation
  const currentNumericPrice = useMemo(() => {
    if (selectedVariant) {
      return parseFloat(selectedVariant.price.amount);
    }
    return parseFloat(product.priceRange.minVariantPrice.amount);
  }, [selectedVariant, product]);

  // PIX discount price (5% off, consistent with checkout)
  const pixPrice = useMemo(() => {
    return currentNumericPrice * 0.95;
  }, [currentNumericPrice]);

  // Installment calculation (up to 6x, no interest)
  const installment = useMemo(() => {
    const maxInstallments = 6;
    const installmentValue = currentNumericPrice / maxInstallments;
    return { count: maxInstallments, value: installmentValue };
  }, [currentNumericPrice]);

  // Get compare at price
  const compareAtPrice = useMemo(() => {
    if (selectedVariant?.compareAtPrice) {
      const original = parseFloat(selectedVariant.compareAtPrice.amount);
      const current = parseFloat(selectedVariant.price.amount);
      if (original > current) {
        return formatPrice(selectedVariant.compareAtPrice.amount, selectedVariant.compareAtPrice.currencyCode);
      }
    }
    return null;
  }, [selectedVariant]);

  // Get stock quantity
  const stockQuantity = selectedVariant?.quantityAvailable ?? 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;
  
  // IMPORTANTE: Verifica se pode adicionar ao carrinho
  const canAddToCart = Boolean(selectedVariant && stockQuantity > 0);

  // Initialize selected color
  useEffect(() => {
    if (uniqueColors.length > 0 && !selectedColor) {
      const firstAvailable = uniqueColors.find((color) => {
        return variants.some((variant) => {
          if (!variant.selectedOptions) return false;
          const colorMatch = variant.selectedOptions.find(
            (opt) =>
              (opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color") &&
              opt.value === color.name
          );
          return colorMatch && (variant.quantityAvailable ?? 0) > 0;
        });
      });
      setSelectedColor(firstAvailable?.name || uniqueColors[0]?.name || null);
    }
  }, [uniqueColors, variants, selectedColor]);

  // Initialize selected size - só roda quando temos cor selecionada
  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize && selectedColor) {
      // Encontra o primeiro tamanho disponível para a cor selecionada
      const firstAvailableSize = availableSizes.find((size) => {
        return variants.some((variant) => {
          if (!variant.selectedOptions) return false;
          
          const colorMatch = variant.selectedOptions.find(
            (opt) =>
              (opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color") &&
              opt.value === selectedColor
          );
          const sizeMatch = variant.selectedOptions.find(
            (opt) =>
              (opt.name.toLowerCase() === "tamanho" || opt.name.toLowerCase() === "size") &&
              opt.value === size
          );
          return colorMatch && sizeMatch && (variant.quantityAvailable ?? 0) > 0;
        });
      });
      setSelectedSize(firstAvailableSize || availableSizes[0]);
    }
  }, [availableSizes, variants, selectedColor, selectedSize]);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, stockQuantity || 99)));
  }, [stockQuantity]);

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant) {
      console.error("Cannot add to cart: no variant selected");
      return;
    }

    const cartItem = {
      id: selectedVariant.id,
      title: product.title,
      price: parseFloat(selectedVariant.price.amount),
      currencyCode: selectedVariant.price.currencyCode,
      quantity: quantity,
      image: images[0]?.transformedSrc || "",
      variantId: selectedVariant.id,
      productId: product.id,
      category: product.productType,
      variantOptions: selectedVariant.selectedOptions?.map((opt) => ({
        name: opt.name,
        value: opt.value,
      })),
      compareAtPrice: selectedVariant.compareAtPrice,
      tags: product.tags,
      handle: product.handle,
    };

    addToCart(cartItem);
    setCartSheetOpen(true);
  }, [selectedVariant, product, quantity, images, addToCart, setCartSheetOpen]);

  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const handleBuyNow = useCallback(async () => {
    if (!selectedVariant) return;

    setBuyNowLoading(true);
    try {
      const items = [
        {
          variantId: selectedVariant.id,
          quantity: quantity,
        },
      ];

      const res = await fetch("/api/checkout/yampi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      const redirectUrl =
        data.checkout_direct_url ||
        data.checkout_url ||
        data.redirect_url ||
        data.url ||
        data.data?.checkout_direct_url ||
        data.data?.checkout_url ||
        data.data?.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error("[BuyNow] No redirect URL returned", data);
        // Fallback: add to cart and open drawer
        handleAddToCart();
      }
    } catch (error) {
      console.error("[BuyNow] Error:", error);
      handleAddToCart();
    } finally {
      setBuyNowLoading(false);
    }
  }, [selectedVariant, quantity, handleAddToCart]);

  // Get color image for swatch
  const getColorImage = (colorName: string) => {
    const variantWithColor = variants.find((v) => {
      if (!v.selectedOptions) return false;
      return v.selectedOptions.find(
        (opt) =>
          (opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color") &&
          opt.value === colorName
      );
    });
    return variantWithColor?.image?.transformedSrc;
  };

  // Check if color is available
  const isColorAvailable = (colorName: string) => {
    return variants.some((variant) => {
      if (!variant.selectedOptions) return false;
      const colorMatch = variant.selectedOptions.find(
        (opt) =>
          (opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color") &&
          opt.value === colorName
      );
      return colorMatch && (variant.quantityAvailable ?? 0) > 0;
    });
  };

  // Check if size is available for selected color
  const isSizeAvailable = (size: string) => {
    if (!selectedColor) return true;
    return variants.some((variant) => {
      if (!variant.selectedOptions) return false;
      const colorMatch = variant.selectedOptions.find(
        (opt) =>
          (opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color") &&
          opt.value === selectedColor
      );
      const sizeMatch = variant.selectedOptions.find(
        (opt) =>
          (opt.name.toLowerCase() === "tamanho" || opt.name.toLowerCase() === "size") &&
          opt.value === size
      );
      return colorMatch && sizeMatch && (variant.quantityAvailable ?? 0) > 0;
    });
  };

  // Short description
  const shortDescription = product.description?.substring(0, 180) + "...";
  const hasLongDescription = (product.description?.length || 0) > 180;

  return (
    <div className="flex flex-col h-full lg:py-8">
      {/* Stock Badge */}
      {isLowStock && (
        <Badge className="w-fit mb-4 bg-[#1a1a1a] hover:bg-[#1a1a1a] text-white text-[10px] sm:text-xs tracking-wider uppercase font-semibold px-3 py-1.5 rounded-none">
          ÚLTIMAS UNIDADES
        </Badge>
      )}

      {/* Product Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-3 tracking-tight leading-tight">
        {product.title}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-xl md:text-2xl font-semibold text-[#1a1a1a]">{currentPrice}</span>
        {compareAtPrice && (
          <span className="text-[#999] line-through text-base">{compareAtPrice}</span>
        )}
        <span className="text-[10px] sm:text-xs text-[#666] uppercase tracking-wider ml-1">Impostos inclusos</span>
      </div>

      {/* Installment Info */}
      <div className="border border-[#e0e0e0] p-4 mb-6">
        <p className="text-sm text-[#1a1a1a] font-medium">
          {formatPrice(pixPrice)}
          <span className="text-xs text-[#666] font-normal ml-1">com 5% de desconto no PIX</span>
        </p>
        <p className="text-sm text-[#666] mt-1">
          Ou {currentPrice} em até {installment.count}x de{" "}
          <span className="font-medium text-[#1a1a1a]">{formatPrice(installment.value)}</span>{" "}
          sem juros
        </p>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-[#666] leading-relaxed">
          {showFullDescription ? product.description : shortDescription}
        </p>
        {hasLongDescription && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-[11px] sm:text-xs text-[#1a1a1a] uppercase tracking-wider mt-3 hover:underline underline-offset-4 font-medium"
          >
            {showFullDescription ? "Ver menos -" : "Ler mais +"}
          </button>
        )}
      </div>

      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#666] font-medium">
                Tamanho
              </span>
              {selectedSize && (
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1a1a1a] font-semibold">
                  {selectedSize}
                </span>
              )}
            </div>
            {sizeChartData && (
              <button
                onClick={() => setSizeChartOpen(true)}
                className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1a1a1a] underline underline-offset-4 hover:text-[#666] font-medium flex items-center gap-1.5"
              >
                <Ruler className="w-3 h-3" />
                Guia de tamanhos
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {availableSizes.map((size) => {
              const isAvailable = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  onClick={() => isAvailable && setSelectedSize(size)}
                  disabled={!isAvailable}
                  className={`min-w-[40px] h-10 px-2 text-[11px] sm:text-xs font-medium border-2 transition-all ${
                    selectedSize === size
                      ? "border-[#1a1a1a] bg-white text-[#1a1a1a]"
                      : "border-[#e0e0e0] text-[#666] hover:border-[#999]"
                  } ${!isAvailable ? "opacity-40 cursor-not-allowed border-[#e0e0e0]" : "cursor-pointer"}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {uniqueColors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#666] font-medium">
              Cor
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#1a1a1a] font-semibold">
              {selectedColor}
            </span>
          </div>
          <div className="flex gap-2">
            {uniqueColors.map((color) => {
              const isAvailable = isColorAvailable(color.name);
              const colorImg = getColorImage(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedColor(color.name);
                      // Reset size to find best match for new color
                      if (availableSizes.length > 0) {
                        const firstAvailableSize = availableSizes.find((size) => {
                          return variants.some((variant) => {
                            if (!variant.selectedOptions) return false;
                            const colorMatch = variant.selectedOptions.find(
                              (opt) =>
                                (opt.name.toLowerCase() === "cor" || opt.name.toLowerCase() === "color") &&
                                opt.value === color.name
                            );
                            const sizeMatch = variant.selectedOptions.find(
                              (opt) =>
                                (opt.name.toLowerCase() === "tamanho" || opt.name.toLowerCase() === "size") &&
                                opt.value === size
                            );
                            return colorMatch && sizeMatch && (variant.quantityAvailable ?? 0) > 0;
                          });
                        });
                        setSelectedSize(firstAvailableSize || availableSizes[0]);
                      }
                    }
                  }}
                  disabled={!isAvailable}
                  className={`relative w-12 h-12 border-2 transition-all overflow-hidden ${
                    selectedColor === color.name
                      ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]"
                      : "border-[#e0e0e0] hover:border-[#999]"
                  } ${!isAvailable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  title={color.name}
                >
                  {colorImg ? (
                    <img
                      src={colorImg}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: color.hex }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity and Add to Cart - Full Width */}
      <div className="flex gap-3 mb-3">
        {/* Quantity Selector */}
        <div className="flex items-center border border-[#e0e0e0] h-12">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="w-12 h-full flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= (stockQuantity || 99)}
            className="w-12 h-full flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Cart Button - Full Width */}
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="flex-1 h-12 bg-[#1a1a1a] hover:bg-black text-white text-xs uppercase tracking-widest font-medium rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canAddToCart ? "Adicionar ao carrinho" : "Selecione as opções"}
        </Button>
      </div>

      {/* Buy It Now Button - Full Width */}
      <Button
        onClick={handleBuyNow}
        disabled={!canAddToCart || buyNowLoading}
        variant="outline"
        className="w-full h-12 border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white text-xs uppercase tracking-widest font-medium rounded-none transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buyNowLoading ? "Redirecionando..." : "Comprar agora"}
      </Button>

      {/* Shipping Calculator */}
      <div className="mb-6">
        <ShippingCalculator />
      </div>

      {/* Stock Alert */}
      {stockQuantity <= 0 && selectedVariant && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
          <span>Esgotado</span>
        </div>
      )}

      {/* Trust Badges */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-[#666]">
          <Check className="w-4 h-4 text-[#1a1a1a]" />
          <span>Frete grátis a partir de R$499</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#666]">
          <Check className="w-4 h-4 text-[#1a1a1a]" />
          <span>Pagamento online seguro</span>
        </div>
      </div>

      {/* Pickup Info */}
      <div className="border-t border-[#e0e0e0] pt-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#1a1a1a] font-medium">
              <Store className="w-4 h-4 flex-shrink-0" />
              <span>Retirada disponível na loja</span>
            </div>
          </div>
          <Link
            href="#store-info"
            className="text-[11px] sm:text-xs uppercase tracking-wider text-[#1a1a1a] underline underline-offset-4 hover:text-[#666] font-medium whitespace-nowrap"
          >
            Ver informações da loja
          </Link>
        </div>
      </div>

      {/* Benefits Cards - 2x2 Grid Compact */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 border border-[#e0e0e0]">
          <Truck className="w-4 h-4 text-[#1a1a1a] mb-1.5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#1a1a1a] font-medium text-center leading-tight">
            Envio rápido
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 border border-[#e0e0e0]">
          <RefreshCw className="w-4 h-4 text-[#1a1a1a] mb-1.5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#1a1a1a] font-medium text-center leading-tight">
            Trocas grátis
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 border border-[#e0e0e0]">
          <ShieldCheck className="w-4 h-4 text-[#1a1a1a] mb-1.5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#1a1a1a] font-medium text-center leading-tight">
            Pagamento seguro
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 border border-[#e0e0e0]">
          <RefreshCw className="w-4 h-4 text-[#1a1a1a] mb-1.5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#1a1a1a] font-medium text-center leading-tight">
            Trocas e devoluções
          </span>
        </div>
      </div>

      {/* Size Chart Modal */}
      {sizeChartData && (
        <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
          <DialogContent className="w-[calc(100%-32px)] sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-xl sm:rounded-xl border border-[#e0e0e0] p-0">
            <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-[#e0e0e0]">
              <DialogTitle className="text-sm sm:text-lg font-semibold text-[#1a1a1a] uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
                Guia de Tamanhos
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-[#666] mt-1">
                Confira as medidas para escolher o tamanho ideal
              </DialogDescription>
            </DialogHeader>
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              {sizeChartData.type === "json" ? (
                <div>
                  <table className="w-full text-[11px] sm:text-sm">
                    <thead>
                      <tr>
                        {sizeChartData.headers.map((header, i) => (
                          <th
                            key={i}
                            className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs uppercase tracking-wider font-medium text-[#666] bg-[#f5f5f5] border-b border-[#e0e0e0]"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartData.rows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#f5f5f5]"}
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-2 sm:px-4 py-2 sm:py-3 text-[#1a1a1a] border-b border-[#e0e0e0] text-[11px] sm:text-sm"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className="prose prose-gray max-w-none text-[11px] sm:text-sm text-[#1a1a1a] [&_table]:w-full [&_table]:border-collapse [&_th]:px-2 [&_th]:sm:px-4 [&_th]:py-2 [&_th]:sm:py-3 [&_th]:text-left [&_th]:text-[10px] [&_th]:sm:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:font-medium [&_th]:text-[#666] [&_th]:bg-[#f5f5f5] [&_th]:border-b [&_th]:border-[#e0e0e0] [&_td]:px-2 [&_td]:sm:px-4 [&_td]:py-2 [&_td]:sm:py-3 [&_td]:border-b [&_td]:border-[#e0e0e0] [&_tr:nth-child(even)]:bg-[#f5f5f5]"
                  dangerouslySetInnerHTML={{ __html: sizeChartData.html }}
                />
              )}

              {/* How to measure tip */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg">
                <p className="text-[11px] sm:text-xs text-[#666] leading-relaxed">
                  <span className="font-medium text-[#1a1a1a] uppercase tracking-wider">Como medir:</span>{" "}
                  Use uma fita métrica flexível. Meça rente ao corpo, sem apertar. Em caso de dúvida entre dois tamanhos, escolha o maior.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NewProductDetails;
