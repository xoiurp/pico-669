"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageType {
  transformedSrc: string;
  altText: string | null;
}

interface NewProductGalleryProps {
  images: ImageType[];
}

const NewProductGallery: React.FC<NewProductGalleryProps> = ({ images }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Filter out empty images
  const validImages = images.filter((img) => img.transformedSrc);

  const openLightbox = useCallback((index: number) => {
    setDirection(0);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setLightboxIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  }, [validImages.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setLightboxIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  }, [validImages.length]);

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    },
    [goToPrev, goToNext]
  );

  if (validImages.length === 0) {
    return (
      <div className="relative aspect-[4/5] bg-white flex items-center justify-center">
        <span className="text-[#999]">Sem imagem</span>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: 2-column grid with ALL images */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-0">
          {validImages.map((image, index) => (
            <div
              key={index}
              className="relative bg-white group cursor-zoom-in overflow-hidden"
              style={{ aspectRatio: "4 / 5" }}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={image.transformedSrc}
                alt={image.altText || `Imagem do produto ${index + 1}`}
                fill
                className="object-contain p-6 lg:p-8 transition-transform duration-500 group-hover:scale-105"
                priority={index < 2}
                sizes="35vw"
              />
            </div>
          ))}

          {/* If odd number of images, add empty cell to keep grid aligned */}
          {validImages.length % 2 !== 0 && (
            <div className="bg-white" style={{ aspectRatio: "4 / 5" }} />
          )}
        </div>
      </div>

      {/* Mobile: horizontal swipe carousel */}
      <div className="lg:hidden">
        <div className="relative">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {validImages.map((image, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-full snap-center bg-white cursor-zoom-in"
                style={{ aspectRatio: "4 / 5" }}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.transformedSrc}
                  alt={image.altText || `Imagem do produto ${index + 1}`}
                  fill
                  className="object-contain p-6"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            ))}
          </div>

          {/* Dot indicators for mobile */}
          {validImages.length > 1 && (
            <div className="flex justify-center gap-2 py-4">
              {validImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 transition-colors ${
                    index === 0 ? "bg-[#1a1a1a]" : "bg-[#e0e0e0]"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Zoom Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-white/98 backdrop-blur-sm border-none rounded-none [&>button]:hidden"
          onKeyDown={handleKeyDown}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center bg-white border border-[#e0e0e0] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 text-xs uppercase tracking-wider text-[#666] font-medium">
            {lightboxIndex + 1} / {validImages.length}
          </div>

          {/* Main image with cross-fade */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={lightboxIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={validImages[lightboxIndex].transformedSrc}
                  alt={
                    validImages[lightboxIndex].altText ||
                    `Imagem do produto ${lightboxIndex + 1}`
                  }
                  fill
                  className="object-contain p-12 md:p-20"
                  sizes="95vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white border border-[#e0e0e0] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white border border-[#e0e0e0] hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Thumbnail strip at bottom */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[80vw] overflow-x-auto py-2 px-1">
              {validImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > lightboxIndex ? 1 : -1);
                    setLightboxIndex(index);
                  }}
                  className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all duration-200 overflow-hidden cursor-pointer ${
                    lightboxIndex === index
                      ? "border-[#1a1a1a] scale-110"
                      : "border-[#e0e0e0] hover:border-[#999]"
                  }`}
                >
                  <Image
                    src={image.transformedSrc}
                    alt={image.altText || `Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewProductGallery;
