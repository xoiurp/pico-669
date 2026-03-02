'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { SheetClose } from '../ui/sheet';

const CartDrawerContent: React.FC = () => {
  const router = useRouter();
  const { cart, totalItems, totalPrice, updateQuantity, removeFromCart, setCartSheetOpen } = useCart();
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const FREE_SHIPPING_THRESHOLD = 500;
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const freeShippingProgress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  const formatPrice = (price: number | string, currencyCode: string = 'BRL') => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return 'Preço inválido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode,
    }).format(numericPrice);
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !agreedToTerms) return;
    setCartSheetOpen(false);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    setCartSheetOpen(false);
    router.push('/cart');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Free shipping progress */}
      {cart.length > 0 && (
        <div className="px-6 py-3 border-b border-[#e0e0e0]">
          {amountForFreeShipping > 0 ? (
            <>
              <p className="text-xs text-[#666] mb-2">
                Falta <span className="font-medium text-[#1a1a1a]">{formatPrice(amountForFreeShipping)}</span> para{" "}
                <span className="font-medium text-[#1a1a1a]">frete grátis</span>
              </p>
              <div className="w-full h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1a1a1a] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-[#1a1a1a] font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Parabéns! Você ganhou frete grátis
            </p>
          )}
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#666] px-6">
            <svg
              className="h-16 w-16 mb-4 text-[#ccc]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-base font-medium">Seu carrinho está vazio</p>
            <p className="mt-1 text-sm text-[#999]">
              Adicione produtos para continuar
            </p>
            <SheetClose asChild>
              <button className="mt-6 px-8 py-3 bg-[#1a1a1a] text-white text-xs uppercase tracking-[0.15em] font-medium hover:bg-black transition-colors cursor-pointer">
                Continuar comprando
              </button>
            </SheetClose>
          </div>
        ) : (
          <div className="divide-y divide-[#e0e0e0]">
            {cart.map((item) => (
              <div key={item.variantId} className="p-6 flex gap-4">
                {/* Product Image */}
                <Link
                  href={`/product/${item.handle}`}
                  onClick={() => setCartSheetOpen(false)}
                  className="flex-shrink-0 w-20 h-24 bg-white relative overflow-hidden border border-[#e0e0e0] cursor-pointer"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-2"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/product/${item.handle}`}
                        onClick={() => setCartSheetOpen(false)}
                        className="text-sm font-medium text-[#1a1a1a] uppercase tracking-wide hover:underline cursor-pointer"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-sm text-[#666]">
                        {formatPrice(item.price, item.currencyCode)}
                      </p>

                      {item.variantOptions && item.variantOptions.length > 0 && (
                        <p className="mt-1 text-xs text-[#999]">
                          {item.variantOptions.map(opt => opt.value).join(' · ')}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="p-1 text-[#999] hover:text-[#1a1a1a] transition-colors cursor-pointer"
                      aria-label="Remover item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-[#e0e0e0]">
                      <button
                        onClick={() => updateQuantity(item.variantId, Math.max(0, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm text-[#1a1a1a]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#666] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="text-sm font-medium text-[#1a1a1a]">
                      {formatPrice(item.price * item.quantity, item.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="border-t border-[#e0e0e0] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-[#1a1a1a]">Subtotal</span>
            <span className="text-lg font-medium text-[#1a1a1a]">
              {formatPrice(totalPrice)} <span className="text-sm font-normal text-[#666]">BRL</span>
            </span>
          </div>

          <p className="text-xs text-[#666]">
            Taxas incluídas. <span className="underline cursor-pointer">Frete calculado</span> no checkout.
          </p>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 border-[#ccc] rounded text-[#1a1a1a] accent-[#1a1a1a]"
            />
            <span className="text-xs text-[#666]">
              Concordo com os{' '}
              <Link href="/termos" className="underline hover:text-[#1a1a1a]">
                termos de venda
              </Link>{' '}
              conforme os termos de serviço do comerciante.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleViewCart}
              className="py-3.5 text-xs uppercase tracking-[0.15em] font-medium border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
            >
              Ver carrinho
            </button>
            <button
              onClick={handleCheckout}
              disabled={!agreedToTerms}
              className={`py-3.5 text-xs uppercase tracking-[0.15em] font-medium transition-colors cursor-pointer ${
                agreedToTerms
                  ? 'bg-[#1a1a1a] text-white hover:bg-black'
                  : 'bg-[#e0e0e0] text-[#999] cursor-not-allowed'
              }`}
            >
              Finalizar compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartDrawerContent;
