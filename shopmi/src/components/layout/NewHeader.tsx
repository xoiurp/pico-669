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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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

  // Helper: hover/focus overrides for NavigationMenuTrigger
  // The base navigationMenuTriggerStyle has hardcoded hover:text-white and focus:text-white
  // On light backgrounds, we need to override these to keep text dark on hover/focus
  const navTriggerHoverOverride = invertColors || isScrolled
    ? "hover:text-gray-900 focus:text-gray-900 hover:bg-gray-100/50"
    : "hover:text-white focus:text-white hover:bg-white/10";

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

            {/* Center - Welcome + Free Shipping */}
            <div className="flex items-center gap-3 mx-auto sm:mx-0">
              <div className="flex items-center gap-2">
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
                <span>Bem-vindo à nossa loja</span>
              </div>
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
                  <SheetContent side="left" className="w-[300px] p-0">
                    <SheetHeader className="p-6 border-b">
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
                    <div className="p-6">
                      <nav className="space-y-4">
                        <Link
                          href="/"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm font-medium text-[#1a1a1a] hover:text-[#666]"
                        >
                          Home
                        </Link>
                        <Link
                          href="/shop"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm font-medium text-[#1a1a1a] hover:text-[#666]"
                        >
                          Shop
                        </Link>
                        <Link
                          href="/faq"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm font-medium text-[#1a1a1a] hover:text-[#666]"
                        >
                          FAQ
                        </Link>
                        <Link
                          href="/contato"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-sm font-medium text-[#1a1a1a] hover:text-[#666]"
                        >
                          Contato
                        </Link>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Navigation - Only show on xl+ */}
              <nav className="hidden xl:flex items-center gap-4 2xl:gap-8">
                <NavigationMenu className="relative z-[60]" onValueChange={(val) => setMegaMenuOpen(val !== "")}>
                  <NavigationMenuList className="gap-3 2xl:gap-6">
                    <NavigationMenuItem>
                      <Link
                        href="/"
                        className={`text-xs tracking-widest uppercase font-medium transition-colors hover:opacity-70 whitespace-nowrap ${navTextColor}`}
                      >
                        Home
                      </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger
                        className={`text-xs tracking-widest uppercase font-medium bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors whitespace-nowrap ${navTextColor} ${navTriggerHoverOverride}`}
                      >
                        Shop
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[900px] p-8">
                          <div className="grid grid-cols-4 gap-8">
                            {/* Featured Column */}
                            <div>
                              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[#1a1a1a]">
                                Destaques
                              </h3>
                              <ul className="space-y-3">
                                <li>
                                  <Link
                                    href="/shop/new"
                                    className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
                                  >
                                    Novidades
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/shop/bestsellers"
                                    className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
                                  >
                                    Mais Vendidos
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/shop/basics"
                                    className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
                                  >
                                    Básicos
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            {/* Categories Column - Real Collections */}
                            <div>
                              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-[#1a1a1a]">
                                Categorias
                              </h3>
                              <ul className="space-y-3">
                                {allCollections.slice(0, 8).map((collection) => (
                                  <li key={collection.id}>
                                    <Link
                                      href={`/shop/${collection.handle}`}
                                      className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors"
                                    >
                                      {collection.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Collection Images */}
                            {featuredCollections.map((collection, index) => (
                              <div key={collection.id} className="relative">
                                <Link href={`/shop/${collection.handle}`} className="block group">
                                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                                    {collection.image ? (
                                      <Image
                                        src={collection.image.transformedSrc || collection.image.originalSrc || ""}
                                        alt={collection.image.altText || collection.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="200px"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center">
                                        <span className="text-[#999] text-sm">{collection.title}</span>
                                      </div>
                                    )}
                                    {/* Overlay with text */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                      <div className="absolute bottom-4 left-4 right-4">
                                        <span className="text-[10px] uppercase tracking-wider text-white/80">
                                          {index === 0 ? "Destaque" : "Verão 26"}
                                        </span>
                                        <h4 className="text-lg font-medium text-white mt-1">
                                          {index === 0 ? "Coleção Exclusiva" : "Prepare-se para o verão"}
                                        </h4>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={`text-xs tracking-widest uppercase font-medium bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors whitespace-nowrap ${navTextColor} ${navTriggerHoverOverride}`}
                    >
                      Páginas
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[300px] p-6">
                        <ul className="space-y-3">
                          <li>
                            <Link
                              href="/faq"
                              className="text-sm text-[#666] hover:text-[#1a1a1a]"
                            >
                              FAQ
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/envio"
                              className="text-sm text-[#666] hover:text-[#1a1a1a]"
                            >
                              Envio e Entrega
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/politica-de-devolucao"
                              className="text-sm text-[#666] hover:text-[#1a1a1a]"
                            >
                              Política de Devolução
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={`text-xs tracking-widest uppercase font-medium bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors whitespace-nowrap ${navTextColor} ${navTriggerHoverOverride}`}
                    >
                      Destaques
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[300px] p-6">
                        <ul className="space-y-3">
                          <li>
                            <span className="text-sm text-[#666]">
                              Lançamentos
                            </span>
                          </li>
                          <li>
                            <span className="text-sm text-[#666]">
                              Mais Vendidos
                            </span>
                          </li>
                          <li>
                            <span className="text-sm text-[#666]">
                              Ofertas Especiais
                            </span>
                          </li>
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link
                      href="/contato"
                      className={`text-xs tracking-widest uppercase font-medium transition-colors hover:opacity-70 whitespace-nowrap ${navTextColor}`}
                    >
                      Contato
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>

              </NavigationMenu>
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

      {/* Mega Menu Backdrop Overlay */}
      {megaMenuOpen && !searchOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[-1] animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default NewHeader;
