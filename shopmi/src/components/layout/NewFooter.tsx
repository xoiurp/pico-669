"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import logoIcon from "../../assets/images/logo-pico.svg";
import { getCollections, Collection } from "../../lib/shopify";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopCollections, setShopCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collections = await getCollections();
        setShopCollections(collections.slice(0, 6));
      } catch (error) {
        console.error("Erro ao buscar coleções para o rodapé:", error);
      }
    };
    fetchCollections();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 4000);
      }
    } catch {
      // silently fail - newsletter is non-critical
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyLinks = [
    { label: "Busca", href: "/search" },
    { label: "Contato", href: "/contato" },
    { label: "Termos e Condições", href: "/termos" },
    { label: "Política de Privacidade", href: "/privacidade" },
  ];

  const pagesLinks = [
    { label: "FAQ", href: "/faq" },
    { label: "Coleções", href: "/shop" },
  ];

  const socialLinks = [
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full bg-[#0a0a0a] text-white">
      {/* Main Footer */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Newsletter */}
          <div className="lg:col-span-3 lg:mr-auto">
            <h3 className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">
              Newsletter
            </h3>
            <p className="text-sm sm:text-base mb-4">
              Cadastre-se e ganhe 10% de desconto no primeiro pedido
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-gray-900 px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none"
                required
                aria-label="E-mail para newsletter"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-gray-900 px-4 py-3 text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] uppercase font-medium hover:bg-gray-100 transition-colors border-l border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] sm:min-w-[120px] flex items-center justify-center whitespace-nowrap"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Inscrever-se"
                )}
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-green-400 mt-2">Obrigado por se inscrever!</p>
            )}
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2 lg:col-start-8 lg:ml-auto">
            <h3 className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">
              Institucional
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages Links */}
          <div className="lg:col-span-1 lg:ml-auto">
            <h3 className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">
              Páginas
            </h3>
            <ul className="space-y-2">
              {pagesLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links - Dynamic Collections */}
          <div className="lg:col-span-1 lg:ml-auto">
            <h3 className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              {shopCollections.map((collection) => (
                <li key={collection.id}>
                  <Link
                    href={`/shop/${collection.handle}`}
                    className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wide"
                  >
                    {collection.title}
                  </Link>
                </li>
              ))}
              {shopCollections.length === 0 && (
                <li>
                  <Link
                    href="/shop"
                    className="text-sm text-white hover:text-gray-300 transition-colors uppercase tracking-wide"
                  >
                    Ver todas
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 sm:mt-16 pt-10 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Logo and Description */}
            <div className="flex-1">
              <Image
                src={logoIcon}
                alt="PICO Logo"
                width={140}
                height={50}
                className="h-10 sm:h-12 w-auto brightness-0 invert mb-4"
              />
              <p className="text-xs sm:text-sm text-gray-400 max-w-md">
                Sua loja online com curadoria especial dos melhores produtos para você.
                Qualidade e estilo em cada peça.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4 mt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-200"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>
              Copyright © {new Date().getFullYear()} Agencia.bot. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2">
              <Image src="/Assets/Images/Visa.svg" alt="Visa" width={36} height={24} className="h-5 w-auto" />
              <Image src="/Assets/Images/Mastercard.svg" alt="Mastercard" width={36} height={24} className="h-5 w-auto" />
              <Image src="/Assets/Images/pix.svg" alt="Pix" width={36} height={24} className="h-5 w-auto" />
              <Image src="/Assets/Images/PayPal.svg" alt="PayPal" width={36} height={24} className="h-5 w-auto" />
              <Image src="/Assets/Images/GooglePay.svg" alt="Google Pay" width={36} height={24} className="h-5 w-auto" />
              <Image src="/Assets/Images/DinersClub.svg" alt="Diners Club" width={36} height={24} className="h-5 w-auto" />
              <Image src="/Assets/Images/Discover.svg" alt="Discover" width={36} height={24} className="h-5 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
