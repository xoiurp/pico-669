import React from "react";
import {
  getProductsByCollection,
  getCollections,
  Collection,
  CollectionWithProductsPage,
  ShopifyFetchOptions,
  Product,
  PageInfo,
  GetProductsByCollectionParams,
  ShopifyProductPriceFilter,
} from "../../../lib/shopify";
import ShopProductList from "../../../components/shop/ShopProductList";
import ShopHero from "../../../components/shop/ShopHero";
import ShopSortSelect from "../../../components/shop/ShopSortSelect";
import ShopFilterDrawer from "../../../components/shop/ShopFilterDrawer";
import ActiveFilterChips from "../../../components/shop/ActiveFilterChips";

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

// Get price filter object from parameter
const getPriceFilterObjectFromParam = (
  priceRangeParam?: string | string[]
): ShopifyProductPriceFilter | undefined => {
  const priceRangeValue = Array.isArray(priceRangeParam) ? priceRangeParam[0] : priceRangeParam;

  if (!priceRangeValue || priceRangeValue === "any") {
    return undefined;
  }

  const filter: ShopifyProductPriceFilter = { price: {} };

  switch (priceRangeValue) {
    case "0-500":
      filter.price.max = 500;
      break;
    case "500-1000":
      filter.price.min = 500;
      filter.price.max = 1000;
      break;
    case "1000-2000":
      filter.price.min = 1000;
      filter.price.max = 2000;
      break;
    case "2000+":
      filter.price.min = 2000;
      break;
    default:
      return undefined;
  }
  return filter;
};

// Generate static params for all collections
export async function generateStaticParams() {
  const collections = await getCollections();

  if (!collections || collections.length === 0) {
    return [];
  }

  return collections.map((collection: Collection) => ({
    category: collection.handle,
  }));
}

interface CategoryPageProps {
  params: { category: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = params;
  const afterCursor =
    typeof searchParams?.after === "string" ? searchParams.after : null;
  const beforeCursor =
    typeof searchParams?.before === "string" ? searchParams.before : null;

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
  const priceFilterObject = getPriceFilterObjectFromParam(priceRangeParam);

  // Fetch category data
  const categoryCacheOptions: ShopifyFetchOptions["next"] = {
    revalidate: 60,
    tags: [`collection:${category}`, "products"],
  };

  let productParams: GetProductsByCollectionParams = {
    collectionHandle: category,
    first: ITEMS_PER_PAGE,
    sortKey: initialSortKey,
    reverse: initialReverse,
    filters: priceFilterObject ? [priceFilterObject] : undefined,
    tags: tagsForApi,
  };

  if (afterCursor) {
    productParams.after = afterCursor;
  }

  const categoryData: CollectionWithProductsPage | null = await getProductsByCollection(
    productParams,
    categoryCacheOptions
  );

  const collectionCacheOptions: ShopifyFetchOptions["next"] = {
    revalidate: 3600,
    tags: ["collections"],
  };
  const collections: Collection[] = await getCollections(collectionCacheOptions);

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
          <p className="mb-8 text-[#666]">
            A categoria que você está procurando não existe ou foi removida.
          </p>
          <a
            href="/shop"
            className="inline-block bg-[#1a1a1a] text-white py-3 px-8 text-xs tracking-[0.15em] uppercase font-medium hover:bg-gray-800 transition-colors"
          >
            Voltar para a loja
          </a>
        </div>
      </div>
    );
  }

  const initialProducts: Product[] = categoryData.products.edges.map((edge) => edge.node);
  const initialPageInfo: PageInfo = categoryData.products.pageInfo;

  // Extract unique tags from all products
  const allTags = initialProducts.flatMap((product) => product.tags || []);
  const uniqueTags = Array.from(new Set(allTags)).sort();

  // Prepare baseQuery for ProductList
  const baseQueryForProductList: Record<string, string | boolean> = {};
  if (initialSortKey) baseQueryForProductList.sortKey = initialSortKey;
  if (initialReverse !== undefined)
    baseQueryForProductList.reverse = initialReverse;
  if (priceRangeParam) {
    baseQueryForProductList.priceRange = Array.isArray(priceRangeParam)
      ? priceRangeParam[0]
      : priceRangeParam;
  }
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
        title={categoryData.title}
        subtitle={categoryData.description || `Explore nossa coleção de ${categoryData.title}`}
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "SHOP", href: "/shop" },
          { label: categoryData.title.toUpperCase(), href: `/shop/${category}` },
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
                currentCategoryHandle={category}
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
          <ActiveFilterChips currentCategoryHandle={category} />
        </div>

        {/* Product Grid */}
        <main className="min-w-0">
          {initialProducts.length > 0 ? (
            <ShopProductList
              initialProducts={initialProducts}
              initialPageInfo={initialPageInfo || { hasNextPage: false, endCursor: null }}
              baseQuery={baseQueryForProductList}
              collectionHandle={category}
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
