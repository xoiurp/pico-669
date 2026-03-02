"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Testimonial {
  id: number;
  name: string;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Rachel Zoë",
    text: "Adoro absolutamente a qualidade das minhas peças. O caimento é perfeito e o tecido é incrível. Definitivamente vou comprar mais!",
  },
  {
    id: 2,
    name: "Paulina Mertzel",
    text: "No começo eu era cética, mas isso mudou completamente minha opinião. A marca, a estética, a qualidade. É tudo maravilhoso, estou viciada.",
  },
  {
    id: 3,
    name: "Mariana Silva",
    text: "A entrega foi super rápida e o atendimento ao cliente é excepcional. As roupas são exatamente como nas fotos. Recomendo muito!",
  },
  {
    id: 4,
    name: "Ana Carolina",
    text: "Já sou cliente há mais de um ano e nunca me decepcionei. Cada coleção fica melhor que a anterior. Qualidade impecável!",
  },
  {
    id: 5,
    name: "Julia Martins",
    text: "O cuidado com os detalhes é impressionante. Desde a embalagem até o acabamento das peças, tudo transmite muita qualidade.",
  },
];

function getVisibleItems(width: number): number {
  if (width >= 1024) return 3; // lg
  if (width >= 640) return 2;  // sm
  return 1;                     // mobile
}

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleItems, setVisibleItems] = useState(3);

  // Responsive visible items
  useEffect(() => {
    const updateVisibleItems = () => {
      setVisibleItems(getVisibleItems(window.innerWidth));
    };
    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, []);

  const totalSlides = TESTIMONIALS.length;
  const maxIndex = Math.max(0, totalSlides - visibleItems);

  // Reset index when visible items change
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, maxIndex]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="w-full py-16 sm:py-20 md:py-24 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-center text-gray-900 mb-12 sm:mb-16">
          Depoimentos
        </h2>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-8 z-10 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-8 z-10 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Próximo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` }}
            >
              {TESTIMONIALS.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-4 sm:px-6"
                >
                  <div className="h-full flex flex-col justify-center">
                    {/* Name */}
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">
                      {testimonial.name}
                    </h4>

                    {/* Quote */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 ${
                currentIndex === index
                  ? "w-8 h-1 bg-gray-900"
                  : "w-4 h-1 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
