'use client';

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import CartDrawerContent from '../cart/CartDrawer'; // Alterado nome e não recebe props
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ListItem } from "@/components/ui/list-item";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Gift, ArrowRight, Star, Search, User, ShoppingCart, Menu } from 'lucide-react';
import logoIcon from '../../assets/images/logo-pico.svg';

interface Collection {
  id: string; // Mudar para string, pois o ID do Shopify é gid://...
  handle: string;
  title: string;
  subcollections?: Array<{
    id: string; // Mudar para string
    handle: string;
    title: string;
  }>;
}

// Ajustada para refletir os dados da API Admin (getProducts)
interface Product {
  id: string; // Adicionado
  title: string; // Adicionado
  handle: string;
  descriptionHtml: string; // Adicionado
  // variants não são mais buscados aqui por padrão
  images?: { // Mantido opcional
    edges: Array<{
      node: {
        id?: string; // Adicionado opcionalmente
        src: string;
        altText?: string;
      }
    }>
  };
}

// ============================================
// CACHE UTILITIES - Persistent cache for megamenu data
// ============================================
const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = 'megamenu_cache_';

interface CacheData<T> {
  data: T;
  timestamp: number;
}

const getCachedData = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;

    const parsed: CacheData<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - parsed.timestamp > CACHE_EXPIRATION_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
};

const setCachedData = <T,>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;

  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error writing cache for ${key}:`, error);
  }
};

const Header = () => {
  const router = useRouter();
  const { totalItems, isCartSheetOpen, setCartSheetOpen } = useCart(); // Adicionado isCartSheetOpen, setCartSheetOpen
  const [searchTerm, setSearchTerm] = useState('');
  // const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null); // Removido - não utilizado
  // const [products, setProducts] = useState<Product[]>([]); // Removido, não buscamos mais produtos gerais inicialmente
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [dynamicSubcollections, setDynamicSubcollections] = useState<Record<string, Collection[]>>({});
  const [loadingSubcollections, setLoadingSubcollections] = useState<Record<string, boolean>>({});
  let leaveTimeout: NodeJS.Timeout | null = null;

  // Track ongoing requests to prevent duplicates
  const ongoingRequestsRef = useRef<Set<string>>(new Set());

  const fixedMainMenuCategories: Collection[] = [
    { id: "gid://shopify/Collection/462402093285", title: "Smartwatches", handle: "smartwatches", subcollections: [] },
    // { id: "gid://shopify/Collection/462402158821", title: "Smartphones", handle: "smartphones", subcollections: [] },
    { id: "gid://shopify/Collection/462402355429", title: "Ofertas", handle: "ofertas", subcollections: [] },
    { id: "gid://shopify/Collection/470451880165", title: "Casa Inteligente", handle: "casa-inteligente", subcollections: [] },
    { id: "gid://shopify/Collection/470803120357", title: "Áudio", handle: "audio", subcollections: [] },
  ];

  // ============================================
  // HYDRATE STATE FROM CACHE ON MOUNT
  // ============================================
  useEffect(() => {
    const productsCache: Record<string, Product[]> = {};
    const subcollectionsCache: Record<string, Collection[]> = {};

    // Load products from cache for each collection
    fixedMainMenuCategories.forEach(collection => {
      const cachedProducts = getCachedData<Product[]>(`products_${collection.handle}`);
      if (cachedProducts) {
        productsCache[collection.handle] = cachedProducts;
      }

      const cachedSubcollections = getCachedData<Collection[]>(`subcollections_${collection.handle}`);
      if (cachedSubcollections) {
        subcollectionsCache[collection.handle] = cachedSubcollections;
      }
    });

    // Update state with cached data
    if (Object.keys(productsCache).length > 0) {
      setProductsByCategory(productsCache);
    }
    if (Object.keys(subcollectionsCache).length > 0) {
      setDynamicSubcollections(subcollectionsCache);
    }

  }, []); // Empty dependency array - run only once on mount

  const fetchSubcollections = async (parentId: string, parentHandle: string) => {
    const cacheKey = `subcollections_${parentHandle}`;
    const requestKey = `subcollections_${parentHandle}`;

    // Check if already in state
    if (dynamicSubcollections[parentHandle]) {
      return;
    }

    // Check if request is already ongoing
    if (ongoingRequestsRef.current.has(requestKey)) {
      return;
    }

    // Check cache first
    const cachedData = getCachedData<Collection[]>(cacheKey);
    if (cachedData) {
      setDynamicSubcollections(prev => ({
        ...prev,
        [parentHandle]: cachedData
      }));
      return;
    }

    // Mark request as ongoing
    ongoingRequestsRef.current.add(requestKey);
    setLoadingSubcollections(prev => ({ ...prev, [parentHandle]: true }));

    try {
      const response = await fetch(`/api/collections/subcollections?parentId=${parentId}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP ao buscar subcategorias: ${response.status}`);
      }
      const data = await response.json();
      const subcollections = data.subcollections || [];

      // Save to cache
      setCachedData(cacheKey, subcollections);

      setDynamicSubcollections(prev => ({
        ...prev,
        [parentHandle]: subcollections
      }));
    } catch (error) {
      console.error(`Erro ao buscar subcategorias para ${parentHandle} (ID: ${parentId}):`, error);
      setDynamicSubcollections(prev => ({ ...prev, [parentHandle]: [] })); // Define como vazio em caso de erro
    } finally {
      setLoadingSubcollections(prev => ({ ...prev, [parentHandle]: false }));
      ongoingRequestsRef.current.delete(requestKey);
    }
  };

  // Função para buscar produtos por ID da coleção
  const fetchProductsByCollectionId = async (collectionId: string, identifier: string) => {
    const cacheKey = `products_${identifier}`;
    const requestKey = `products_${identifier}`;

    // Check if already in state and not empty
    if (productsByCategory[identifier] && productsByCategory[identifier].length > 0) {
      return;
    }

    // Check if request is already ongoing
    if (ongoingRequestsRef.current.has(requestKey)) {
      return;
    }

    // Check cache first
    const cachedData = getCachedData<Product[]>(cacheKey);
    if (cachedData) {
      setProductsByCategory(prev => ({
        ...prev,
        [identifier]: cachedData
      }));
      return;
    }

    // If exists in state but empty (previous error), attempt to fetch again if not in cache
    if (productsByCategory.hasOwnProperty(identifier) && productsByCategory[identifier].length === 0) {
      // Previous error, retry
    }

    // Mark request as ongoing
    ongoingRequestsRef.current.add(requestKey);

    try {
      const response = await fetch(`/api/megamenu/products-preview?collectionId=${collectionId}&limit=4`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();

      if (data.error) {
        console.error(`Erro da API ao buscar produtos da coleção ${identifier}:`, data.details || data.error);
        // Atualizar estado para indicar erro ou array vazio, evitando estado inconsistente
        setProductsByCategory(prev => ({
          ...prev,
          [identifier]: []
        }));
        return;
      }

      const products = data.products || [];

      // Save to cache
      setCachedData(cacheKey, products);

      setProductsByCategory(prev => ({
        ...prev,
        [identifier]: products
      }));
    } catch (error) {
      console.error(`Erro ao buscar produtos da coleção ${identifier} (ID: ${collectionId}):`, error);
      // Atualizar estado para indicar erro ou array vazio
      setProductsByCategory(prev => ({
        ...prev,
        [identifier]: []
      }));
    } finally {
      ongoingRequestsRef.current.delete(requestKey);
    }
  };

  // const toggleMenu = () => { // Removido - Sheet gerencia seu estado
  //   setIsMenuOpen(!isMenuOpen);
  // };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleMouseEnter = (menuHandle: string) => {
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }
    // setActiveMegaMenu(null); // Removido - não utilizado

    // Buscar produtos para a coleção quando o mouse passar sobre o item
    // Não buscar para 'todos-produtos' aqui, pois ele não tem ID único
    if (menuHandle !== 'todos-produtos' && fixedMainMenuCategories && fixedMainMenuCategories.length > 0) {
      const collection = fixedMainMenuCategories.find(c => c.handle === menuHandle);
      if (collection && collection.id) {
        fetchProductsByCollectionId(collection.id, collection.handle);
        fetchSubcollections(collection.id, collection.handle);
      }
    }
  };

  const handleMouseLeave = () => {
    leaveTimeout = setTimeout(() => {
      // setActiveMegaMenu(null); // Removido - não utilizado
    }, 200); // 200ms delay
  };

  // Função auxiliar para renderizar produtos (evita repetição)
  const renderProductGrid = (collectionHandle: string) => {
    const products = productsByCategory[collectionHandle];

    return (
      <div className="col-span-4 grid grid-cols-4 gap-4">
        {products ? (
          products.length > 0 ? (
            products.slice(0, 4).map((product) => (
              // Adicionado flex/flex-col/items-center ao Link para centralizar o texto abaixo da imagem menor
              <Link href={`/product/${product.handle}`} key={product.id} className="group flex flex-col items-center text-center">
                {/* Adicionado w-20 h-20 e removido aspect-square para definir tamanho fixo menor */}
                <div className="relative overflow-hidden rounded-lg bg-white w-48 h-48 mb-1">
                  {product.images && product.images.edges && product.images.edges[0]?.node?.src && (
                    <Image
                      src={product.images.edges[0].node.src}
                      alt={product.images.edges[0].node.altText || product.title}
                      fill
                      sizes="240px" // Ajustar sizes para o novo tamanho fixo
                      className="object-contain transition-transform group-hover:scale-105" // Mudado para object-contain
                      priority={false}
                    />
                  )}
                </div>
                {/* Ajustado para ter largura máxima e centralizar texto */}
                <h4 className="mt-1 text-caption md:text-caption-sm font-medium text-gray-700 w-full truncate px-1">{product.title}</h4>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center text-gray-500">Nenhum produto encontrado nesta categoria.</div>
          )
        ) : (
          // Mostrar "Carregando..." apenas se a busca foi iniciada mas ainda não retornou
          productsByCategory.hasOwnProperty(collectionHandle) ?
          <div className="col-span-4 text-center text-gray-500">Carregando produtos...</div> :
          <div className="col-span-4 text-center text-gray-400">Passe o mouse para carregar.</div> // Mensagem inicial
        )}
      </div>
    );
  };


  return (
    <header className="sticky top-0 z-50">
      {/* Barra de promoções */}
      <div className="bg-[#1a1a1a] text-white py-2">
        <div className="container mx-auto px-4">
          {/* Slider horizontal no mobile */}
          <div className="block md:hidden overflow-hidden relative whitespace-nowrap">
            <div className="flex animate-slide gap-8 px-4">
              <span className="flex items-center flex-shrink-0">
                <Gift className="w-4 h-4 mr-1" />
                Parcele em até 12x sem juros
              </span>
              <span className="flex items-center flex-shrink-0">
                <ArrowRight className="w-4 h-4 mr-1" />
                Frete Grátis acima de R$200*
              </span>
              <span className="flex items-center flex-shrink-0">
                <Star className="w-4 h-4 mr-1" />
                8% de desconto à vista**
              </span>
            </div>
          </div>

          {/* Layout original no desktop */}
          <div className="hidden md:flex flex-wrap justify-center gap-4 text-nav-sm font-medium">
            <span className="flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              Parcele em até 12x sem juros
            </span>
            <span className="flex items-center">
              <ArrowRight className="w-4 h-4 mr-1" />
              Frete Grátis acima de R$200*
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              8% de desconto à vista**
            </span>
            </div>
          </div>
        </div>


      {/* Cabeçalho principal */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Responsivo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src={logoIcon}
                alt="PICO Logo"
                width={120}
                height={40}
                className="h-8 sm:h-10 md:h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Menu de navegação para desktop usando shadcnui */}
            <nav className="hidden md:flex">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Início
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link href="/shop" legacyBehavior passHref><NavigationMenuLink className={navigationMenuTriggerStyle()}>Shop</NavigationMenuLink></Link> {/* Estrutura compacta para evitar múltiplos filhos */}
                  </NavigationMenuItem>

                  {/* Loop para gerar itens de menu dinamicamente */}
                  {fixedMainMenuCategories.map((collection) => (
                    <NavigationMenuItem key={collection.id}>
                      <NavigationMenuTrigger
                        onMouseEnter={() => handleMouseEnter(collection.handle)}
                        className="text-nav-sm text-black-500 font-medium"

                      >
                        {collection.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent
                        onMouseEnter={() => handleMouseEnter(collection.handle)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="grid grid-cols-5 gap-4 p-4 w-[1200px] min-h-[200px]"> {/* Aumentado de w-[1000px] para w-[1200px] e adicionado min-h-[400px] */}
                          {/* Coluna de subcategorias */}
                          <div className="col-span-1 border-r border-gray-200 pr-4">
                            <h3 className="text-section-sm font-semibold mb-4">Categorias</h3>
                            {/* A ul interna não precisa de key, pois seus filhos terão */}
                            <ul className="space-y-2">
                              {/* Key adicionada ao li estático */}
                              <li key={`ver-tudo-${collection.id}`}>
                                <Link href={`/shop/${collection.handle}`} className="text-[#1a1a1a] hover:underline flex items-center text-nav-sm">
                                  Ver Tudo <span className="ml-1">&rarr;</span>
                                </Link>
                              </li>
                              {loadingSubcollections[collection.handle] && (
                                <li>Carregando categorias...</li>
                              )}
                              {!loadingSubcollections[collection.handle] && dynamicSubcollections[collection.handle] && dynamicSubcollections[collection.handle].map((sub) => (
                                <li key={sub.id}>
                                  <Link href={`/shop/${sub.handle}`} className="text-nav-sm font-medium text-gray-600 hover:text-[#1a1a1a]">
                                    {sub.title}
                                  </Link>
                                </li>
                              ))}
                              {!loadingSubcollections[collection.handle] && (!dynamicSubcollections[collection.handle] || dynamicSubcollections[collection.handle]?.length === 0) && (
                                <li className="text-caption text-gray-500"></li>
                              )}
                            </ul>
                          </div>

                          {/* Produtos em destaque */}
                          {/* Chamando a função auxiliar para renderizar o grid de produtos */}
                          {renderProductGrid(collection.handle)}

                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                  {/* Fim do loop dinâmico */}

                </NavigationMenuList>
              </NavigationMenu>
            </nav>

          {/* Barra de busca para desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent min-[990px]:p-0 min-[990px]:pl-5 min-[990px]:pr-[50px] min-[990px]:h-[35px] min-[990px]:border-[1.5px] min-[990px]:border-black min-[990px]:text-[#A5A5A5] min-[990px]:text-nav-sm min-[990px]:font-medium min-[990px]:leading-normal min-[990px]:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-[#1a1a1a] cursor-pointer"
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Ícones (Conta e Carrinho) - Touch targets mínimo 44px */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Link de conta com estado de autenticação */}
              <Link href="/dashboard" className="text-gray-600 hover:text-[#1a1a1a] cursor-pointer" aria-label="Minha conta">
                <div className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-2.5 border border-gray-200 rounded-md hover:border-[#1a1a1a] transition-colors duration-200">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.2} />
                </div>
              </Link>

              {/* Ícone do Carrinho com SheetTrigger */}
              <Sheet open={isCartSheetOpen} onOpenChange={setCartSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    className="text-gray-600 hover:text-[#1a1a1a] relative cursor-pointer"
                    aria-label="Carrinho"
                  >
                    <div className="relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 sm:p-2.5 border border-gray-200 rounded-md hover:border-[#1a1a1a] transition-colors duration-200">
                      <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.2} />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#1a1a1a] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </div>
                  </button>
                </SheetTrigger>
                <SheetContent className="w-full md:max-w-md p-0 flex flex-col" side="right">
                  {/* O botão X padrão do SheetContent/DialogContent fica no canto superior direito do SheetContent.
                      Este novo div para o cabeçalho ficará abaixo dele.
                      Adicionamos pt-6 ou pt-8 ao p-4 para dar espaço ao X que fica acima.
                  */}
                  <div className="p-4 pt-8 border-b"> {/* Aumentado padding superior para o X */}
                    <SheetTitle className="text-center text-section font-semibold mb-1">Meu Carrinho ({totalItems})</SheetTitle>
                    <div className="text-center"> {/* Ou text-right se preferir */}
                      <Link href="/cart" className="text-nav-sm text-gray-600 hover:text-[#1a1a1a] hover:underline">
                        Ver Todos
                      </Link>
                    </div>
                  </div>
                  <CartDrawerContent /> {/* CartDrawerContent já tem seu próprio padding e scroll para seu conteúdo */}
                </SheetContent>
              </Sheet>

              {/* Botão de menu para mobile com Sheet - Touch target 44px */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      className="text-gray-600 hover:text-[#1a1a1a] min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                      aria-label="Menu"
                    >
                      <Menu className="h-6 w-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-4/5 max-w-sm p-0"> {/* Ajuste de padding e largura */}
                    <SheetHeader className="p-4 border-b"> {/* Adicionado padding e borda */}
                      <SheetTitle>
                        <Link href="/" className="flex items-center">
                          <Image
                            src={logoIcon}
                            alt="PICO Logo"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                            priority
                          />
                           <span className="ml-2 text-section font-semibold">PICO</span>
                        </Link>
                      </SheetTitle>
                      {/* O SheetContent já fornece um botão de fechar padrão, então o SheetClose explícito foi removido daqui */}
                    </SheetHeader>
                    <div className="p-4"> {/* Adicionado padding ao conteúdo */}
                      {/* Barra de busca para mobile */}
                      <div className="mb-6"> {/* Aumentado margin-bottom */}
                        <form onSubmit={handleSearch} className="relative">
                          <input
                            type="text"
                            placeholder="Buscar produtos..."
                            className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent text-nav-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            tabIndex={-1}
                          />
                          <button
                            type="submit"
                            className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-[#1a1a1a] cursor-pointer"
                            aria-label="Buscar"
                          >
                            <Search className="h-5 w-5" />
                          </button>
                        </form>
                      </div>

                      <nav className="space-y-1">
                        <SheetClose asChild>
                          <Link href="/" className="flex items-center p-2 -mx-2 rounded-md hover:bg-gray-100 text-nav-sm text-gray-700 hover:text-[#1a1a1a]">
                            Início
                          </Link>
                        </SheetClose>

                        {/* Novo item "Shop" - Agora usando SheetClose */}
                        <SheetClose asChild>
                          <Link
                            href="/shop"
                            className="flex items-center p-2 -mx-2 rounded-md hover:bg-gray-100 text-nav-sm text-gray-700 hover:text-[#1a1a1a]"
                          >
                            Shop
                          </Link>
                        </SheetClose>

                        {/* Mapear coleções para Accordion ou Link direto */}
                        {fixedMainMenuCategories.length > 0 && (
                          <Accordion type="multiple" className="w-full">
                            {fixedMainMenuCategories.map((collection) => {
                              const currentSubcollections = dynamicSubcollections[collection.handle];
                              const isLoading = loadingSubcollections[collection.handle];

                              // No mobile, chamamos fetchSubcollections ao abrir o AccordionItem se ainda não foram carregadas.
                              // O AccordionTrigger em si não tem um onMouseEnter fácil, então o carregamento
                              // pode ser acionado no onValueChange do Accordion ou ao clicar no Trigger.
                              // Para simplificar, vamos manter a lógica de carregamento no handleMouseEnter,
                              // o que significa que no mobile as subcategorias só carregariam se o usuário
                              // interagisse com o menu desktop primeiro.
                              // Uma melhoria seria acionar fetchSubcollections no AccordionTrigger (onClick).
                              // Por ora, a renderização usará o que estiver em dynamicSubcollections.

                              const collectionElement = (
                                <AccordionItem value={collection.id} key={collection.id} className="border-b-0">
                                  <AccordionTrigger 
                                    className="flex items-center p-2 -mx-2 rounded-md text-nav-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#1a1a1a] hover:no-underline justify-between w-full"
                                    onClick={() => {
                                      // Se as subcoleções ainda não foram buscadas para este handle, busca agora.
                                      // Isso é uma alternativa ao hover para mobile.
                                      if (!dynamicSubcollections[collection.handle] && !loadingSubcollections[collection.handle]) {
                                        fetchSubcollections(collection.id, collection.handle);
                                      }
                                    }}
                                  >
                                    {collection.title}
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-1 pb-0 pl-4">
                                    <ul className="space-y-1">
                                      <li>
                                        <SheetClose asChild>
                                          <Link href={`/shop/${collection.handle}`} className="flex items-center p-1.5 -mx-1 rounded-md hover:bg-gray-100 text-nav-sm text-gray-600 hover:text-[#1a1a1a]">
                                            Ver Tudo em {collection.title}
                                          </Link>
                                        </SheetClose>
                                      </li>
                                      {isLoading && (
                                        <li className="p-1.5 -mx-1 text-caption text-gray-500">Carregando subcategorias...</li>
                                      )}
                                      {!isLoading && currentSubcollections && currentSubcollections.map((sub) => (
                                        <li key={`${collection.id}-${sub.id}`}>
                                          <SheetClose asChild>
                                            <Link href={`/shop/${sub.handle}`} className="flex items-center p-1.5 -mx-1 rounded-md hover:bg-gray-100 text-nav-sm text-gray-600 hover:text-[#1a1a1a]">
                                              {sub.title}
                                            </Link>
                                          </SheetClose>
                                        </li>
                                      ))}
                                      {!isLoading && currentSubcollections && currentSubcollections.length === 0 && (
                                         <li className="p-1.5 -mx-1 text-caption text-gray-500">Nenhuma subcategoria.</li>
                                      )}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                              // Se uma categoria principal não tiver subcategorias (nem potencial para carregar),
                              // ela poderia ser um link direto. Mas como queremos o Accordion para todas,
                              // mesmo que não tenham subcategorias, a estrutura acima é mantida.
                              // Se quiséssemos um link direto para aquelas sem subcategorias, a lógica seria:
                              // if (!collection.subcollections || collection.subcollections.length === 0) {
                              //   return (
                              //     <SheetClose asChild key={collection.id}>
                              //       <Link href={`/shop/${collection.handle}`} className="flex items-center p-2 -mx-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#1a1a1a] w-full">
                              //         {collection.title}
                              //       </Link>
                              //     </SheetClose>
                              //   );
                              // }
                              return collectionElement;
                            })}
                          </Accordion>
                        )}
                        {/* Fim do mapeamento de coleções */}

                        <hr className="my-4" />
                        <SheetClose asChild>
                           <Link href="/dashboard" className="flex items-center p-2 -mx-2 rounded-md hover:bg-gray-100 text-nav-sm text-gray-700 hover:text-[#1a1a1a]">
                            Minha Conta
                          </Link>
                        </SheetClose>
                         <SheetClose asChild>
                           <Link href="/auth/signin" className="flex items-center p-2 -mx-2 rounded-md hover:bg-gray-100 text-nav-sm text-gray-700 hover:text-[#1a1a1a]">
                            Entrar
                          </Link>
                        </SheetClose>
                         <SheetClose asChild>
                           <Link href="/auth/signup" className="flex items-center p-2 -mx-2 rounded-md hover:bg-gray-100 text-nav-sm text-gray-700 hover:text-[#1a1a1a]">
                            Cadastrar
                          </Link>
                        </SheetClose>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* O Mega Menu antigo foi substituído pelo Navigation Menu da shadcnui */}

      {/* Drawer do Carrinho antigo removido, agora é parte do Sheet acima */}
    </header>
  );
};

export default Header;
