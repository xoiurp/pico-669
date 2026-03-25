"use client";

import { useEffect, useState } from "react";
import HeroSection from "../components/layout/HeroSection";
import JustArrivedGrid from "../components/product/JustArrivedGrid";
import CollectionBanners from "../components/layout/CollectionBanners";
import SpecialCollections from "../components/layout/SpecialCollections";
import ContemporaryBanner from "../components/layout/ContemporaryBanner";
import WhatsNewGrid from "../components/product/WhatsNewGrid";
import VideoBanner from "../components/layout/VideoBanner";
import ItemOfTheWeek from "../components/product/ItemOfTheWeek";
import Testimonials from "../components/layout/Testimonials";
import { getProducts, getCollections, Product, Collection } from "../lib/shopify";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bannerConfigs, setBannerConfigs] = useState<Record<string, unknown>>({});

  useEffect(() => {
    async function fetchData() {
      const prodsData = await getProducts({ first: 12 });
      const colls = await getCollections();
      if (prodsData && prodsData.edges) {
        setProducts(prodsData.edges.map((edge) => edge.node));
      } else {
        setProducts([]);
      }
      setCollections(colls);
    }

    async function fetchBannerConfigs() {
      try {
        const res = await fetch("/api/banners");
        if (res.ok) {
          const data = await res.json();
          const configMap: Record<string, unknown> = {};
          data.forEach((b: { slug: string; config: unknown }) => {
            configMap[b.slug] = b.config;
          });
          setBannerConfigs(configMap);
        }
      } catch {
        // Fallback to defaults if API fails
      }
    }

    fetchData();
    fetchBannerConfigs();
  }, []);

  return (
    <>
      {/* Hero Section - Full Screen */}
      <HeroSection config={bannerConfigs["hero"] as any} />

      {/* Just Arrived - Product Grid Minimalista */}
      <JustArrivedGrid products={products} />

      {/* Collection Banners - Grid Layout */}
      <CollectionBanners
        collections={collections}
        config={bannerConfigs["collection-banners"] as any}
      />

      {/* Special Collections - 3 Columns */}
      <SpecialCollections collections={collections} />

      {/* Contemporary Banner - Split Screen */}
      <ContemporaryBanner
        collection={collections.find((c) => c.id.includes("272613802049"))}
        config={bannerConfigs["contemporary-banner"] as any}
      />

      {/* What's New - Product Grid with Tabs */}
      <WhatsNewGrid collections={collections} />

      {/* Video Banner with Countdown */}
      <VideoBanner config={bannerConfigs["video-banner"] as any} />

      <ItemOfTheWeek product={products[0] || null} />

      {/* Testimonials */}
      <Testimonials />
    </>
  );
}
