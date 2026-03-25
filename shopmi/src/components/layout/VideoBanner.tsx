"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { VideoBannerConfig } from "@/types/banner";

const defaults: VideoBannerConfig = {
  videoUrl: "https://cdn.shopify.com/videos/c/o/v/23161f90de4d40578eed3144dc5cf372.mp4",
  overlayOpacity: 20,
  tagline: "Nova temporada",
  taglineFontSize: "10",
  title: "Transforme seu estilo nesta estação",
  titleItalicWord: "estilo",
  titleFontSize: "60",
  primaryButton: {
    text: "Comprar agora",
    link: "/shop",
    bgColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#ffffff",
    style: "filled",
    fontSize: "12",
  },
  secondaryButton: {
    text: "Explorar",
    link: "/shop",
    bgColor: "transparent",
    textColor: "#ffffff",
    borderColor: "#ffffff",
    style: "outline",
    fontSize: "12",
  },
  saleBar: {
    enabled: true,
    title: "Liquidação, ao vivo agora",
    titleFontSize: "24",
    buttonText: "Explorar",
    buttonLink: "/shop",
    countdownTargetDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center bg-[#1a1a1a] rounded-sm w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20">
      <span className="text-xl sm:text-2xl md:text-3xl font-light text-white">
        {formatNumber(value)}
      </span>
      <span className="text-[8px] sm:text-[9px] tracking-wider uppercase text-[#999]">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <TimeBox value={timeLeft.days} label="Dias" />
      <TimeBox value={timeLeft.hours} label="Horas" />
      <TimeBox value={timeLeft.minutes} label="Min" />
      <TimeBox value={timeLeft.seconds} label="Seg" />
    </div>
  );
};

interface VideoBannerProps {
  config?: VideoBannerConfig | null;
}

const VideoBanner: React.FC<VideoBannerProps> = ({ config: cfg }) => {
  const c = {
    ...defaults,
    ...cfg,
    primaryButton: { ...defaults.primaryButton, ...cfg?.primaryButton },
    secondaryButton: { ...defaults.secondaryButton, ...cfg?.secondaryButton },
    saleBar: { ...defaults.saleBar, ...cfg?.saleBar },
  };

  // Render title with italic word
  function renderTitle() {
    if (!c.titleItalicWord) return c.title;
    const parts = c.title.split(c.titleItalicWord);
    if (parts.length < 2) return c.title;
    return (
      <>
        {parts[0]}
        <span className="italic">{c.titleItalicWord}</span>
        {parts[1]}
      </>
    );
  }

  return (
    <section className="w-full">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={c.videoUrl} type="video/mp4" />
        </video>

        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${c.overlayOpacity / 100})` }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <p
            className="tracking-[0.3em] uppercase mb-3 sm:mb-4 opacity-80"
            style={{ fontSize: `${c.taglineFontSize}px` }}
          >
            {c.tagline}
          </p>

          <h2
            className="font-light tracking-tight mb-6 sm:mb-8"
            style={{ fontSize: `clamp(1.875rem, 4vw, ${Number(c.titleFontSize) / 16}rem)` }}
          >
            {renderTitle()}
          </h2>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={c.primaryButton.link}
              className="px-6 sm:px-8 py-2.5 sm:py-3 tracking-[0.15em] uppercase font-medium transition-colors"
              style={{
                backgroundColor: c.primaryButton.bgColor,
                color: c.primaryButton.textColor,
                borderWidth: "1px",
                borderColor: c.primaryButton.borderColor,
                fontSize: `${c.primaryButton.fontSize}px`,
              }}
            >
              {c.primaryButton.text}
            </Link>
            <Link
              href={c.secondaryButton.link}
              className="px-6 sm:px-8 py-2.5 sm:py-3 tracking-[0.15em] uppercase font-medium hover:bg-white hover:text-black transition-colors"
              style={{
                backgroundColor: c.secondaryButton.bgColor,
                color: c.secondaryButton.textColor,
                borderWidth: "1px",
                borderColor: c.secondaryButton.borderColor,
                fontSize: `${c.secondaryButton.fontSize}px`,
              }}
            >
              {c.secondaryButton.text}
            </Link>
          </div>
        </div>
      </div>

      {c.saleBar.enabled && (
        <div className="w-full bg-black">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                <h3
                  className="font-light text-white"
                  style={{ fontSize: `clamp(1.25rem, 2vw, ${Number(c.saleBar.titleFontSize) / 16}rem)` }}
                >
                  {c.saleBar.title}
                </h3>
                <Link
                  href={c.saleBar.buttonLink}
                  className="px-5 py-2 border border-white/60 text-white text-[9px] sm:text-[10px] tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors"
                >
                  {c.saleBar.buttonText}
                </Link>
              </div>

              <CountdownTimer targetDate={c.saleBar.countdownTargetDate} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoBanner;
