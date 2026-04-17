"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { getCollectionById, getCollections, Collection } from "../../lib/shopify";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CartDrawerContent from "../cart/CartDrawer";
import logoIcon from "../../assets/images/logo-pico.svg";

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 23,
    hours: 1,
    minutes: 44,
    seconds: 0,
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

  return (
    <span className="font-mono text-xs tracking-wider">
      TERMINA EM {timeLeft.days}D | {formatNumber(timeLeft.hours)}H | {formatNumber(timeLeft.minutes)}M | {formatNumber(timeLeft.seconds)}S
    </span>
  );
};

interface NewHeaderProps {
  invertColors?: boolean;
}

const NewHeader = ({ invertColors = false }: NewHeaderProps) => {
  const router = useRouter();
  const { totalItems, isCartSheetOpen, setCartSheetOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  // Fetch collections for mega menu
  useEffect(() => {
    const fetchCollections = async () => {
      // Fetch featured collections for images
      const collectionIds = [
        "gid://shopify/Collection/272614457409",
        "gid://shopify/Collection/272613867585"
      ];
      
      const featured = await Promise.all(
        collectionIds.map(id => getCollectionById(id))
      );
      
      setFeaturedCollections(featured.filter((c): c is Collection => c !== null));
      
      // Fetch all collections for categories
      const all = await getCollections();
      setAllCollections(all);
    };

    fetchCollections();
  }, []);

  // Handle scroll effect: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 50);

      // Only hide/show after scrolling past the header height
      const headerHeight = headerRef.current?.offsetHeight || 100;
      if (currentY > headerHeight) {
        // Scrolling down → hide
        if (currentY > lastScrollY.current + 5) {
          setIsHidden(true);
        }
        // Scrolling up → show
        else if (currentY < lastScrollY.current - 5) {
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    // Focus input after overlay renders
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchTerm("");
  }, []);

  // Close search overlay on Escape key
  useEffect(() => {
    if (!searchOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [searchOpen, closeSearch]);

  // Helper: text color for nav elements on the main navigation bar
  // invertColors = light page background, so text should ALWAYS be dark
  // Without invertColors = dark hero background, so text is white until scrolled
  const navTextColor = invertColors
    ? "text-gray-900"
    : isScrolled
      ? "text-gray-900"
      : "text-white";

  // Helper: text color for top bar (inherits from parent container's text color)
  const topBarTextColor = isScrolled
    ? "text-gray-900"
    : invertColors
      ? "text-gray-900"
      : "text-white";

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Top Bar - Always visible */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "bg-white text-gray-900 border-b border-gray-200"
            : invertColors
              ? "bg-white/80 text-gray-900 backdrop-blur-sm border-b border-gray-100"
              : "bg-black/30 text-white backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs tracking-widest uppercase font-medium">
            {/* Left - Our Stores */}
            <div className="hidden md:block">
              <Link
                href="#"
                className={`hover:opacity-70 transition-opacity ${topBarTextColor}`}
              >
                Nossas Lojas
              </Link>
            </div>

            {/* Center - Address + Free Shipping */}
            <div className="flex items-center gap-3 mx-auto sm:mx-0">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Rua+Major+Solon+996+Campinas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                aria-label="Ver endereço no Google Maps"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Major Solon, 996</span>
              </a>
              <span className="hidden sm:inline text-current opacity-40">|</span>
              <span className="hidden sm:inline">Frete grátis acima de R$ 500</span>
            </div>

            {/* Right - New Products + Countdown */}
            <div className="hidden sm:flex items-center gap-4">
              <span className="flex items-center gap-2">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
                Novos Produtos
              </span>
              <CountdownTimer />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div
        className={`transition-all duration-500 ${
          isScrolled
            ? "bg-white shadow-md"
            : invertColors
              ? "bg-white"
              : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 overflow-visible">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 sm:h-20 overflow-visible">
            {/* Left Column - Desktop Nav + Mobile Menu */}
            <div className="flex items-center justify-start">
              {/* Mobile Menu Button - Show on lg and below */}
              <div className="xl:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={`p-2 transition-colors ${navTextColor}`}
                      aria-label="Menu"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full max-w-sm p-0 flex flex-col">
                    {/* Header */}
                    <SheetHeader className="px-6 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
                      <SheetTitle>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                          <Image
                            src={logoIcon}
                            alt="Logo"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                            priority
                          />
                        </Link>
                      </SheetTitle>
                    </SheetHeader>

                    {/* Category List */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      <nav className="space-y-1">
                        {/* Links diretos */}
                        <Link
                          href="/shop"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-3 text-xl font-bold text-[#1a1a1a] uppercase tracking-wide hover:opacity-60 transition-opacity"
                        >
                          All Products
                        </Link>
                        <Link
                          href="/shop/novidade"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-3 text-xl font-bold text-[#1a1a1a] uppercase tracking-wide hover:opacity-60 transition-opacity"
                        >
                          News In
                        </Link>
                        <Link
                          href="/shop/sale"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-3 text-xl font-bold text-[#1a1a1a] uppercase tracking-wide hover:opacity-60 transition-opacity"
                        >
                          Sale
                        </Link>

                        {/* Separator */}
                        <div className="border-t border-gray-200 my-3" />

                        {/* Vestuário - Dropdown */}
                        <div>
                          <button
                            onClick={() => setMobileDropdown(mobileDropdown === "vestuario" ? null : "vestuario")}
                            className="flex items-center justify-between w-full py-3 text-xl font-bold text-[#1a1a1a] uppercase tracking-wide hover:opacity-60 transition-opacity"
                          >
                            Vestuário
                            <svg
                              className={`w-5 h-5 text-[#999] transition-transform duration-200 ${mobileDropdown === "vestuario" ? "rotate-90" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          {mobileDropdown === "vestuario" && (
                            <div className="pl-4 pb-2 space-y-1">
                              <Link href="/shop/camisetas" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Camisetas</Link>
                              <Link href="/shop/camisas" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Camisas</Link>
                              <Link href="/shop/moletons" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Moletons</Link>
                              <Link href="/shop/jaquetas" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Jaquetas</Link>
                              <Link href="/shop/calcas" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Calças</Link>
                              <Link href="/shop/shorts" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Shorts</Link>
                            </div>
                          )}
                        </div>

                        {/* Acessórios - Dropdown */}
                        <div>
                          <button
                            onClick={() => setMobileDropdown(mobileDropdown === "acessorios" ? null : "acessorios")}
                            className="flex items-center justify-between w-full py-3 text-xl font-bold text-[#1a1a1a] uppercase tracking-wide hover:opacity-60 transition-opacity"
                          >
                            Acessórios
                            <svg
                              className={`w-5 h-5 text-[#999] transition-transform duration-200 ${mobileDropdown === "acessorios" ? "rotate-90" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          {mobileDropdown === "acessorios" && (
                            <div className="pl-4 pb-2 space-y-1">
                              <Link href="/shop/bones" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Bonés</Link>
                              <Link href="/shop/gorros" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Gorros</Link>
                              <Link href="/shop/lencos" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Lenços</Link>
                              <Link href="/shop/meias" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Meias</Link>
                              <Link href="/shop/cuecas" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Cuecas</Link>
                              <Link href="/shop/oculos-de-sol" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Óculos de Sol</Link>
                              <Link href="/shop/bags" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Bags</Link>
                              <Link href="/shop/cintos" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">Cintos</Link>
                            </div>
                          )}
                        </div>

                        {/* Tênis - Dropdown */}
                        <div>
                          <button
                            onClick={() => setMobileDropdown(mobileDropdown === "tenis" ? null : "tenis")}
                            className="flex items-center justify-between w-full py-3 text-xl font-bold text-[#1a1a1a] uppercase tracking-wide hover:opacity-60 transition-opacity"
                          >
                            Tênis
                            <svg
                              className={`w-5 h-5 text-[#999] transition-transform duration-200 ${mobileDropdown === "tenis" ? "rotate-90" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          {mobileDropdown === "tenis" && (
                            <div className="pl-4 pb-2 space-y-1">
                              <Link href="/shop/tenis-new-balance" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">New Balance</Link>
                            </div>
                          )}
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-200 my-3" />

                        {/* Contato */}
                        <Link
                          href="/contato"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-3 text-xl font-bold text-[#1a1a1a] uppercase tracking-wide hover:opacity-60 transition-opacity"
                        >
                          Contato
                        </Link>
                      </nav>
                    </div>

                    {/* Footer - Account */}
                    <div className="border-t border-gray-200 px-6 py-4">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Entrar
                      </Link>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Navigation - Only show on xl+ */}
              <nav className="hidden xl:flex items-center gap-6 2xl:gap-10">
                <Link
                  href="/"
                  className={`text-xs tracking-widest uppercase font-medium transition-colors hover:opacity-70 whitespace-nowrap ${navTextColor}`}
                >
                  Home
                </Link>

                <button
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  onClick={() => setMegaMenuOpen((prev) => !prev)}
                  className={`text-xs tracking-widest uppercase font-medium transition-colors hover:opacity-70 whitespace-nowrap flex items-center gap-1 ${navTextColor}`}
                >
                  Shop
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <Link
                  href="/contato"
                  className={`text-xs tracking-widest uppercase font-medium transition-colors hover:opacity-70 whitespace-nowrap ${navTextColor}`}
                >
                  Contato
                </Link>
              </nav>
            </div>

            {/* Logo - Center */}
            <Link href="/" className="flex justify-center px-2 flex-shrink-0">
              <Image
                src={logoIcon}
                alt="Logo"
                width={140}
                height={50}
                className={`h-7 sm:h-8 lg:h-9 xl:h-10 w-auto max-w-[80px] sm:max-w-[100px] lg:max-w-[120px] xl:max-w-[140px] object-contain transition-all duration-300 ${
                  invertColors
                    ? "brightness-100"
                    : isScrolled
                      ? "brightness-100"
                      : "brightness-0 invert"
                }`}
                priority
              />
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-2 sm:gap-4 justify-end min-w-0">
              {/* Country/Region Selector */}
              <button
                className={`hidden sm:flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-70 ${navTextColor}`}
              >
                <span className="text-base">🇧🇷</span>
                <span className="hidden xl:inline uppercase tracking-wider whitespace-nowrap">
                  Brasil
                </span>
              </button>

              {/* Search Icon */}
              <button
                className={`transition-colors hover:opacity-70 ${navTextColor}`}
                onClick={openSearch}
                aria-label="Buscar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Account */}
              <Link
                href="/dashboard"
                className={`transition-colors hover:opacity-70 ${navTextColor}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>

              {/* Cart */}
              <Sheet open={isCartSheetOpen} onOpenChange={setCartSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    className={`relative p-1 transition-colors hover:opacity-70 ${navTextColor}`}
                    aria-label="Carrinho"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    {totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#1a1a1a] text-white text-[9px] font-bold rounded-full h-4 w-4 min-w-[16px] flex items-center justify-center">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent
                  className="w-full md:max-w-md p-0 flex flex-col"
                  side="right"
                >
                  <SheetTitle className="sr-only">Carrinho</SheetTitle>
                  <CartDrawerContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[-1] animate-in fade-in duration-200"
            onClick={closeSearch}
          />
          {/* Search Bar */}
          <div className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-4">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-3 py-4 sm:py-5"
              >
                <svg
                  className="w-5 h-5 text-[#999] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, categoria, coleção..."
                  className="flex-1 text-sm sm:text-base text-[#1a1a1a] placeholder-[#999] bg-transparent focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      searchInputRef.current?.focus();
                    }}
                    className="text-[#999] hover:text-[#1a1a1a] transition-colors flex-shrink-0"
                    aria-label="Limpar busca"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeSearch}
                  className="text-xs uppercase tracking-[0.1em] text-[#999] hover:text-[#1a1a1a] transition-colors flex-shrink-0 ml-2"
                >
                  Esc
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Full-width Mega Menu */}
      {megaMenuOpen && !searchOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[-1]"
            aria-hidden="true"
            onClick={() => setMegaMenuOpen(false)}
          />
          {/* Mega Menu Panel */}
          <div
            className="absolute left-0 right-0 top-full bg-white shadow-lg border-t border-gray-200 z-[60]"
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <div className="container mx-auto px-8 py-10">
              <div className="grid grid-cols-5 gap-10">
                {/* Column 1: Links diretos */}
                <div>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/shop" onClick={() => setMegaMenuOpen(false)} className="text-sm font-semibold text-[#1a1a1a] hover:opacity-70 transition-colors uppercase tracking-wide">
                        All Products
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/novidade" onClick={() => setMegaMenuOpen(false)} className="text-sm font-semibold text-[#1a1a1a] hover:opacity-70 transition-colors uppercase tracking-wide">
                        News In
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/sale" onClick={() => setMegaMenuOpen(false)} className="text-sm font-semibold text-[#1a1a1a] hover:opacity-70 transition-colors uppercase tracking-wide">
                        Sale
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Vestuário */}
                <div>
                  <h3 className="text-sm font-semibold mb-5 uppercase tracking-wider text-[#1a1a1a]">
                    <Link href="/shop/vestuario" onClick={() => setMegaMenuOpen(false)} className="hover:opacity-70 transition-opacity">
                      Vestuário
                    </Link>
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/shop/camisetas" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Camisetas
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/camisas" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Camisas
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/moletons" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Moletons
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/jaquetas" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Jaquetas
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/calcas" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Calças
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/shorts" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Shorts
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Acessórios */}
                <div>
                  <h3 className="text-sm font-semibold mb-5 uppercase tracking-wider text-[#1a1a1a]">
                    <Link href="/shop/acessorios" onClick={() => setMegaMenuOpen(false)} className="hover:opacity-70 transition-opacity">
                      Acessórios
                    </Link>
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/shop/bones" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Bonés
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/gorros" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Gorros
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/lencos" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Lenços
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/meias" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Meias
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/cuecas" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Cuecas
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/oculos-de-sol" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Óculos de Sol
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/bags" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Bags
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/cintos" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        Cintos
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Tênis */}
                <div>
                  <h3 className="text-sm font-semibold mb-5 uppercase tracking-wider text-[#1a1a1a]">
                    <Link href="/shop/tenis" onClick={() => setMegaMenuOpen(false)} className="hover:opacity-70 transition-opacity">
                      Tênis
                    </Link>
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/shop/tenis-new-balance" onClick={() => setMegaMenuOpen(false)} className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors tracking-wide">
                        New Balance
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 5: Featured Collection Image */}
                {featuredCollections.slice(0, 1).map((collection) => (
                  <div key={collection.id}>
                    <Link
                      href={`/shop/${collection.handle}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="block group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {collection.image ? (
                          <Image
                            src={collection.image.transformedSrc || collection.image.originalSrc || ""}
                            alt={collection.image.altText || collection.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1280px) 20vw, 250px"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#e5e5e5] flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-sm text-[#666]">Imagem da coleção</p>
                              <p className="text-sm font-medium text-[#1a1a1a] mt-1">{collection.title}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-[#1a1a1a] group-hover:underline">
                        {collection.title}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default NewHeader;
