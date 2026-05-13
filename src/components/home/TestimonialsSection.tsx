"use client";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";

export default function TestimonialsSection() {
  const { t, isRtl } = useLanguage();
  const settings = useSettings();

  const testimonials = t("testimonials.list") as any[];

  return (
    <section className="section" style={{ background: "var(--bg-2)", position: "relative", overflow: "hidden" }}>
      {/* Background Image */}
      <div data-parallax="0.12" style={{ position: "absolute", inset: 0, backgroundImage: `url('${settings?.global_bg_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDT7wKtWgKfcN906WBH025m-xCV3o1YsX1curSfrZM_sytyh88Eu8aH8Z0MKf50JwggyeskoGVmv_OzefgNGBBegm_uRkmPVlwtgxJ5Tst86KuX84CaS8F8IHldN-I45hZ0dPb_9urBrtQhhrYcG56Bg3TIXYB34pgITf7wOl6_JqzkHRKuMG2YSaVtZqqVqnAsR7wWg821-ZClDJBm_JBj7z6MV5ceqoe7Own-5ARWDtcFDeZSscnwuNQU3kN_ltaYdDV7YSGRKBhN"}')`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none", transition: "transform 0.15s ease-out" }} />
      <div className="container reveal">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="eyebrow">{t("testimonials.eyebrow")}</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--text)" }}>
            {t("testimonials.title")}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 56 }}>
          {Array.isArray(testimonials) && testimonials.map((t_item: any, i: number) => (
            <div key={i} className="card anim-fade-up hover-lift" style={{ 
              animationDelay: `${i * 0.15}s`, 
              padding: "36px 32px", 
              position: "relative",
              textAlign: isRtl ? "right" : "left"
            }}>
              {/* Stars */}
              <div style={{ position: "absolute", top: 24, [isRtl ? 'left' : 'right']: 24, display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="icon icon-fill" style={{ fontSize: 14, color: "var(--pink)" }}>star</span>
                ))}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 56, lineHeight: 1, marginBottom: 16, opacity: 0.25, color: "var(--pink)", textAlign: isRtl ? "right" : "left" }}>&ldquo;</div>
              <p style={{ fontSize: 15, fontStyle: "italic", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 28 }}>{t_item.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,176,204,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="icon" style={{ color: "var(--pink)", fontSize: 20 }}>person</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t_item.name}</div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", marginTop: 2 }}>{t_item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/contact" className="btn btn-primary">
            <span className="icon" style={{ fontSize: 16 }}>calendar_month</span>
            {t("nav.bookDate")}
          </Link>
        </div>
      </div>
    </section>
  );
}
