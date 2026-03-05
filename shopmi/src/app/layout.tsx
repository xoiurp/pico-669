import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import ConditionalHeader from "../components/layout/ConditionalHeader";
import NewFooter from "../components/layout/NewFooter";
import GlobalCheckoutInterceptor from "@/components/checkout/GlobalCheckoutInterceptor";
import PageTransition from "../components/layout/PageTransition";


// Configuração da fonte local MiSans (substituir pelos arquivos de fonte da PICO quando disponível)
const miSans = localFont({
  src: [
    { path: '../assets/fonts/MiSans-Thin.woff2', weight: '100', style: 'normal' },
    { path: '../assets/fonts/MiSans-ExtraLight.woff2', weight: '200', style: 'normal' },
    { path: '../assets/fonts/MiSans-Light.woff2', weight: '300', style: 'normal' },
    { path: '../assets/fonts/MiSans-Normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/MiSans-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/MiSans-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../assets/fonts/MiSans-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../assets/fonts/MiSans-Heavy.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-misans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "PICO",
  description: "PICO - Sua loja online com os melhores produtos.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${miSans.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <ConditionalHeader />
              {/* Mount global interceptor to capture checkout clicks across the app */}
              <GlobalCheckoutInterceptor />
              <main className="flex-grow">
                <PageTransition>{children}</PageTransition>
              </main>
            <NewFooter />
          </div>
          
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
