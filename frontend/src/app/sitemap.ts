import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://topic-guard.vercel.app";
  return [
    { url: `${base}/about`, changeFrequency: "monthly", priority: 1 },
  ];
}