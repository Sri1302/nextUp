import type { MetadataRoute } from "next";
import { listCreators } from "@/lib/data";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const creators = await listCreators("", undefined, 1000);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "daily", priority: 0.8 },
    ...creators.map((c) => ({ url: `${base}/@${c.handle}`, changeFrequency: "daily" as const, priority: 0.7 })),
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
