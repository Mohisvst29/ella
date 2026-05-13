"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function HeroSection() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();
  const [currentImg, setCurrentImg] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const images = (settings?.hero_bg_url || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop")
    .split(",")
    .filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % images.length);
    }, 5000); // 5 seconds per image
    return () => clearInterval(interval);
  }, [images.length]);

  const stats = [
    ["500+", t("hero.stats.weddings")],
    ["100%", t("hero.stats.crew")],
    ["7", t("hero.stats.years")]
  ];

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "flex-end", paddingBottom: "clamp(60px, 8vw, 100px)", overflow: "hidden" }}>
      {/* BG Image or Video */}
      <div style={{ position: "absolute", inset: 0 }}>
        {settings?.hero_video_url ? (
          <>
            <video 
              src={settings.hero_video_url} 
              autoPlay loop muted={isMuted} playsInline 
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: 0.6 }} 
            />
            {/* Sound Toggle Button */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              style={{
                position: "absolute", bottom: 40, [isRtl ? 'left' : 'right']: 40,
                width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10
              }}
            >
              <span className="icon" style={{ fontSize: 20 }}>{isMuted ? "volume_off" : "volume_up"}</span>
            </button>
          </>
        ) : (
          images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Hero" 
              style={{ 
                position: "absolute", inset: 0, 
                width: "100%", height: "100%", 
                objectFit: "cover", objectPosition: "center top", 
                opacity: currentImg === idx ? 0.8 : 0,
                transition: "opacity 1.5s ease-in-out" 
              }}
            />
          ))
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #1a1114 10%, rgba(26,17,20,0.2) 60%, transparent 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: isRtl ? "linear-gradient(to left, rgba(26,17,20,0.4) 30%, transparent 100%)" : "linear-gradient(to right, rgba(26,17,20,0.4) 30%, transparent 100%)" }} />
      </div>

      {/* Orbs */}
      <div className="float" style={{ position: "absolute", top: "20%", [isRtl ? 'left' : 'right']: "8%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,176,204,0.18), transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Content */}
      <div className="container" style={{ position: "relative", zIndex: 2, paddingTop: 120 }}>
        <div style={{ maxWidth: 640 }}>
          {/* Eyebrow */}
          <div className="anim-fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 18px", borderRadius: 50, marginBottom: 28,
            border: "1px solid rgba(255,176,204,0.2)",
            background: "rgba(255,176,204,0.06)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pink)", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pink)" }}>
              {t("hero.eyebrow")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="anim-fade-up delay-1" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(42px, 6vw, 72px)",
            fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em",
            color: "var(--text)", marginBottom: 24,
          }}>
            {isRtl ? (settings?.hero_title_ar || t("hero.titlePart1")) : (settings?.hero_title_en || t("hero.titlePart1"))}{" "}
            <span className="grad-text" style={{ fontStyle: "italic" }}>
              {isRtl ? (settings?.hero_span_ar || t("hero.titlePart2")) : (settings?.hero_span_en || t("hero.titlePart2"))}
            </span>
          </h1>

          <p className="anim-fade-up delay-2" style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 40, maxWidth: 480 }}>
            {isRtl ? (settings?.hero_desc_ar || t("hero.desc")) : (settings?.hero_desc_en || t("hero.desc"))}
          </p>

          {/* CTAs */}
          <div className="anim-fade-up delay-3" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <Link href="/contact" className="btn btn-primary hover-glow">{t("nav.bookDate")}</Link>
            <Link href="/gallery" className="btn btn-outline">{t("hero.viewPortfolio")}</Link>
          </div>

          {/* Stats */}
          <div className="anim-fade-up delay-4" style={{ display: "flex", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
            {stats.map(([val, lbl], i) => (
              <div key={lbl} className={`anim-fade-up`} style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <div className="grad-text" style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
