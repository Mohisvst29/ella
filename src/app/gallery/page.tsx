import type { Metadata } from "next";
import getDb from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery | Exclusive Wedding Photography Portfolio",
  description:
    "Explore our curated selection of weddings across Saudi Arabia. Each frame is a masterpiece of light, emotion, and exclusivity, tailored for the modern bride.",
};

export const dynamic = "force-dynamic";

export default function GalleryPage() {
  const db = getDb();
  const items = db
    .prepare("SELECT * FROM gallery_items ORDER BY featured DESC, created_at DESC")
    .all() as {
    id: number;
    title: string;
    category: string;
    image_url: string;
    location: string | null;
    year: number | null;
    featured: number;
  }[];

  const categories = ["All Collections", ...Array.from(new Set(items.map((i) => i.category)))];

  return <GalleryClient items={items} categories={categories} />;
}
