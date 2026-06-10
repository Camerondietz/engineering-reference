// app/sitemap.ts

import { getAllNodes } from "@/app/tools/repository";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const nodes = await getAllNodes();

  const base = "https://engineering-reference.example.com";
  return [
    {
      url: base,
      lastModified: new Date(),
    },
    ...nodes.map((node) => ({
      url: `${base}/${node.id}`,
      lastModified: new Date(),
    })),
  ];
}