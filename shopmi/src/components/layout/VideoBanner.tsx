"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 31,
    hours: 13,
    minutes: 29,
    seconds: 55,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

const VideoBanner = () => {
  return (
    <section className="w-full">
      {/* Video Section */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://cdn.shopify.com/videos/c/o/v/23161f90de4d40578eed3144dc5cf372.mp4"
            type="video/mp4"
          />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          {/* Tagline */}
          <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase mb-3 sm:mb-4 opacity-80">
            Nova temporada
          </p>

          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6 sm:mb-8">
            Transforme seu <span className="italic">estilo</span> nesta estação
          </h2>

          {/* Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/shop"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black text-[10px] sm:text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#f5f5f5] transition-colors"
            >
              Comprar agora
            </Link>
            <Link
              href="/shop"
              className="px-6 sm:px-8 py-2.5 sm:py-3 border border-white/80 text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase font-medium hover:bg-white hover:text-black transition-colors"
            >
              Explorar
            </Link>
          </div>
        </div>
      </div>

      {/* Archive Sale Bar */}
      <div className="w-full bg-black">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Left - Title and Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-light text-white">
                Liquidação, ao vivo agora
              </h3>
              <Link
                href="/shop"
                className="px-5 py-2 border border-white/60 text-white text-[9px] sm:text-[10px] tracking-[0.15em] uppercase hover:bg-white hover:text-black transition-colors"
              >
                Explorar
              </Link>
            </div>

            {/* Right - Countdown */}
            <CountdownTimer />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoBanner;
