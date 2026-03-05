import React from "react";
import Link from "next/link";
import { getProductByHandle, getProducts, getRelatedProducts } from "@/lib/shopify";
import { Product } from "@/lib/shopify";
import NewProductGallery from "@/components/product/NewProductGallery";
import NewProductDetails from "@/components/product/NewProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const productsData = await getProducts({ first: 150 });

  if ("errors" in productsData || !productsData.edges) {
    console.error(
      "Erro ao buscar produtos para generateStaticParams:",
      "errors" in productsData ? productsData.errors : "Edges não encontrados"
    );
    return [];
  }

  return productsData.edges.map((edge: { node: Product }) => ({
    handle: edge.node.handle,
  }));
}

interface ProductPageParams {
  handle: string;
}

export default async function ProductPage({
  params,
}: {
  params: ProductPageParams;
}) {
  const { handle } = params;
  const product = await getProductByHandle(handle, {
    revalidate: 300,
    tags: [`product:${handle}`],
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-4">
            Produto não encontrado
          </h1>
          <p className="text-[#666] mb-8">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#1a1a1a] text-white text-sm uppercase tracking-wider font-medium hover:bg-black transition-colors"
          >
            Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  // Format images
  const images = product.images.edges.map((edge) => ({
    transformedSrc: edge.node.transformedSrc,
    altText: edge.node.altText || product.title,
  }));

  // Format variants with color info
  const variants =
    product.variants?.edges.map((edge) => {
      return {
        ...edge.node,
        colorHex: edge.node.metafield?.value || null,
      };
    }) || [];

  // Map color names to hex values for fallback when metafield is missing
  const colorNameToHex: Record<string, string> = {
    // Português
    "preto": "#000000",
    "branco": "#FFFFFF",
    "vermelho": "#DC2626",
    "azul": "#2563EB",
    "azul marinho": "#1E3A5F",
    "azul claro": "#93C5FD",
    "verde": "#16A34A",
    "verde escuro": "#166534",
    "amarelo": "#EAB308",
    "laranja": "#EA580C",
    "rosa": "#EC4899",
    "roxo": "#9333EA",
    "marrom": "#92400E",
    "cinza": "#6B7280",
    "cinza claro": "#D1D5DB",
    "cinza escuro": "#374151",
    "bege": "#D4C5A9",
    "creme": "#FFFDD0",
    "dourado": "#D4AF37",
    "prata": "#C0C0C0",
    "vinho": "#722F37",
    "bordô": "#800020",
    "nude": "#E8C4A2",
    "caramelo": "#C68E17",
    "terracota": "#CC4E36",
    "cáqui": "#C3B091",
    "off-white": "#FAF9F6",
    "off white": "#FAF9F6",
    // English
    "black": "#000000",
    "white": "#FFFFFF",
    "red": "#DC2626",
    "blue": "#2563EB",
    "navy": "#1E3A5F",
    "green": "#16A34A",
    "yellow": "#EAB308",
    "orange": "#EA580C",
    "pink": "#EC4899",
    "purple": "#9333EA",
    "brown": "#92400E",
    "grey": "#6B7280",
    "gray": "#6B7280",
    "beige": "#D4C5A9",
    "cream": "#FFFDD0",
    "gold": "#D4AF37",
    "silver": "#C0C0C0",
    "burgundy": "#800020",
    "khaki": "#C3B091",
  };

  // Extract unique colors - with smart fallback based on color name
  const colorOptionsMap = new Map<string, string>();
  variants.forEach(
    (variant: {
      selectedOptions: { name: string; value: string }[];
      colorHex: string | null;
    }) => {
      const colorOption = variant.selectedOptions?.find(
        (option: { name: string }) => option.name.toLowerCase() === "cor" || option.name.toLowerCase() === "color"
      );
      if (colorOption && colorOption.value && !colorOptionsMap.has(colorOption.value)) {
        // Use colorHex from metafield, or match by name, or fallback to gray
        const hex = variant.colorHex || colorNameToHex[colorOption.value.toLowerCase()] || "#cccccc";
        colorOptionsMap.set(colorOption.value, hex);
      }
    }
  );

  const uniqueColors = Array.from(colorOptionsMap, ([name, hex]) => ({
    name,
    hex,
  }));
  
  // Extract size chart data from metafields
  const sizeChartMetafield = product.metafields?.find(
    (mf) =>
      mf &&
      mf.namespace === "custom" &&
      (mf.key === "tbl_tam" || mf.key === "tbl-tam") &&
      mf.value &&
      mf.value.trim() !== ""
  );

  let sizeChartData: { type: "json"; headers: string[]; rows: string[][] } | { type: "html"; html: string } | null = null;

  if (sizeChartMetafield) {
    try {
      const parsed = JSON.parse(sizeChartMetafield.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (Array.isArray(parsed[0])) {
          sizeChartData = { type: "json", headers: parsed[0], rows: parsed.slice(1) };
        } else if (typeof parsed[0] === "object") {
          sizeChartData = {
            type: "json",
            headers: Object.keys(parsed[0]),
            rows: parsed.map((row: Record<string, string>) => Object.values(row)),
          };
        }
      }
    } catch {
      // Not JSON — treat as HTML
      sizeChartData = { type: "html", html: sizeChartMetafield.value };
    }
  }

  // Get category info for breadcrumb
  const firstCollection = product.collections?.edges?.[0]?.node;
  const categoryName = firstCollection?.title || product.productType || "Produtos";
  const categoryHandle = firstCollection?.handle || "shop";

  // Fetch related products
  const relatedProducts = await getRelatedProducts(product.id, handle, {
    productType: product.productType,
    collectionHandle: firstCollection?.handle,
    limit: 8,
  });

  return (
    <>
      {/* Breadcrumb - full width with padding */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 pt-[140px] md:pt-[160px]">
        <div className="max-w-[1400px] mx-auto">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-[#666] hover:text-[#1a1a1a]">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3 h-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/shop/${categoryHandle}`}
                    className="text-[#666] hover:text-[#1a1a1a]"
                  >
                    {categoryName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3 h-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#1a1a1a] font-medium truncate max-w-[200px]">
                  {product.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Product Section - Full Width 70/30 Layout */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%]">
          {/* Product Gallery - Left 70% */}
          <div className="order-1">
            <NewProductGallery images={images} />
          </div>

          {/* Product Details - Right 30% with padding, sticky on desktop */}
          <div className="order-2 px-4 sm:px-6 lg:px-6 xl:px-8 py-6 lg:py-0 relative">
            <div className="lg:sticky lg:top-[160px] lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto scrollbar-hide max-w-md mx-auto lg:mx-0">
              <NewProductDetails
                product={product}
                variants={variants}
                uniqueColors={uniqueColors}
                images={images}
                sizeChartData={sizeChartData}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Description / Details Section - Full width */}
      {product.descriptionHtml && (
        <div className="w-full border-t border-[#e0e0e0] mt-12">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
            <div className="max-w-[1400px] mx-auto">
              <h2 className="text-lg font-semibold text-[#1a1a1a] uppercase tracking-wider mb-6">
                Detalhes do produto
              </h2>
              <div
                className="prose prose-gray max-w-none text-sm text-[#666] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Specifications Section - Full width */}
      {(() => {
        const visibleMetafields = (product.metafields || []).filter(
          (metafield) =>
            metafield &&
            metafield.value &&
            metafield.value.trim() !== "" &&
            (metafield.namespace === "custom" ||
              metafield.namespace === "specs") &&
            ![
              "use custom rem base",
              "rem base font size",
              "html mobile",
              "mobile font size",
              "mobile html url",
              "tbl tam",
              "tbl-tam",
            ].includes(
              metafield.key
                .toLowerCase()
                .replace(/[._-]/g, " ")
                .replace(/\s+/g, " ")
                .trim()
            )
        );
        if (visibleMetafields.length === 0) return null;
        return (
          <div className="w-full border-t border-[#e0e0e0]">
            <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
              <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleMetafields.map((metafield) => (
                    <div
                      key={`${metafield.namespace}-${metafield.key}`}
                      className="flex flex-col sm:flex-row py-3 border-b border-[#e0e0e0]"
                    >
                      <span className="text-xs uppercase tracking-wider text-[#666] font-medium w-full sm:w-1/3 mb-1 sm:mb-0">
                        {metafield.key
                          .replace(/[._-]/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-[#1a1a1a] w-full sm:w-2/3">
                        {metafield.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Related Products Section */}
      <RelatedProducts products={relatedProducts} />
    </>
  );
}
