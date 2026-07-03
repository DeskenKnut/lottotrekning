import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  // Blokkerer alle søkemotorer mens dette er en funksjonstest.
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
