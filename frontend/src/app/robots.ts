import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/about", disallow: ["/", "/classrooms", "/submissions", "/profile"] },
    sitemap: "https://topic-guard.vercel.app/sitemap.xml",
  };
}