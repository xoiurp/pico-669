"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroBannerConfig } from "@/types/banner";

const defaults: HeroBannerConfig = {
  backgroundImage: "/assets/images/banner-hero-section 1.webp",
  overlayGradient: "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.1), transparent)",
  title: "SALE ATÉ 50% OFF",
  titleFontSize: "72",
  subtitle: "FRETE GRÁTIS EM COMPRAS ACIMA DE R$500\n6X SEM JUROS",
  subtitleFontSize: "16",
  button: {
    text: "Descubra mais",
    link: "/shop",
    bgColor: "transparent",
    textColor: "#ffffff",
    borderColor: "#ffffff",
    style: "outline",
    fontSize: "12",
  },
};

interface HeroSectionProps {
  config?: HeroBannerConfig | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ config: cfg }) => {
  const c = { ...defaults, ...cfg, button: { ...defaults.button, ...cfg?.button } };

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={c.backgroundImage}
          alt="Banner principal"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          unoptimized
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: c.overlayGradient }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
        <div className="mt-auto mb-auto md:mt-auto md:mb-40 animate-fade-in">
          <h1
            className="font-light tracking-tight mb-4 sm:mb-6"
            style={{ fontSize: `clamp(2.5rem, 5vw, ${Number(c.titleFontSize) / 16}rem)` }}
          >
            {c.title}
          </h1>

          <p
            className="tracking-[0.2em] uppercase mb-8 sm:mb-10 opacity-90 whitespace-pre-line"
            style={{ fontSize: `clamp(0.75rem, 1.5vw, ${Number(c.subtitleFontSize) / 16}rem)` }}
          >
            {c.subtitle}
          </p>

          <Link
            href={c.button.link}
            className="inline-block px-8 sm:px-10 py-3 sm:py-4 tracking-[0.3em] uppercase font-medium hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: c.button.bgColor,
              color: c.button.textColor,
              borderWidth: "1px",
              borderColor: c.button.borderColor,
              fontSize: `${c.button.fontSize}px`,
            }}
          >
            {c.button.text}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
