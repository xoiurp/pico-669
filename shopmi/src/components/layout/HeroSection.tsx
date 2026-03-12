"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/banner-hero-section 1.webp"
          alt="Banner principal PICO - Coleção Verão 2026"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          unoptimized
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        {/* Main Content - Bottom aligned */}
        <div className="mt-auto mb-24 sm:mb-32 md:mb-40 animate-fade-in">
          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight mb-4 sm:mb-6">
            SALE ATÉ 50% OFF
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg tracking-[0.2em] uppercase mb-8 sm:mb-10 opacity-90">
            FRETE GRÁTIS EM COMPRAS ACIMA DE R$500
            <br />
            6X SEM JUROS
          </p>

          {/* CTA Button */}
          <Link
            href="/shop"
            className="inline-block px-8 sm:px-10 py-3 sm:py-4 border border-white/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
          >
            Descubra mais
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
