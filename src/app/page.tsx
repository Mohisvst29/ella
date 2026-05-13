import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import FeaturedGallery from "@/components/home/FeaturedGallery";
import ServicesSection from "@/components/home/ServicesSection";
import PricingTeaser from "@/components/home/PricingTeaser";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export const metadata: Metadata = {
  title: "Ayla Media | Exclusive Female-Only Wedding Photography Saudi Arabia",
  description:
    "Exclusive female-only wedding photography for the modern Saudi bride. Capturing every whispered secret and luminous moment with cinematic precision.",
};

export default function HomePage() {
  return (
    <div className="page-transition">
      <HeroSection />
      <FeaturedGallery />
      <ServicesSection />
      <PricingTeaser />
      <TestimonialsSection />
    </div>
  );
}
