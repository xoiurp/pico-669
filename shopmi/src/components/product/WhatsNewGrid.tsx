"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Collection, getProductsByCollection } from "../../lib/shopify";

// IDs das coleções para cada aba
const TABS_CONFIG = [
  { 
    id: "calcas", 
    label: "Calças", 
    collectionId: "272614424641"
  },
  { 
    id: "acessorios", 
    label: "Acessórios", 
    collectionId: "272614195265"
  },
  { 
    id: "tops", 
    label: "Tops", 
    collectionId: "272614457409"
  },
];

interface WhatsNewGridProps {
  collections: Collection[];
}

const WhatsNewGrid: React.FC<WhatsNewGridProps> = ({ collections }) => {
  const [activeTab, setActiveTab] = useState("calcas");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Encontrar o handle da coleção ativa baseado no ID
  const activeTabConfig = TABS_CONFIG.find((tab) => tab.id === activeTab);
  const activeCollection = collections.find(c => 
    c.id.includes(activeTabConfig?.collectionId || "")
  );
  const activeHandle = activeCollection?.handle;

  const fetchProducts = useCallback(async () => {
    if (!activeHandle) {
      console.log("[WhatsNewGrid] No handle found for tab:", activeTab);
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("[WhatsNewGrid] Fetching products for handle:", activeHandle);
      const data = await getProductsByCollection({
        collectionHandle: activeHandle,
        first: 4,
      });

      if (data?.products?.edges) {
        setProducts(data.products.edges.map((edge) => edge.node));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("[WhatsNewGrid] Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeHandle, activeTab]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const displayProducts = products.slice(0, 4);

  return (
    <section className="w-full py-12 sm:py-16 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-gray-500 mb-4">
            What&apos;s New
          </p>

          {/* Tabs */}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {TABS_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight transition-colors ${
                  activeTab === tab.id
                    ? "text-gray-900"
                    : "text-gray-300 hover:text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Loading State */}
          {loading && (
            <motion.div
              key={`loading-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 mb-4" />
                  <div className="h-4 bg-gray-200 w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 w-1/4" />
                </div>
              ))}
            </motion.div>
          )}

          {/* Products Grid */}
          {!loading && displayProducts.length > 0 && (
            <motion.div
              key={`products-${activeTab}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayProducts.map((product) => {
                  const price = product.priceRange?.minVariantPrice?.amount;
                  const currency = product.priceRange?.minVariantPrice?.currencyCode;
                  const image = product.images?.edges?.[0]?.node;
                  const compareAtPrice =
                    product.variants?.edges?.[0]?.node?.compareAtPrice?.amount;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.handle}`}
                      className="group block cursor-pointer"
                    >
                      {/* Badge */}
                      <div className="relative">
                        {compareAtPrice && (
                          <span className="absolute top-3 left-3 z-10 text-[9px] tracking-wider uppercase bg-black text-white px-2 py-1">
                            Last Few
                          </span>
                        )}

                        {/* Image Container */}
                        <div className="relative aspect-[3/4] bg-white overflow-hidden mb-4">
                          {image ? (
                            <Image
                              src={image.transformedSrc || image.originalSrc || ""}
                              alt={image.altText || product.title}
                              fill
                              className="object-contain object-center group-hover:scale-105 transition-transform duration-500 p-4"
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg
                                className="w-12 h-12"
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
                      </div>

                      {/* Product Info */}
                      <div className="space-y-1">
                        <h3 className="text-[10px] sm:text-[11px] tracking-wide uppercase text-gray-900 font-medium leading-tight">
                          {product.title}
                        </h3>

                        <div className="flex items-center gap-2">
                          {compareAtPrice && (
                            <span className="text-[10px] text-gray-400 line-through">
                              {currency === "BRL" ? "R$" : currency}{" "}
                              {parseFloat(compareAtPrice).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          )}
                          <span className="text-[10px] sm:text-xs text-gray-900 font-medium">
                            {currency === "BRL" ? "R$" : currency}{" "}
                            {price
                              ? parseFloat(price).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })
                              : "0,00"}
                          </span>
                        </div>

                        <p className="text-[9px] text-gray-400">
                          Available in {product.variants?.edges?.length || 1} size
                          {(product.variants?.edges?.length || 1) > 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* View All */}
              <div className="text-center mt-10">
                <Link
                  href={activeHandle ? `/shop/${activeHandle}` : "/shop"}
                  className="inline-block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-900 border-b border-gray-900 hover:border-gray-500 hover:text-gray-500 transition-colors pb-0.5"
                >
                  View All
                </Link>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && displayProducts.length === 0 && (
            <motion.div
              key={`empty-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12"
            >
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default WhatsNewGrid;
