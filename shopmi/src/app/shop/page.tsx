import React from "react";
import {
  getProducts,
  getCollections,
  ProductsConnection,
  ShopifyFetchOptions,
  Product,
  PageInfo,
  Collection,
} from "../../lib/shopify";
import ShopProductList from "../../components/shop/ShopProductList";
import ShopHero from "../../components/shop/ShopHero";
import ShopSortSelect from "../../components/shop/ShopSortSelect";
import ShopFilterDrawer from "../../components/shop/ShopFilterDrawer";
import ActiveFilterChips from "../../components/shop/ActiveFilterChips";

const ITEMS_PER_PAGE = 12;

export const revalidate = 60;

// Map sort parameter to sortKey and reverse
const getSortOptionsFromParam = (
  sortParam?: string | string[]
): { sortKey?: string; reverse?: boolean } => {
  const sortValue = Array.isArray(sortParam) ? sortParam[0] : sortParam;
  switch (sortValue) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "name-asc":
      return { sortKey: "TITLE", reverse: false };
    case "name-desc":
      return { sortKey: "TITLE", reverse: true };
    case "created-desc":
      return { sortKey: "CREATED_AT", reverse: true };
    case "created-asc":
      return { sortKey: "CREATED_AT", reverse: false };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "featured":
    default:
      return { sortKey: "RELEVANCE", reverse: false };
  }
};

// Get price query from parameter
const getPriceQueryFromParam = (
  priceRangeParam?: string | string[]
): string | undefined => {
  const priceRangeValue = Array.isArray(priceRangeParam)
    ? priceRangeParam[0]
    : priceRangeParam;
  if (!priceRangeValue || priceRangeValue === "any") {
    return undefined;
  }
  const parts = priceRangeValue.split("-");
  if (parts.length === 2) {
    if (parts[0] === "0") return `variants.price:<=${parts[1]}`;
    if (parts[1] === undefined || parts[1] === "+")
      return `variants.price:>=${parts[0]}`;
    return `(variants.price:>=${parts[0]} AND variants.price:<=${parts[1]})`;
  } else if (priceRangeValue.endsWith("+")) {
    const min = priceRangeValue.slice(0, -1);
    return `variants.price:>=${min}`;
  }
  return undefined;
};

interface ShopPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const afterCursor =
    typeof searchParams?.after === "string" ? searchParams.after : null;
  const beforeCursor =
    typeof searchParams?.before === "string" ? searchParams.before : null;

  interface ProductRequestParams {
    first?: number;
    last?: number;
    after?: string | null;
    before?: string | null;
    sortKey?: string;
    reverse?: boolean;
    query?: string;
    tags?: string[];
  }

  const sortParam = searchParams?.sort;
  const priceRangeParam = searchParams?.priceRange;

  // Read tags parameter
  const tagsParamValue = searchParams?.tag;
  let tagsForApi: string[] | undefined = undefined;
  if (typeof tagsParamValue === "string") {
    tagsForApi = [tagsParamValue];
  } else if (Array.isArray(tagsParamValue)) {
    tagsForApi = tagsParamValue;
  }

  const { sortKey: initialSortKey, reverse: initialReverse } =
    getSortOptionsFromParam(sortParam);
  const priceQuery = getPriceQueryFromParam(priceRangeParam);

  let effectiveSortKey = initialSortKey;
  let effectiveReverse = initialReverse;

  // If price filter is active and default sort is RELEVANCE,
  // change to explicit sorting (e.g., Price ASC) to ensure price filter works
  if (priceQuery && effectiveSortKey === "RELEVANCE") {
    effectiveSortKey = "PRICE";
    effectiveReverse = false;
  }

  let productParams: ProductRequestParams = {
    first: ITEMS_PER_PAGE,
    sortKey: effectiveSortKey,
    reverse: effectiveReverse,
    query: priceQuery,
    tags: tagsForApi,
  };

  if (afterCursor) {
    productParams.after = afterCursor;
    delete productParams.before;
    delete productParams.last;
  } else if (beforeCursor) {
    const baseParamsForPagination = {
      sortKey: effectiveSortKey,
      reverse: effectiveReverse,
      query: priceQuery,
      tags: tagsForApi,
    };
    productParams = {
      last: ITEMS_PER_PAGE,
      before: beforeCursor,
      ...baseParamsForPagination,
    };
    delete productParams.first;
    delete productParams.after;
  }

  const productCacheOptionsTest: ShopifyFetchOptions = { cache: "no-store" };
  const productData: ProductsConnection = await getProducts(
    productParams,
    productCacheOptionsTest
  );

  const collectionCacheOptions: ShopifyFetchOptions["next"] = {
    revalidate: 3600,
    tags: ["collections"],
  };
  const collections: Collection[] = await getCollections(collectionCacheOptions);

  const initialProducts: Product[] = productData.edges.map((edge) => edge.node);
  const initialPageInfo: PageInfo = productData.pageInfo;

  // Extract unique tags from all products
  const allTags = initialProducts.flatMap((product) => product.tags || []);
  const uniqueTags = Array.from(new Set(allTags)).sort();

  // Prepare baseQuery for ProductList
  const baseQueryForProductList: Record<string, string | boolean> = {};
  if (effectiveSortKey) baseQueryForProductList.sortKey = effectiveSortKey;
  if (effectiveReverse !== undefined)
    baseQueryForProductList.reverse = effectiveReverse;
  if (priceQuery) baseQueryForProductList.query = priceQuery;
  if (tagsParamValue) {
    baseQueryForProductList.tags = Array.isArray(tagsParamValue)
      ? tagsParamValue.join(",")
      : tagsParamValue;
  }
  baseQueryForProductList.first = String(ITEMS_PER_PAGE);

  // Total products count
  const totalProducts = initialProducts.length + (initialPageInfo?.hasNextPage ? "+" : "");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ShopHero
        title="Shop"
        subtitle="Explore todos os nossos produtos. Peças de qualidade premium perfeitas para qualquer ocasião, disponíveis em novas cores e modelagens modernas."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "SHOP", href: "/shop" },
        ]}
      />

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filters Bar */}
        <div className="mb-6 pb-6 border-b border-[#e0e0e0] space-y-4">
          {/* Row 1: Filter button + Results count + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Filter button + count */}
            <div className="flex items-center gap-4">
              <ShopFilterDrawer
                collections={collections}
                currentCategoryHandle={undefined}
                currentPriceRange={Array.isArray(priceRangeParam) ? priceRangeParam[0] : priceRangeParam}
                categoryTags={uniqueTags}
                totalProducts={initialProducts.length}
              />
              <div className="text-xs text-[#666]">
                <span className="text-[#1a1a1a] font-medium">
                  Exibindo {initialProducts.length}
                </span>
                <span> de </span>
                <span className="text-[#1a1a1a] font-medium">
                  {totalProducts} produtos
                </span>
              </div>
            </div>

            {/* Right: Sort */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-[#666] uppercase tracking-wide">
                Ordenar por:
              </span>
              <ShopSortSelect
                initialSortValue={
                  Array.isArray(sortParam) ? sortParam[0] : sortParam
                }
              />
            </div>
          </div>

          {/* Row 2: Active filter chips */}
          <ActiveFilterChips />
        </div>

        {/* Product Grid */}
        <main className="min-w-0">
          {initialProducts.length > 0 ? (
            <ShopProductList
              initialProducts={initialProducts}
              initialPageInfo={initialPageInfo || { hasNextPage: false, endCursor: null }}
              baseQuery={baseQueryForProductList}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-[#999] text-base">
                Nenhum produto encontrado para os filtros selecionados.
              </p>
              <p className="text-[#999] text-sm mt-2">
                Tente ajustar seus filtros ou navegue por todos os produtos.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
