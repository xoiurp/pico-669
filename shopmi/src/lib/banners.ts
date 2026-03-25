import { prisma } from "./db";
import type { BannerSlug, BannerConfigData } from "../types/banner";

export async function getBannerConfig(slug: BannerSlug) {
  const record = await prisma.bannerConfig.findUnique({
    where: { slug },
  });
  if (!record || !record.isActive) return null;
  return {
    ...record,
    config: record.config as unknown as BannerConfigData,
  };
}

export async function getAllBannerConfigs() {
  const records = await prisma.bannerConfig.findMany({
    orderBy: { createdAt: "asc" },
  });
  return records.map((r) => ({
    ...r,
    config: r.config as unknown as BannerConfigData,
  }));
}

export async function updateBannerConfig(
  slug: BannerSlug,
  config: BannerConfigData,
  updatedBy?: string
) {
  return prisma.bannerConfig.update({
    where: { slug },
    data: {
      config: config as object,
      updatedBy,
    },
  });
}

export async function upsertBannerConfig(
  slug: BannerSlug,
  title: string,
  config: BannerConfigData
) {
  return prisma.bannerConfig.upsert({
    where: { slug },
    update: { config: config as object },
    create: { slug, title, config: config as object },
  });
}
