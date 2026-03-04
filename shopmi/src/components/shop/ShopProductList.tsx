"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Product, PageInfo } from "@/lib/shopify";
import ShopProductCard from "./ShopProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface ShopProductListProps {
  initialProducts: Product[];
  initialPageInfo: PageInfo;
  baseQuery?: Record<string, any>;
  collectionHandle?: string;
}

// Limite de produtos carregados automaticamente pelo infinite scroll
const AUTO_LOAD_LIMIT = 24;

const ShopProductList: React.FC<ShopProductListProps> = ({
  initialProducts,
  initialPageInfo,
  baseQuery = {},
  collectionHandle,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  // Guard: track the last fetched cursor to prevent duplicate requests
  const fetchedCursorsRef = useRef<Set<string>>(new Set());

  const hasMoreProducts = pageInfo?.hasNextPage ?? false;
  // Infinite scroll automático apenas até AUTO_LOAD_LIMIT produtos
  const shouldAutoLoad = products.length < AUTO_LOAD_LIMIT;
  // Após o limite, mostrar botão manual
  const showLoadMoreButton = hasMoreProducts && !shouldAutoLoad && !loading;

  // Serialize baseQuery to a stable string so it can be used in dependency arrays
  // without causing unnecessary re-renders from new object references
  const stableBaseQuery = useMemo(
    () => JSON.stringify(baseQuery),
    [JSON.stringify(baseQuery)]
  );

  // Update state when props change (filters/sort changed on server)
  useEffect(() => {
    setProducts(initialProducts);
    setPageInfo(initialPageInfo);
    // Reset fetched cursors when initial data changes
    fetchedCursorsRef.current = new Set();
  }, [initialProducts, initialPageInfo]);

  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMoreProducts || !pageInfo?.endCursor) {
      return;
    }

    // Guard: skip if this cursor was already fetched
    if (fetchedCursorsRef.current.has(pageInfo.endCursor)) {
      return;
    }
    fetchedCursorsRef.current.add(pageInfo.endCursor);

    setLoading(true);
    setError(null);

    try {
      const parsedBaseQuery = JSON.parse(stableBaseQuery);
      const params = new URLSearchParams({
        after: pageInfo.endCursor,
        ...parsedBaseQuery,
      });

      let apiUrl = "/api/products";
      if (collectionHandle) {
        apiUrl = `/api/collections/${collectionHandle}/products`;
      }

      const response = await fetch(`${apiUrl}?${params.toString()}`);
      if (!response.ok) {
        // Remove cursor from guard so it can be retried
        fetchedCursorsRef.current.delete(pageInfo.endCursor!);
        throw new Error(
          `Erro ao buscar mais produtos: ${response.statusText} (URL: ${apiUrl}?${params.toString()})`
        );
      }
      const data = await response.json();

      if (data.errors) {
        fetchedCursorsRef.current.delete(pageInfo.endCursor!);
        throw new Error(
          data.errors[0]?.message || "Erro desconhecido ao buscar produtos."
        );
      }

      const newProducts: Product[] = data.productsConnection?.edges?.map(
        (edge: { node: Product }) => edge.node
      ) || [];

      // Deduplicate: only add products not already in the list
      setProducts((prevProducts) => {
        const existingIds = new Set(prevProducts.map((p) => p.id));
        const uniqueNewProducts = newProducts.filter((p) => !existingIds.has(p.id));
        return [...prevProducts, ...uniqueNewProducts];
      });
      setPageInfo(data.productsConnection?.pageInfo || { hasNextPage: false, endCursor: null });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreProducts, pageInfo?.endCursor, stableBaseQuery, collectionHandle]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    // Só ativa o infinite scroll automático se estiver abaixo do limite
    if (!shouldAutoLoad) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts && !loading && shouldAutoLoad) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadMoreProducts, hasMoreProducts, loading, shouldAutoLoad]);

  // Check if product is pre-order based on tags
  const isPreOrder = (product: Product): boolean => {
    return product.tags?.some((tag) =>
      tag.toLowerCase().includes("pre-order") ||
      tag.toLowerCase().includes("preorder") ||
      tag.toLowerCase().includes("pré-venda") ||
      tag.toLowerCase().includes("prevenda")
    ) || false;
  };

  // Extract colors from product variants
  const extractColors = (product: Product): string[] => {
    if (!product.variants?.edges) return [];
    
    const colors = product.variants.edges
      .map((edge) => {
        if (!edge?.node) return null;
        
        // Try to get color from metafield
        const metafieldColor = edge.node.metafield?.value;
        if (metafieldColor) return metafieldColor;
        
        // Try to extract from variant title (e.g., "T-Shirt / Red" -> "Red")
        const variantTitle = edge.node.title;
        if (variantTitle && typeof variantTitle === 'string') {
          const titleParts = variantTitle.split("/");
          if (titleParts.length > 1) {
            return titleParts[titleParts.length - 1].trim();
          }
        }
        
        return null;
      })
      .filter((color): color is string => typeof color === "string");
    
    // Remove duplicates
    return Array.from(new Set(colors));
  };

  return (
    <div>
      {/* Grid: 1 col mobile, 2 cols sm, 3 cols md, 4 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 lg:gap-6">
        {products.map((product) => {
          const colors = extractColors(product);
          const availableForSale = product.variants?.edges.some(
            (edge) => edge?.node?.availableForSale
          ) ?? true;

          // Extract variants and options
          const variants = product.variants?.edges.map((edge) => ({
            id: edge.node.id,
            title: edge.node.title,
            price: edge.node.price,
            compareAtPrice: edge.node.compareAtPrice,
            availableForSale: edge.node.availableForSale ?? true, // Default para true se não vier da API
            quantityAvailable: edge.node.quantityAvailable ?? 99, // Default se não vier
            selectedOptions: edge.node.selectedOptions || [],
          })) || [];

          const options = product.options?.map((opt) => ({
            name: opt.name,
            values: opt.values,
          })) || [];

          const images = product.images?.edges.map((edge) => ({
            transformedSrc: edge.node.transformedSrc,
          })) || [];

          return (
            <ShopProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              handle={product.handle}
              price={{
                amount: product.priceRange.minVariantPrice.amount,
                currencyCode: product.priceRange.minVariantPrice.currencyCode,
              }}
              compareAtPrice={
                product.variants?.edges[0]?.node.compareAtPrice || undefined
              }
              image={{
                transformedSrc:
                  product.images.edges[0]?.node.transformedSrc || "",
                altText: product.images.edges[0]?.node.altText || product.title,
              }}
              images={images}
              colors={colors}
              availableForSale={availableForSale}
              isPreOrder={isPreOrder(product)}
              variants={variants}
              options={options}
            />
          );
        })}
        
        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={`skeleton-loading-${index}`} />
          ))}
      </div>

      {/* Infinite scroll observer - só ativo até o limite */}
      {shouldAutoLoad && (
        <div
          ref={loadMoreRef}
          className="h-4 mt-8"
        >
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm text-[#999]">Carregando mais produtos...</p>
            </div>
          )}
        </div>
      )}

      {/* Botão manual após o limite de auto-load */}
      {showLoadMoreButton && (
        <div className="flex justify-center mt-10 mb-4">
          <button
            onClick={loadMoreProducts}
            className="px-10 py-3.5 border border-[#1a1a1a] text-[#1a1a1a] text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#1a1a1a] hover:text-white transition-colors"
          >
            Carregar mais produtos
          </button>
        </div>
      )}

      {/* Loading ao clicar no botão manual */}
      {loading && !shouldAutoLoad && (
        <div className="text-center py-4">
          <p className="text-sm text-[#999]">Carregando mais produtos...</p>
        </div>
      )}

      {/* Mensagem quando não há mais produtos */}
      {!hasMoreProducts && products.length > AUTO_LOAD_LIMIT && (
        <div className="text-center mt-10 mb-4">
          <p className="text-xs text-[#999] uppercase tracking-[0.15em]">
            Todos os produtos foram carregados
          </p>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500">
          <p className="text-sm">Erro ao carregar produtos: {error}</p>
        </div>
      )}
    </div>
  );
};

export default ShopProductList;
