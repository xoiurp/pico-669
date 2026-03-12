"use client";

import React from "react";
import Link from "next/link";

interface ShopHeroProps {
  title?: string;
  subtitle?: string;
  breadcrumb?: {
    label: string;
    href: string;
  }[];
  backgroundImage?: string;
}

const ShopHero: React.FC<ShopHeroProps> = ({
  title = "New Collection",
  subtitle = "Step into the season with our latest designs, blending comfort and style effortlessly. Explore premium quality pieces perfect for any occasion, available in fresh colors and modern fits.",
  breadcrumb = [
    { label: "HOME", href: "/" },
    { label: "NEW COLLECTION", href: "/shop" },
  ],
  backgroundImage = "/assets/images/banner-hero-section 1.webp",
}) => {
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[580px] lg:min-h-[620px] flex items-center justify-center overflow-hidden bg-[#0a0a0a] pt-[100px] md:pt-[120px]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${encodeURI(backgroundImage)})`,
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-16 md:py-20">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center justify-center gap-2 text-[11px] sm:text-xs tracking-[0.15em] text-white/70">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-white/40">/</span>
                )}
                {index === breadcrumb.length - 1 ? (
                  <span className="text-white font-medium">{item.label}</span>
                ) : (
                  <Link 
                    href={item.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide mb-6">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
          {subtitle}
        </p>
      </div>


    </section>
  );
};

export default ShopHero;
