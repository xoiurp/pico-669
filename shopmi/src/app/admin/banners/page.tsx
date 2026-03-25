"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Settings,
  Menu,
  Image as ImageIcon,
  Pencil,
  Layout,
} from "lucide-react";
import type { BannerRecord } from "@/types/banner";

const BANNER_ICONS: Record<string, string> = {
  hero: "Hero Banner",
  "collection-banners": "Collection Banners",
  "contemporary-banner": "Contemporary Banner",
  "video-banner": "Video Banner",
};

export default function AdminBannersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/banners/seed", { method: "POST" });
      if (res.ok) {
        await fetchBanners();
      }
    } catch (err) {
      console.error("Failed to seed:", err);
    } finally {
      setSeeding(false);
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b">
          <div className="flex items-center">
            <img src="/logo-pico.svg" alt="PICO" className="h-8 w-8" />
            {sidebarOpen && (
              <span className="ml-3 text-xl font-bold text-gray-800">Admin</span>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div
            className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${!sidebarOpen && "justify-center"}`}
            onClick={() => router.push("/admin/dashboard")}
          >
            <BarChart3 className="h-5 w-5 text-gray-600" />
            {sidebarOpen && <span className="ml-3 text-gray-600">Dashboard</span>}
          </div>

          <div
            className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${!sidebarOpen && "justify-center"}`}
            onClick={() => router.push("/admin/orders")}
          >
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            {sidebarOpen && <span className="ml-3 text-gray-600">Pedidos</span>}
          </div>

          <div
            className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${!sidebarOpen && "justify-center"}`}
            onClick={() => router.push("/admin/products")}
          >
            <Package className="h-5 w-5 text-gray-600" />
            {sidebarOpen && <span className="ml-3 text-gray-600">Produtos</span>}
          </div>

          <div
            className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${!sidebarOpen && "justify-center"}`}
            onClick={() => router.push("/admin/customers")}
          >
            <Users className="h-5 w-5 text-gray-600" />
            {sidebarOpen && <span className="ml-3 text-gray-600">Clientes</span>}
          </div>

          <div
            className={`flex items-center p-3 rounded-lg bg-[#1a1a1a] text-white ${!sidebarOpen && "justify-center"}`}
          >
            <Layout className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Banners</span>}
          </div>

          <div
            className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${!sidebarOpen && "justify-center"}`}
            onClick={() => router.push("/admin/finance")}
          >
            <DollarSign className="h-5 w-5 text-gray-600" />
            {sidebarOpen && <span className="ml-3 text-gray-600">Financeiro</span>}
          </div>

          <div
            className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${!sidebarOpen && "justify-center"}`}
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="h-5 w-5 text-gray-600" />
            {sidebarOpen && <span className="ml-3 text-gray-600">Configurações</span>}
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className={`flex items-center ${!sidebarOpen && "justify-center"}`}>
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white font-bold">
              {session.user.name?.[0] || "A"}
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-800">{session.user.name}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Gerenciar Banners
                </h1>
                <p className="text-sm text-gray-500">
                  Edite textos, imagens, cores e layout dos banners da home
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Carregando banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <Card className="max-w-md mx-auto mt-12">
              <CardHeader className="text-center">
                <CardTitle>Nenhum banner configurado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500 mb-6">
                  Clique abaixo para criar as configurações iniciais dos banners
                  com os valores atuais do site.
                </p>
                <Button onClick={handleSeed} disabled={seeding}>
                  {seeding ? "Criando..." : "Inicializar Banners"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <Card
                  key={banner.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/admin/banners/${banner.slug}`)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{banner.title}</CardTitle>
                        <p className="text-xs text-gray-400">{banner.slug}</p>
                      </div>
                    </div>
                    <Badge variant={banner.isActive ? "default" : "secondary"}>
                      {banner.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Atualizado em{" "}
                        {new Date(banner.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
