// app/tools/seo.ts

import type { Metadata } from "next";
import { getNodeById } from "./repository";
import { siteConfig } from "@/lib/siteConfig";

export async function generateNodeMetadata(id: string): Promise<Metadata> {
  const node = await getNodeById(id);
  if (!node) return {};

  const title = node.seo?.title || node.name;
  const description = node.seo?.description || node.description || siteConfig.description;
  const image = node.media?.featuredImage;

  return {
    title,
    description,
    keywords: node.seo?.keywords || node.tags,
    openGraph: {
      title,
      description,
      url: `${siteConfig.domain}/${id}`,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "article",
      images: image ? [image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
