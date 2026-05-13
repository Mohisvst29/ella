import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/layout/ScrollReveal";
import CinematicScroll from "@/components/layout/CinematicScroll";
import { LanguageProvider } from "@/context/LanguageContext";
import { SettingsProvider } from "@/context/SettingsContext";
import connectToDatabase, { SiteSetting } from "@/lib/db";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: { template: "%s | Ayla Media", default: "Ayla Media | Female-Only Wedding Photography Saudi Arabia" },
  description: "Saudi Arabia's premier female-only wedding photography studio. Cinematic, editorial, and deeply private.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connectToDatabase();
  const dbSettings = await SiteSetting.find().lean();
  const settings: Record<string, string> = {};
  dbSettings.forEach((s: any) => { settings[s.key] = s.value; });

  const fontEn = settings.font_en || "Playfair Display";
  const fontAr = settings.font_ar || "Tajawal";
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontEn.replace(/ /g, '+')}:ital,wght@0,400;0,600;0,700;1,400&family=${fontAr.replace(/ /g, '+')}:wght@400;500;700;800&display=swap`;

  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
        <link rel="stylesheet" href={fontUrl} />
        <style>{`
          :root {
            --font-display-en: "${fontEn}", "Playfair Display", serif;
            --font-display-ar: "${fontAr}", "Tajawal", sans-serif;
          }
          [dir="ltr"] body, [dir="ltr"] input, [dir="ltr"] button, [dir="ltr"] textarea {
            font-family: var(--font-display-en);
          }
          [dir="rtl"] body, [dir="rtl"] input, [dir="rtl"] button, [dir="rtl"] textarea {
            font-family: var(--font-display-ar);
          }
          [dir="ltr"] .font-display { font-family: var(--font-display-en); }
          [dir="rtl"] .font-display { font-family: var(--font-display-ar); }
        `}</style>
      </head>
      <body style={{ position: "relative", minHeight: "100vh" }}>
        <SettingsProvider settings={settings}>
          <LanguageProvider>
            <Navbar />
            <main className="anim-fade-in">
              {children}
            </main>
            <Footer />
            
            <ScrollReveal />
            <CinematicScroll />

            {/* Cinematic Global Background */}
            <div data-parallax="0.05" style={{
              position: "fixed", inset: 0, zIndex: -1,
              backgroundImage: `url('${settings.global_bg_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDT7wKtWgKfcN906WBH025m-xCV3o1YsX1curSfrZM_sytyh88Eu8aH8Z0MKf50JwggyeskoGVmv_OzefgNGBBegm_uRkmPVlwtgxJ5Tst86KuX84CaS8F8IHldN-I45hZ0dPb_9urBrtQhhrYcG56Bg3TIXYB34pgITf7wOl6_JqzkHRKuMG2YSaVtZqqVqnAsR7wWg821-ZClDJBm_JBj7z6MV5ceqoe7Own-5ARWDtcFDeZSscnwuNQU3kN_ltaYdDV7YSGRKBhN"}')`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.1, filter: "grayscale(100%) brightness(0.8)",
              pointerEvents: "none",
              transition: "transform 0.2s ease-out"
            }} />
            {/* Film Grain Texture */}
            <div style={{
              position: "fixed", inset: 0, zIndex: -1,
              backgroundImage: "url('https://www.transparenttextures.com/patterns/film-grain.png')",
              opacity: 0.12, pointerEvents: "none", mixBlendMode: "overlay"
            }} />

            {/* WhatsApp FAB */}
            {settings.social_whatsapp && (
              <a href={`https://wa.me/${settings.social_whatsapp}`} target="_blank" rel="noopener noreferrer" className="whatsapp-fab"
                style={{
                position: "fixed", bottom: 32, right: 32, width: 56, height: 56,
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, var(--pink), var(--purple), var(--cyan))",
                color: "#fff", zIndex: 90,
                boxShadow: "0 0 25px rgba(255,176,204,0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              aria-label="WhatsApp"
            >
              <span className="icon" style={{ fontSize: 24 }}>chat_bubble</span>
            </a>
            )}
          </LanguageProvider>
        </SettingsProvider>
        <style>{`.whatsapp-fab:hover { transform: scale(1.1) !important; }`}</style>
      </body>
    </html>
  );
}
