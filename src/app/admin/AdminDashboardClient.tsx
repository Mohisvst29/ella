"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface Booking { id: string; client_name: string; mobile: string; email: string|null; event_type: string; venue_location: string|null; package: string; additional_services: string|null; notes: string|null; status: string; created_at: string; }
interface Stats { totalBookings: number; revenue: number; galleryCount: number; newToday: number; pendingBookings: number; confirmedBookings: number; blogCount: number; subscriberCount: number; }

interface AdminProps {
  bookings: Booking[];
  stats: Stats;
  galleryItems?: any[];
  blogPosts?: any[];
  packages?: any[];
  subscribers?: any[];
  settings?: Record<string, string>;
}

export default function AdminDashboardClient({ bookings, stats, galleryItems = [], blogPosts = [], packages = [], subscribers = [], settings = {} }: AdminProps) {
  const { t, isRtl } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking|null>(null);
  const [busy, setBusy] = useState<string|null>(null);
  const [settingsState, setSettingsState] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [addingGalleryImage, setAddingGalleryImage] = useState<{ image_url: string, title: string, category: string } | null>(null);
  const [editingPost, setEditingPost] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setSettingsState(prev => ({ ...prev, [field]: data.url }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: isRtl ? "قيد الانتظار" : "PENDING",   bg: "rgba(255,176,204,0.12)", color: "#ffb0cc" },
    confirmed: { label: isRtl ? "مؤكد" : "CONFIRMED", bg: "rgba(145,205,255,0.12)", color: "#91cdff" },
    completed: { label: isRtl ? "مكتمل" : "COMPLETED", bg: "rgba(145,205,255,0.16)", color: "#91cdff" },
    cancelled: { label: isRtl ? "ملغي" : "CANCELLED", bg: "rgba(255,180,171,0.12)", color: "#ffb4ab" },
    "follow-up": { label: isRtl ? "متابعة" : "FOLLOW UP", bg: "rgba(209,188,255,0.12)", color: "#d1bcff" },
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const updateStatus = async (id: string, status: string) => {
    setBusy(id);
    await fetch(`/api/bookings/${id}`, { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ status }) 
    });
    setBusy(null);
    router.refresh();
  };

  const navItems = [
    { id: "Overview", icon: "grid_view", label: t("admin.dashboard") },
    { id: "Gallery", icon: "photo_library", label: t("admin.gallery") },
    { id: "Pricing", icon: "payments", label: t("admin.pricing") },
    { id: "Blog", icon: "article", label: t("admin.blog") },
    { id: "Inquiries", icon: "mail", label: t("admin.inquiries") },
    { id: "Subscribers", icon: "group", label: t("admin.subscribers") },
    { id: "Settings", icon: "settings", label: isRtl ? "الإعدادات" : "Settings" },
  ];

  const statCards = [
    { label: t("admin.totalBookings"), value: stats.totalBookings, icon: "calendar_month", badge: null, color: "var(--pink)" },
    { label: t("admin.revenue"), value: stats.revenue.toLocaleString(), icon: "payments", badge: isRtl ? "ريال" : "SAR", color: "var(--pink)" },
    { label: t("admin.visits"), value: "4,210", icon: "visibility", badge: null, color: "var(--cyan)" },
    { label: t("admin.newInquiries"), value: stats.newToday, icon: "mail", badge: isRtl ? "جديد" : "NEW", color: "var(--pink)" },
  ];

  const s = (obj: React.CSSProperties): React.CSSProperties => obj;

  return (
    <div style={s({ display: "flex", minHeight: "100vh", background: "var(--bg)", color: "var(--text)", flexDirection: isRtl ? "row-reverse" : "row" })}>
      {/* Sidebar */}
      <aside style={s({ width: 220, flexShrink: 0, background: "var(--bg-2)", borderRight: isRtl ? "none" : "1px solid var(--border)", borderLeft: isRtl ? "1px solid var(--border)" : "none", display: "flex", flexDirection: "column", padding: "28px 0", position: "fixed", top: 0, [isRtl ? 'right' : 'left']: 0, height: "100vh", zIndex: 50, textAlign: isRtl ? "right" : "left" })}>
        <div style={s({ padding: "0 20px 28px", borderBottom: "1px solid var(--border)" })}>
          <div style={s({ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--pink)" })}>Ayla Media</div>
          <div style={s({ fontSize: 11, color: "var(--text-dim)", marginTop: 4 })}>{t("admin.portal")}</div>
        </div>

        <nav style={s({ padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, flexGrow: 1 })}>
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              style={s({
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: activeTab === item.id ? "rgba(255,126,179,0.12)" : "transparent",
                color: activeTab === item.id ? "#ff7eb3" : "var(--text-muted)",
                border: "none", width: "100%", textAlign: isRtl ? "right" : "left",
                flexDirection: isRtl ? "row-reverse" : "row",
                transition: "background 0.2s",
              })}
            >
              <span className="icon" style={{ fontSize: 19 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={s({ padding: "16px 12px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4 })}>
          <Link href="/" style={s({ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12, color: "var(--text-muted)", flexDirection: isRtl ? "row-reverse" : "row" })}>
            <span className="icon" style={{ fontSize: 19 }}>home</span> {t("admin.viewSite")}
          </Link>
          <button style={s({ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: isRtl ? "right" : "left", flexDirection: isRtl ? "row-reverse" : "row" })}>
            <span className="icon" style={{ fontSize: 19 }}>settings</span> {t("admin.settings")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={s({ [isRtl ? 'marginRight' : 'marginLeft']: 220, flex: 1, padding: "48px 48px 64px", overflowX: "hidden", textAlign: isRtl ? "right" : "left" })}>
        
        {activeTab === "Overview" && (
          <>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <div>
                <h1 style={s({ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, color: "var(--text)", marginBottom: 6 })}>{t("admin.overview")}</h1>
                <p style={s({ fontSize: 14, color: "var(--text-dim)" })}>{t("admin.welcome")}</p>
              </div>
            </div>

            {/* Stat cards */}
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 })}>
              {statCards.map((c, i) => (
                <div key={i} style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 28, position: "relative", overflow: "hidden" })}>
                  <div style={s({ position: "absolute", top: 12, [isRtl ? 'left' : 'right']: 12, opacity: 0.1 })}>
                    <span className="icon" style={{ fontSize: 48, color: c.color }}>{c.icon}</span>
                  </div>
                  <p style={s({ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-dim)", marginBottom: 12 })}>{c.label}</p>
                  <div style={s({ display: "flex", alignItems: "flex-end", gap: 10, flexDirection: isRtl ? "row-reverse" : "row" })}>
                    <span style={s({ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: c.color, lineHeight: 1 })}>{c.value}</span>
                    {c.badge && <span style={s({ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: "rgba(255,176,204,0.15)", color: "var(--pink)", padding: "4px 8px", borderRadius: 20, marginBottom: 4 })}>{c.badge}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Inquiries Table */}
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <div style={s({ padding: "24px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 })}>{t("admin.recentInquiries")}</h2>
                <div style={s({ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" })}>
                  {["all","pending","confirmed","follow-up"].map(t_tab => (
                    <button key={t_tab} onClick={() => setFilter(t_tab)} style={s({
                      padding: "6px 16px", borderRadius: 50, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit",
                      background: filter === t_tab ? "var(--pink)" : "transparent",
                      color: filter === t_tab ? "#640038" : "var(--text-dim)",
                      border: filter === t_tab ? "1px solid transparent" : "1px solid var(--border)",
                    })}>{t_tab === "all" ? t("admin.viewAll") : (statusMap[t_tab]?.label)}</button>
                  ))}
                </div>
              </div>

              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    {[t("admin.client"), t("admin.date"), t("contact.form.package"), t("admin.status"), t("admin.action")].map(h => (
                      <th key={h} style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-dim)" })}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={s({ padding: 40, textAlign: "center", color: "var(--text-dim)" })}>{isRtl ? "لا توجد طلبات حجز حالياً" : "No booking requests found"}</td></tr>
                  ) : filtered.map(b => {
                    const st = statusMap[b.status] || statusMap.pending;
                    return (
                      <tr key={b.id} style={s({ borderTop: "1px solid var(--border)" })}>
                        <td style={s({ padding: "16px 20px" })}>
                          <div style={s({ fontSize: 14, fontWeight: 600 })}>{b.client_name}</div>
                          <div style={s({ fontSize: 12, color: "var(--text-dim)", marginTop: 2 })}>{b.mobile}</div>
                        </td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" })}>{new Date(b.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}</td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--pink)", textTransform: "capitalize", fontWeight: 600 })}>{b.package}</td>
                        <td style={s({ padding: "16px 20px" })}>
                          <span style={s({ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", background: st.bg, color: st.color })}>{st.label}</span>
                        </td>
                        <td style={s({ padding: "16px 20px" })}>
                          <div style={s({ display: "flex", gap: 8, justifyContent: isRtl ? "flex-end" : "flex-start" })}>
                            <button onClick={() => setSelected(b)} style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer" })}>
                              <span className="icon" style={{ fontSize: 16 }}>more_horiz</span>
                            </button>
                            <button 
                              onClick={() => updateStatus(b.id, b.status === 'confirmed' ? 'pending' : 'confirmed')} 
                              disabled={busy === b.id}
                              style={s({ width: 32, height: 32, borderRadius: 8, background: "rgba(255,126,179,0.1)", border: "1px solid var(--pink)", color: "var(--pink)", cursor: "pointer", opacity: busy === b.id ? 0.5 : 1 })}
                            >
                              <span className="icon" style={{ fontSize: 16 }}>{b.status === 'confirmed' ? 'undo' : 'check'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "Gallery" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.gallery")}</h2>
              <button onClick={() => setAddingGalleryImage({ image_url: "", title: "", category: "Wedding" })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>{isRtl ? "+ إضافة صورة" : "+ Add Image"}</button>
            </div>
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 })}>
              {galleryItems.map((item: any) => (
                <div key={item.id} style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", position: "relative" })}>
                  <div style={s({ height: 160, backgroundImage: `url(${item.image_url})`, backgroundSize: "cover", backgroundPosition: "center" })} />
                  <div style={s({ padding: 12 })}>
                    <div style={s({ fontSize: 14, fontWeight: 600 })}>{item.title}</div>
                    <div style={s({ fontSize: 12, color: "var(--text-dim)", marginTop: 4 })}>{item.category} • {item.year}</div>
                  </div>
                  <button 
                    onClick={async () => {
                      if(confirm(isRtl ? "هل أنت متأكد من حذف هذه الصورة؟" : "Are you sure you want to delete this image?")) {
                        await fetch(`/api/gallery/${item.id}`, { method: 'DELETE' });
                        router.refresh();
                      }
                    }}
                    style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#ff4d4d", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span className="icon" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              ))}
              {galleryItems.length === 0 && <p style={s({ color: "var(--text-dim)" })}>{isRtl ? "لا توجد صور" : "No images found."}</p>}
            </div>
          </div>
        )}

        {activeTab === "Blog" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.blog")}</h2>
              <button onClick={() => setEditingPost({ title: "", title_ar: "", content: "", content_ar: "", category: "General", image_url: "", published: 0 })} className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>{isRtl ? "+ مقال جديد" : "+ New Post"}</button>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "العنوان" : "Title"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "التصنيف" : "Category"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "الحالة" : "Status"}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{isRtl ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {blogPosts.map((post: any) => (
                    <tr key={post.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px", fontSize: 14, fontWeight: 600 })}>{isRtl ? (post.title_ar || post.title) : post.title}</td>
                      <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-dim)" })}>{isRtl ? (post.category_ar || post.category) : post.category}</td>
                      <td style={s({ padding: "16px 20px" })}>
                        <span style={s({ padding: "4px 10px", borderRadius: 20, fontSize: 10, background: post.published ? "rgba(145,205,255,0.12)" : "rgba(255,255,255,0.1)", color: post.published ? "#91cdff" : "var(--text-muted)" })}>
                          {post.published ? (isRtl ? "منشور" : "Published") : (isRtl ? "مسودة" : "Draft")}
                        </span>
                      </td>
                      <td style={s({ padding: "16px 20px" })}>
                        <div style={s({ display: "flex", gap: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                          <button onClick={() => setEditingPost(post)} style={s({ background: "none", border: "none", color: "var(--pink)", cursor: "pointer", fontSize: 13 })}>{isRtl ? "تعديل" : "Edit"}</button>
                          <button onClick={async () => {
                            if(confirm(isRtl ? "هل أنت متأكد من حذف هذا المقال؟" : "Are you sure you want to delete this post?")) {
                              await fetch(`/api/blog/${post.id}`, { method: 'DELETE' });
                              router.refresh();
                            }
                          }} style={s({ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", fontSize: 13 })}>{isRtl ? "حذف" : "Delete"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {blogPosts.length === 0 && <tr><td colSpan={3} style={s({ padding: 20, textAlign: "center", color: "var(--text-dim)" })}>{isRtl ? "لا توجد مقالات" : "No posts found."}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Pricing" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.pricing")}</h2>
              <button className="btn btn-primary" style={s({ padding: "8px 16px", fontSize: 12 })}>{isRtl ? "+ باقة جديدة" : "+ New Package"}</button>
            </div>
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 })}>
              {packages.map((pkg: any) => (
                <div key={pkg.id} style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 })}>
                  <div style={s({ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: isRtl ? "row-reverse" : "row" })}>
                    <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--pink)" })}>{isRtl ? (pkg.name_ar || pkg.name) : pkg.name}</h3>
                    <span style={s({ fontSize: 18, fontWeight: 700 })}>{pkg.price.toLocaleString()} {isRtl ? "ريال" : "SAR"}</span>
                  </div>
                  <p style={s({ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.5 })}>{isRtl ? (pkg.description_ar || pkg.description) : pkg.description}</p>
                  <button onClick={() => {
                    setEditingPackage({
                      ...pkg,
                      features: typeof pkg.features === 'string' ? JSON.parse(pkg.features || '[]') : (pkg.features || []),
                      features_ar: typeof pkg.features_ar === 'string' ? JSON.parse(pkg.features_ar || '[]') : (pkg.features_ar || [])
                    });
                  }} style={s({ width: "100%", padding: "8px 0", background: "transparent", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 6, cursor: "pointer" })}>{isRtl ? "تعديل الباقة" : "Edit Package"}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Inquiries" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.inquiries")}</h2>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    {[t("admin.client"), t("admin.date"), t("contact.form.package"), t("admin.status"), t("admin.action")].map(h => (
                      <th key={h} style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-dim)" })}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const st = statusMap[b.status] || statusMap.pending;
                    return (
                      <tr key={b.id} style={s({ borderTop: "1px solid var(--border)" })}>
                        <td style={s({ padding: "16px 20px" })}>
                          <div style={s({ fontSize: 14, fontWeight: 600 })}>{b.client_name}</div>
                          <div style={s({ fontSize: 12, color: "var(--text-dim)", marginTop: 2 })}>{b.mobile}</div>
                        </td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" })}>{new Date(b.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}</td>
                        <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--pink)", textTransform: "capitalize", fontWeight: 600 })}>{b.package}</td>
                        <td style={s({ padding: "16px 20px" })}>
                          <span style={s({ padding: "4px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", background: st.bg, color: st.color })}>{st.label}</span>
                        </td>
                        <td style={s({ padding: "16px 20px" })}>
                          <button onClick={() => setSelected(b)} style={s({ padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontSize: 12 })}>{isRtl ? "التفاصيل" : "Details"}</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Subscribers" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{t("admin.subscribers")}</h2>
            </div>
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse", textAlign: isRtl ? "right" : "left" })}>
                <thead>
                  <tr style={s({ background: "rgba(255,255,255,0.02)" })}>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{t("contact.form.email")}</th>
                    <th style={s({ padding: "12px 20px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" })}>{t("admin.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub: any) => (
                    <tr key={sub.id} style={s({ borderTop: "1px solid var(--border)" })}>
                      <td style={s({ padding: "16px 20px", fontSize: 14 })}>{sub.email}</td>
                      <td style={s({ padding: "16px 20px", fontSize: 13, color: "var(--text-dim)" })}>{new Date(sub.created_at).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}</td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && <tr><td colSpan={2} style={s({ padding: 20, textAlign: "center", color: "var(--text-dim)" })}>{isRtl ? "لا يوجد مشتركون" : "No subscribers found."}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Settings" && (
          <div>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h2 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "إعدادات الموقع" : "Site Settings"}</h2>
              <button 
                className="btn btn-primary" 
                style={s({ padding: "8px 24px", fontSize: 13 })}
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settingsState) });
                  setIsSaving(false);
                  router.refresh();
                }}
              >
                {isSaving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ التغييرات" : "Save Changes")}
              </button>
            </div>
            
            <div style={s({ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, display: "flex", flexDirection: "column", gap: 32 })}>
              
              {/* Branding Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "الهوية البصرية" : "Branding"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "رابط الشعار (URL)" : "Logo URL"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input 
                        type="text" 
                        value={settingsState.logo_url || ""} 
                        onChange={e => setSettingsState({ ...settingsState, logo_url: e.target.value })}
                        style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, fontFamily: "monospace" })} 
                        placeholder="https://..."
                      />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "logo_url")} />
                      </label>
                    </div>
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "حجم الشعار (بيكسل)" : "Logo Width (px)"}</label>
                    <input 
                      type="number" 
                      value={settingsState.logo_width || "150"} 
                      onChange={e => setSettingsState({ ...settingsState, logo_width: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                    />
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "الخطوط (Google Fonts)" : "Typography"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "الخط الإنجليزي الأساسي" : "Primary English Font"}</label>
                    <input 
                      type="text" 
                      value={settingsState.font_en || "Playfair Display"} 
                      onChange={e => setSettingsState({ ...settingsState, font_en: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "الخط العربي الأساسي" : "Primary Arabic Font"}</label>
                    <input 
                      type="text" 
                      value={settingsState.font_ar || "Tajawal"} 
                      onChange={e => setSettingsState({ ...settingsState, font_ar: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                    />
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "الوسائط والصور" : "Media & Images"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "رابط فيديو الهيدر في الرئيسية (Hero Video)" : "Home Hero Video URL"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input 
                        type="text" 
                        value={settingsState.hero_video_url || ""} 
                        onChange={e => setSettingsState({ ...settingsState, hero_video_url: e.target.value })}
                        style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, fontFamily: "monospace" })} 
                        placeholder="https://..."
                      />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleUpload(e, "hero_video_url")} />
                      </label>
                    </div>
                    <span style={s({ fontSize: 11, color: "var(--text-muted)" })}>{isRtl ? "اختياري. يظهر كخلفية للهيدر." : "Optional. Plays as hero background."}</span>
                  </div>

                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "صور الهيدر (Hero Images)" : "Hero Images"}</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 12, marginBottom: 8 }}>
                      {(settingsState.hero_bg_url || "").split(",").filter(Boolean).map((imgUrl: string, idx: number) => (
                        <div key={idx} style={{ position: "relative", height: 80, borderRadius: 8, backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid var(--border)" }}>
                          <button 
                            onClick={() => {
                              const arr = (settingsState.hero_bg_url || "").split(",").filter(Boolean);
                              arr.splice(idx, 1);
                              setSettingsState({...settingsState, hero_bg_url: arr.join(",")});
                            }}
                            style={{ position: "absolute", top: -6, right: -6, background: "var(--pink)", color: "#fff", border: "none", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12 }}
                          >×</button>
                        </div>
                      ))}
                      <label style={{ height: 80, borderRadius: 8, border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-dim)" }}>
                        <span className="icon">add</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.url) {
                              const arr = (settingsState.hero_bg_url || "").split(",").filter(Boolean);
                              arr.push(data.url);
                              setSettingsState({...settingsState, hero_bg_url: arr.join(",")});
                            }
                          } finally {
                            setIsUploading(false);
                          }
                        }} />
                      </label>
                    </div>
                    <span style={s({ fontSize: 11, color: "var(--text-muted)" })}>{isRtl ? "يمكنك إضافة صورة أو أكثر لتعمل كشريط عرض (Slider)." : "Add one or multiple images to create a slider."}</span>
                  </div>

                  <div style={s({ display: "flex", flexDirection: "column", gap: 8, gridColumn: "1 / -1" })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>{isRtl ? "الخلفية العامة للموقع (Global Background)" : "Global Background Image URL"}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input 
                        type="text" 
                        value={settingsState.global_bg_url || ""} 
                        onChange={e => setSettingsState({ ...settingsState, global_bg_url: e.target.value })}
                        style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14, fontFamily: "monospace" })} 
                        placeholder="https://..."
                      />
                      <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px" }}>
                        <span className="icon">upload</span>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleUpload(e, "global_bg_url")} />
                      </label>
                    </div>
                    <span style={s({ fontSize: 11, color: "var(--text-muted)" })}>{isRtl ? "تظهر في خلفية كل الصفحات بشكل خافت." : "Subtle parallax background on all pages."}</span>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div>
                <h3 style={s({ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, color: "var(--pink)" })}>{isRtl ? "روابط السوشيال ميديا" : "Social Media Links"}</h3>
                <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 })}>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Instagram</label>
                    <input 
                      type="text" 
                      value={settingsState.social_instagram || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_instagram: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>TikTok</label>
                    <input 
                      type="text" 
                      value={settingsState.social_tiktok || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_tiktok: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Snapchat</label>
                    <input 
                      type="text" 
                      value={settingsState.social_snapchat || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_snapchat: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://snapchat.com/add/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>WhatsApp</label>
                    <input 
                      type="text" 
                      value={settingsState.social_whatsapp || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_whatsapp: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="966500000000"
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>LinkedIn</label>
                    <input 
                      type="text" 
                      value={settingsState.social_linkedin || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_linkedin: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Behance</label>
                    <input 
                      type="text" 
                      value={settingsState.social_behance || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_behance: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://behance.net/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>X / Twitter</label>
                    <input 
                      type="text" 
                      value={settingsState.social_x || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_x: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://x.com/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>YouTube</label>
                    <input 
                      type="text" 
                      value={settingsState.social_youtube || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_youtube: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                    <label style={s({ fontSize: 12, fontWeight: 600, color: "var(--text-dim)" })}>Facebook</label>
                    <input 
                      type="text" 
                      value={settingsState.social_facebook || ""} 
                      onChange={e => setSettingsState({ ...settingsState, social_facebook: e.target.value })}
                      style={s({ padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", width: "100%", fontSize: 14 })} 
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Booking Details Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={s({ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 })}>
          <div onClick={e => e.stopPropagation()} style={s({ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 24, padding: 40, maxWidth: 500, width: "100%", textAlign: isRtl ? "right" : "left" })}>
            <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, marginBottom: 28 })}>{t("admin.bookingDetails")}</h3>
            {[
              [t("admin.client"), selected.client_name], 
              [t("contact.form.mobile"), selected.mobile], 
              [t("contact.form.email"), selected.email||"—"], 
              [t("contact.form.eventType"), selected.event_type]
            ].map(([l, v]) => (
              <div key={l as string} style={s({ display: "flex", gap: 16, marginBottom: 14, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <span style={s({ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", width: 100, flexShrink: 0 })}>{l}</span>
                <span style={s({ fontSize: 14, color: "var(--text)" })}>{v}</span>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={() => setSelected(null)}>{isRtl ? "إغلاق" : "Close"}</button>
          </div>
        </div>
      )}

      {/* Package Edit Modal */}
      {editingPackage && (
        <div style={s({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" })}>
          <div style={s({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" })} onClick={() => setEditingPackage(null)} />
          <div className="anim-scale-in" style={s({ position: "relative", width: "100%", maxWidth: 600, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxHeight: "90vh", overflowY: "auto" })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "تعديل الباقة" : "Edit Package"}</h3>
              <button onClick={() => setEditingPackage(null)} style={s({ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" })}>
                <span className="icon">close</span>
              </button>
            </div>
            
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "اسم الباقة (إنجليزي)" : "Package Name (EN)"}</label>
                  <input type="text" value={editingPackage.name} onChange={e => setEditingPackage({...editingPackage, name: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "اسم الباقة (عربي)" : "Package Name (AR)"}</label>
                  <input type="text" value={editingPackage.name_ar || ""} onChange={e => setEditingPackage({...editingPackage, name_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "السعر (ريال)" : "Price (SAR)"}</label>
                <input type="number" value={editingPackage.price} onChange={e => setEditingPackage({...editingPackage, price: Number(e.target.value)})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "الوصف (إنجليزي)" : "Description (EN)"}</label>
                  <textarea rows={3} value={editingPackage.description || ""} onChange={e => setEditingPackage({...editingPackage, description: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "الوصف (عربي)" : "Description (AR)"}</label>
                  <textarea rows={3} value={editingPackage.description_ar || ""} onChange={e => setEditingPackage({...editingPackage, description_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              {/* Features Editor */}
              <div style={s({ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 })}>
                <label style={s({ display: "block", fontSize: 14, fontWeight: 600, color: "var(--pink)", marginBottom: 16, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المميزات (Features)" : "Package Features"}</label>
                <div style={s({ display: "flex", flexDirection: "column", gap: 12 })}>
                  {(editingPackage.features || []).map((feat: string, idx: number) => (
                    <div key={idx} style={s({ display: "flex", gap: 8, flexDirection: isRtl ? "row-reverse" : "row" })}>
                      <input 
                        type="text" 
                        placeholder={isRtl ? "الميزة بالإنجليزي..." : "Feature in EN..."}
                        value={feat} 
                        onChange={e => {
                          const newF = [...(editingPackage.features || [])];
                          newF[idx] = e.target.value;
                          setEditingPackage({...editingPackage, features: newF});
                        }} 
                        style={s({ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", fontSize: 13 })} 
                      />
                      <input 
                        type="text" 
                        placeholder={isRtl ? "الميزة بالعربي..." : "Feature in AR..."}
                        value={(editingPackage.features_ar || [])[idx] || ""} 
                        onChange={e => {
                          const newFAr = [...(editingPackage.features_ar || [])];
                          newFAr[idx] = e.target.value;
                          setEditingPackage({...editingPackage, features_ar: newFAr});
                        }} 
                        style={s({ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", fontSize: 13 })} 
                      />
                      <button onClick={() => {
                        const newF = [...(editingPackage.features || [])];
                        const newFAr = [...(editingPackage.features_ar || [])];
                        newF.splice(idx, 1);
                        newFAr.splice(idx, 1);
                        setEditingPackage({...editingPackage, features: newF, features_ar: newFAr});
                      }} style={s({ background: "rgba(255,0,0,0.1)", color: "#ff4d4d", border: "none", borderRadius: 6, width: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" })}>
                        <span className="icon" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      setEditingPackage({
                        ...editingPackage,
                        features: [...(editingPackage.features || []), ""],
                        features_ar: [...(editingPackage.features_ar || []), ""]
                      });
                    }}
                    style={s({ padding: "8px", background: "transparent", border: "1px dashed var(--border)", color: "var(--text-dim)", borderRadius: 6, cursor: "pointer", fontSize: 13, marginTop: 4 })}
                  >
                    {isRtl ? "+ إضافة ميزة جديدة" : "+ Add Feature"}
                  </button>
                </div>
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 })}>
                <button onClick={() => setEditingPackage(null)} className="btn btn-outline" style={s({ padding: "8px 24px", fontSize: 13 })}>{isRtl ? "إلغاء" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    await fetch(`/api/packages/${editingPackage.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingPackage) });
                    setIsSaving(false);
                    setEditingPackage(null);
                    router.refresh();
                  }} 
                  className="btn btn-primary" 
                  style={s({ padding: "8px 24px", fontSize: 13 })}
                >
                  {isSaving ? "..." : (isRtl ? "حفظ التغييرات" : "Save Changes")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Add Modal */}
      {addingGalleryImage && (
        <div style={s({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" })}>
          <div style={s({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" })} onClick={() => setAddingGalleryImage(null)} />
          <div className="anim-scale-in" style={s({ position: "relative", width: "100%", maxWidth: 500, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxHeight: "90vh", overflowY: "auto" })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? "إضافة صورة للمعرض" : "Add Gallery Image"}</h3>
              <button onClick={() => setAddingGalleryImage(null)} style={s({ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" })}>
                <span className="icon">close</span>
              </button>
            </div>
            
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "الصورة" : "Image"}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={addingGalleryImage.image_url} readOnly style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} placeholder={isRtl ? "سيظهر الرابط هنا..." : "URL will appear here..."} />
                  <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px", flexShrink: 0 }}>
                    <span className="icon">upload</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) setAddingGalleryImage({...addingGalleryImage, image_url: data.url});
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                  </label>
                </div>
                {addingGalleryImage.image_url && <div style={{ marginTop: 12, height: 120, backgroundImage: `url(${addingGalleryImage.image_url})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 8 }} />}
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "العنوان" : "Title"}</label>
                <input type="text" value={addingGalleryImage.title} onChange={e => setAddingGalleryImage({...addingGalleryImage, title: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "التصنيف" : "Category"}</label>
                <input type="text" value={addingGalleryImage.category} onChange={e => setAddingGalleryImage({...addingGalleryImage, category: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} placeholder="e.g., Wedding, Portrait, Commercial" />
              </div>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 })}>
                <button onClick={() => setAddingGalleryImage(null)} className="btn btn-outline" style={s({ padding: "8px 24px", fontSize: 13 })}>{isRtl ? "إلغاء" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    if (!addingGalleryImage.image_url) return;
                    setIsSaving(true);
                    await fetch('/api/gallery', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addingGalleryImage) });
                    setIsSaving(false);
                    setAddingGalleryImage(null);
                    router.refresh();
                  }} 
                  className="btn btn-primary" 
                  style={s({ padding: "8px 24px", fontSize: 13, opacity: (!addingGalleryImage.image_url || isSaving) ? 0.5 : 1 })}
                  disabled={!addingGalleryImage.image_url || isSaving}
                >
                  {isSaving || isUploading ? "..." : (isRtl ? "إضافة" : "Add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Post Modal */}
      {editingPost && (
        <div style={s({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" })}>
          <div style={s({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" })} onClick={() => setEditingPost(null)} />
          <div className="anim-scale-in" style={s({ position: "relative", width: "100%", maxWidth: 800, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, maxHeight: "90vh", overflowY: "auto" })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexDirection: isRtl ? "row-reverse" : "row" })}>
              <h3 style={s({ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 })}>{isRtl ? (editingPost.id ? "تعديل المقال" : "مقال جديد") : (editingPost.id ? "Edit Post" : "New Post")}</h3>
              <button onClick={() => setEditingPost(null)} style={s({ color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" })}>
                <span className="icon">close</span>
              </button>
            </div>
            
            <div style={s({ display: "flex", flexDirection: "column", gap: 16 })}>
              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "العنوان (إنجليزي)" : "Title (EN)"}</label>
                  <input type="text" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "العنوان (عربي)" : "Title (AR)"}</label>
                  <input type="text" value={editingPost.title_ar || ""} onChange={e => setEditingPost({...editingPost, title_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "التصنيف (إنجليزي)" : "Category (EN)"}</label>
                  <input type="text" value={editingPost.category || ""} onChange={e => setEditingPost({...editingPost, category: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "التصنيف (عربي)" : "Category (AR)"}</label>
                  <input type="text" value={editingPost.category_ar || ""} onChange={e => setEditingPost({...editingPost, category_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left" })} />
                </div>
              </div>

              <div>
                <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "صورة المقال" : "Featured Image"}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={editingPost.image_url || ""} readOnly style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" })} placeholder={isRtl ? "سيظهر الرابط هنا..." : "URL will appear here..."} />
                  <label className="btn btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "0 16px", flexShrink: 0 }}>
                    <span className="icon">upload</span>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                        const data = await res.json();
                        if (data.url) setEditingPost({...editingPost, image_url: data.url});
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                  </label>
                </div>
                {editingPost.image_url && <div style={{ marginTop: 12, height: 160, backgroundImage: `url(${editingPost.image_url})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 8 }} />}
              </div>

              <div style={s({ display: "flex", gap: 16, flexDirection: isRtl ? "row-reverse" : "row" })}>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المحتوى (إنجليزي)" : "Content (EN)"}</label>
                  <textarea rows={8} value={editingPost.content || ""} onChange={e => setEditingPost({...editingPost, content: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", resize: "vertical" })} />
                </div>
                <div style={s({ flex: 1 })}>
                  <label style={s({ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8, textAlign: isRtl ? "right" : "left" })}>{isRtl ? "المحتوى (عربي)" : "Content (AR)"}</label>
                  <textarea rows={8} value={editingPost.content_ar || ""} onChange={e => setEditingPost({...editingPost, content_ar: e.target.value})} style={s({ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)", textAlign: isRtl ? "right" : "left", resize: "vertical" })} />
                </div>
              </div>

              <label style={s({ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexDirection: isRtl ? "row-reverse" : "row" })}>
                <input type="checkbox" checked={editingPost.published === 1} onChange={e => setEditingPost({...editingPost, published: e.target.checked ? 1 : 0})} style={{ width: 16, height: 16 }} />
                <span style={s({ fontSize: 14, fontWeight: 600 })}>{isRtl ? "نشر المقال (يظهر للزوار)" : "Publish (Visible to visitors)"}</span>
              </label>

              <div style={s({ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 })}>
                <button onClick={() => setEditingPost(null)} className="btn btn-outline" style={s({ padding: "8px 24px", fontSize: 13 })}>{isRtl ? "إلغاء" : "Cancel"}</button>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    const method = editingPost.id ? "PATCH" : "POST";
                    const url = editingPost.id ? `/api/blog/${editingPost.id}` : "/api/blog";
                    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingPost) });
                    setIsSaving(false);
                    setEditingPost(null);
                    router.refresh();
                  }} 
                  className="btn btn-primary" 
                  style={s({ padding: "8px 24px", fontSize: 13, opacity: isSaving ? 0.5 : 1 })}
                  disabled={isSaving}
                >
                  {isSaving || isUploading ? "..." : (isRtl ? "حفظ" : "Save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:1100px){
          .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
