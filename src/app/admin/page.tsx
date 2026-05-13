import getDb from "@/lib/db";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

interface Booking {
  id: number;
  client_name: string;
  mobile: string;
  email: string | null;
  event_type: string;
  venue_location: string | null;
  package: string;
  additional_services: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const db = getDb();

  const bookings = db
    .prepare("SELECT * FROM bookings ORDER BY created_at DESC")
    .all() as Booking[];

  // Fetch real package prices from DB
  const dbPackages = db.prepare("SELECT tier, price FROM packages").all() as { tier: string; price: number }[];
  const packagePrices: Record<string, number> = {};
  dbPackages.forEach(p => {
    packagePrices[p.tier] = p.price;
  });

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const newToday = bookings.filter((b) => {
    const today = new Date().toISOString().split('T')[0];
    const bDate = new Date(b.created_at).toISOString().split('T')[0];
    return bDate === today;
  }).length;

  const revenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (packagePrices[b.package] || 0), 0);

  const galleryCount = (
    db.prepare("SELECT COUNT(*) as count FROM gallery_items").get() as { count: number }
  ).count;

  const blogCount = (
    db.prepare("SELECT COUNT(*) as count FROM blog_posts WHERE published = 1").get() as { count: number }
  ).count;

  const subscriberCount = (
    db.prepare("SELECT COUNT(*) as count FROM newsletter_subscribers").get() as { count: number }
  ).count;

  const galleryItems = db.prepare("SELECT * FROM gallery_items ORDER BY created_at DESC").all();
  const blogPosts = db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all();
  const packagesList = db.prepare("SELECT * FROM packages").all();
  const subscribers = db.prepare("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC").all();
  
  const dbSettings = db.prepare("SELECT * FROM site_settings").all() as { key: string, value: string }[];
  const settingsMap: Record<string, string> = {};
  dbSettings.forEach(s => { settingsMap[s.key] = s.value; });

  return (
    <AdminDashboardClient
      bookings={bookings}
      stats={{
        totalBookings,
        pendingBookings,
        confirmedBookings,
        newToday,
        revenue,
        galleryCount,
        blogCount,
        subscriberCount,
      }}
      galleryItems={galleryItems as any[]}
      blogPosts={blogPosts as any[]}
      packages={packagesList as any[]}
      subscribers={subscribers as any[]}
      settings={settingsMap}
    />
  );
}
