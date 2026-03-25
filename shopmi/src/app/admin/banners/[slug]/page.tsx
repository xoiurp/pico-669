"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Settings,
  Menu,
  Layout,
  ArrowLeft,
  Save,
  Upload,
  Trash2,
} from "lucide-react";
import type {
  BannerRecord,
  HeroBannerConfig,
  CollectionBannersConfig,
  ContemporaryBannerConfig,
  VideoBannerConfig,
  ButtonConfig,
} from "@/types/banner";

// ---- Reusable form components ----

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ImageUploader({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/banners/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <FieldGroup label={label}>
      <div className="space-y-2">
        {value && (
          <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da imagem"
            className="flex-1 text-sm"
          />
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/webp,image/jpeg,image/png"
              className="hidden"
              onChange={handleUpload}
            />
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span>
                <Upload className="h-4 w-4" />
              </span>
            </Button>
          </label>
        </div>
      </div>
    </FieldGroup>
  );
}

function ButtonConfigEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: ButtonConfig;
  onChange: (v: ButtonConfig) => void;
}) {
  const update = (key: keyof ButtonConfig, val: string) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Texto">
          <Input value={value.text} onChange={(e) => update("text", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Link">
          <Input value={value.link} onChange={(e) => update("link", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Cor do fundo">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={value.bgColor === "transparent" ? "#000000" : value.bgColor}
              onChange={(e) => update("bgColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <Input
              value={value.bgColor}
              onChange={(e) => update("bgColor", e.target.value)}
              className="flex-1"
            />
          </div>
        </FieldGroup>
        <FieldGroup label="Cor do texto">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={value.textColor}
              onChange={(e) => update("textColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <Input
              value={value.textColor}
              onChange={(e) => update("textColor", e.target.value)}
              className="flex-1"
            />
          </div>
        </FieldGroup>
        <FieldGroup label="Cor da borda">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={value.borderColor}
              onChange={(e) => update("borderColor", e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <Input
              value={value.borderColor}
              onChange={(e) => update("borderColor", e.target.value)}
              className="flex-1"
            />
          </div>
        </FieldGroup>
        <FieldGroup label="Tamanho da fonte (px)">
          <Input
            type="number"
            value={value.fontSize}
            onChange={(e) => update("fontSize", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Estilo">
          <select
            value={value.style}
            onChange={(e) => update("style", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="filled">Preenchido</option>
            <option value="outline">Contorno</option>
          </select>
        </FieldGroup>
      </div>
    </div>
  );
}

// ---- Banner-specific forms ----

function HeroBannerForm({
  config,
  onChange,
}: {
  config: HeroBannerConfig;
  onChange: (c: HeroBannerConfig) => void;
}) {
  const update = (key: keyof HeroBannerConfig, val: unknown) =>
    onChange({ ...config, [key]: val });

  return (
    <div className="space-y-4">
      <ImageUploader
        label="Imagem de fundo"
        value={config.backgroundImage}
        onChange={(v) => update("backgroundImage", v)}
      />
      <FieldGroup label="Titulo">
        <Input value={config.title} onChange={(e) => update("title", e.target.value)} />
      </FieldGroup>
      <FieldGroup label="Tamanho do titulo (px)">
        <Input
          type="number"
          value={config.titleFontSize}
          onChange={(e) => update("titleFontSize", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="Subtitulo">
        <textarea
          value={config.subtitle}
          onChange={(e) => update("subtitle", e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
        />
      </FieldGroup>
      <FieldGroup label="Tamanho do subtitulo (px)">
        <Input
          type="number"
          value={config.subtitleFontSize}
          onChange={(e) => update("subtitleFontSize", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="Gradiente do overlay">
        <Input
          value={config.overlayGradient}
          onChange={(e) => update("overlayGradient", e.target.value)}
        />
      </FieldGroup>
      <ButtonConfigEditor
        title="Botao CTA"
        value={config.button}
        onChange={(v) => update("button", v)}
      />
    </div>
  );
}

function CollectionBannersForm({
  config,
  onChange,
}: {
  config: CollectionBannersConfig;
  onChange: (c: CollectionBannersConfig) => void;
}) {
  const updateSection = (idx: number, key: string, val: unknown) => {
    const newSections = [...config.sections] as CollectionBannersConfig["sections"];
    (newSections[idx] as unknown as Record<string, unknown>)[key] = val;
    onChange({ ...config, sections: newSections });
  };

  return (
    <div className="space-y-6">
      {config.sections.map((section, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className="text-base">
              Secao {idx + 1}: {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploader
                label="Imagem esquerda"
                value={section.leftImage}
                onChange={(v) => updateSection(idx, "leftImage", v)}
              />
              <ImageUploader
                label="Imagem direita"
                value={section.rightImage}
                onChange={(v) => updateSection(idx, "rightImage", v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Opacidade overlay esquerdo (0-100)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={section.leftOverlayOpacity}
                  onChange={(e) =>
                    updateSection(idx, "leftOverlayOpacity", Number(e.target.value))
                  }
                />
              </FieldGroup>
              <FieldGroup label="Opacidade overlay direito (0-100)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={section.rightOverlayOpacity}
                  onChange={(e) =>
                    updateSection(idx, "rightOverlayOpacity", Number(e.target.value))
                  }
                />
              </FieldGroup>
            </div>
            <FieldGroup label="Titulo">
              <Input
                value={section.title}
                onChange={(e) => updateSection(idx, "title", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Tamanho do titulo (px)">
              <Input
                type="number"
                value={section.titleFontSize}
                onChange={(e) => updateSection(idx, "titleFontSize", e.target.value)}
              />
            </FieldGroup>
            <div className="grid grid-cols-3 gap-3">
              <FieldGroup label="Texto do botao">
                <Input
                  value={section.buttonText}
                  onChange={(e) => updateSection(idx, "buttonText", e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Link do botao">
                <Input
                  value={section.buttonLink}
                  onChange={(e) => updateSection(idx, "buttonLink", e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Tamanho fonte botao (px)">
                <Input
                  type="number"
                  value={section.buttonFontSize}
                  onChange={(e) => updateSection(idx, "buttonFontSize", e.target.value)}
                />
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ContemporaryBannerForm({
  config,
  onChange,
}: {
  config: ContemporaryBannerConfig;
  onChange: (c: ContemporaryBannerConfig) => void;
}) {
  const update = (key: keyof ContemporaryBannerConfig, val: unknown) =>
    onChange({ ...config, [key]: val });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploader
          label="Imagem esquerda"
          value={config.leftImage}
          onChange={(v) => update("leftImage", v)}
        />
        <ImageUploader
          label="Imagem direita"
          value={config.rightImage}
          onChange={(v) => update("rightImage", v)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Opacidade overlay esquerdo (0-100)">
          <Input
            type="number"
            min={0}
            max={100}
            value={config.leftOverlayOpacity}
            onChange={(e) => update("leftOverlayOpacity", Number(e.target.value))}
          />
        </FieldGroup>
        <FieldGroup label="Opacidade overlay direito (0-100)">
          <Input
            type="number"
            min={0}
            max={100}
            value={config.rightOverlayOpacity}
            onChange={(e) => update("rightOverlayOpacity", Number(e.target.value))}
          />
        </FieldGroup>
      </div>
      <FieldGroup label="Titulo">
        <Input value={config.title} onChange={(e) => update("title", e.target.value)} />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Tamanho titulo desktop (px)">
          <Input
            type="number"
            value={config.titleFontSize}
            onChange={(e) => update("titleFontSize", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Tamanho titulo mobile (px)">
          <Input
            type="number"
            value={config.mobileTitleFontSize}
            onChange={(e) => update("mobileTitleFontSize", e.target.value)}
          />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Texto do botao">
          <Input
            value={config.buttonText}
            onChange={(e) => update("buttonText", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Link do botao">
          <Input
            value={config.buttonLink}
            onChange={(e) => update("buttonLink", e.target.value)}
          />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Tamanho fonte botao desktop (px)">
          <Input
            type="number"
            value={config.buttonFontSize}
            onChange={(e) => update("buttonFontSize", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Tamanho fonte botao mobile (px)">
          <Input
            type="number"
            value={config.mobileButtonFontSize}
            onChange={(e) => update("mobileButtonFontSize", e.target.value)}
          />
        </FieldGroup>
      </div>
    </div>
  );
}

function VideoBannerForm({
  config,
  onChange,
}: {
  config: VideoBannerConfig;
  onChange: (c: VideoBannerConfig) => void;
}) {
  const update = (key: keyof VideoBannerConfig, val: unknown) =>
    onChange({ ...config, [key]: val });

  const updateSaleBar = (key: string, val: unknown) =>
    onChange({ ...config, saleBar: { ...config.saleBar, [key]: val } });

  return (
    <div className="space-y-4">
      <FieldGroup label="URL do video">
        <Input
          value={config.videoUrl}
          onChange={(e) => update("videoUrl", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="Opacidade do overlay (0-100)">
        <Input
          type="number"
          min={0}
          max={100}
          value={config.overlayOpacity}
          onChange={(e) => update("overlayOpacity", Number(e.target.value))}
        />
      </FieldGroup>
      <FieldGroup label="Tagline">
        <Input
          value={config.tagline}
          onChange={(e) => update("tagline", e.target.value)}
        />
      </FieldGroup>
      <FieldGroup label="Titulo">
        <Input
          value={config.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Palavra em italico">
          <Input
            value={config.titleItalicWord}
            onChange={(e) => update("titleItalicWord", e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Tamanho do titulo (px)">
          <Input
            type="number"
            value={config.titleFontSize}
            onChange={(e) => update("titleFontSize", e.target.value)}
          />
        </FieldGroup>
      </div>

      <ButtonConfigEditor
        title="Botao primario"
        value={config.primaryButton}
        onChange={(v) => update("primaryButton", v)}
      />
      <ButtonConfigEditor
        title="Botao secundario"
        value={config.secondaryButton}
        onChange={(v) => update("secondaryButton", v)}
      />

      {/* Sale Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Barra de Liquidacao
            <label className="flex items-center gap-2 text-sm font-normal">
              <input
                type="checkbox"
                checked={config.saleBar.enabled}
                onChange={(e) => updateSaleBar("enabled", e.target.checked)}
              />
              Ativa
            </label>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldGroup label="Titulo">
            <Input
              value={config.saleBar.title}
              onChange={(e) => updateSaleBar("title", e.target.value)}
            />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Texto do botao">
              <Input
                value={config.saleBar.buttonText}
                onChange={(e) => updateSaleBar("buttonText", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Link do botao">
              <Input
                value={config.saleBar.buttonLink}
                onChange={(e) => updateSaleBar("buttonLink", e.target.value)}
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Data alvo do countdown">
            <Input
              type="datetime-local"
              value={
                config.saleBar.countdownTargetDate
                  ? new Date(config.saleBar.countdownTargetDate)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                updateSaleBar(
                  "countdownTargetDate",
                  new Date(e.target.value).toISOString()
                )
              }
            />
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- Main editor page ----

export default function BannerEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [banner, setBanner] = useState<BannerRecord | null>(null);
  const [config, setConfig] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch(`/api/admin/banners/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBanner(data);
          setConfig(data.config);
        }
      } catch (err) {
        console.error("Failed to fetch banner:", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchBanner();
  }, [slug]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/banners/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  function renderForm() {
    if (!config) return null;

    switch (slug) {
      case "hero":
        return (
          <HeroBannerForm
            config={config as HeroBannerConfig}
            onChange={(c) => setConfig(c)}
          />
        );
      case "collection-banners":
        return (
          <CollectionBannersForm
            config={config as CollectionBannersConfig}
            onChange={(c) => setConfig(c)}
          />
        );
      case "contemporary-banner":
        return (
          <ContemporaryBannerForm
            config={config as ContemporaryBannerConfig}
            onChange={(c) => setConfig(c)}
          />
        );
      case "video-banner":
        return (
          <VideoBannerForm
            config={config as VideoBannerConfig}
            onChange={(c) => setConfig(c)}
          />
        );
      default:
        return <p>Banner desconhecido</p>;
    }
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
            className={`flex items-center p-3 rounded-lg bg-[#1a1a1a] text-white ${!sidebarOpen && "justify-center"}`}
            onClick={() => router.push("/admin/banners")}
          >
            <Layout className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Banners</span>}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/banners")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {banner?.title || "Editar Banner"}
                </h1>
                <p className="text-sm text-gray-500">{slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-sm text-green-600 font-medium">
                  Salvo com sucesso!
                </span>
              )}
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : !config ? (
            <p className="text-gray-500">Banner nao encontrado.</p>
          ) : (
            renderForm()
          )}
        </main>
      </div>
    </div>
  );
}
