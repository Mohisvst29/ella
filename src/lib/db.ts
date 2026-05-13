import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    
    async function seed() {
      // Seed settings if empty
      const settingsCount = await SiteSetting.countDocuments();
      if (settingsCount === 0) {
        await SiteSetting.create([
          { key: 'logo_url', value: '' },
          { key: 'logo_width', value: '150' },
          { key: 'hero_video_url', value: '' },
          { key: 'hero_title_en', value: 'The Art of Your' },
          { key: 'hero_title_ar', value: 'فن إطلالتك' },
          { key: 'hero_span_en', value: 'Majestic Presence' },
          { key: 'hero_span_ar', value: 'المهيبة' },
          { key: 'hero_desc_en', value: 'Exclusive female-only wedding photography for the modern Saudi bride. Capturing every whispered secret and luminous moment with cinematic precision.' },
          { key: 'hero_desc_ar', value: 'تصوير حفلات زفاف حصري للسيدات فقط للعروس السعودية العصرية. نوثق كل سر يهمس به وكل لحظة مضيئة بدقة سينمائية.' },
          { key: 'font_en', value: 'Playfair Display' },
          { key: 'font_ar', value: 'Tajawal' },
          { key: 'social_links', value: JSON.stringify({ instagram: '', twitter: '', facebook: '', linkedin: '', behance: '' }) }
        ]);
      }

      // Seed Team if empty
      const teamCount = await TeamMember.countDocuments();
      if (teamCount === 0) {
        await TeamMember.create([
          { name: 'Layan Ahmed', name_ar: 'ليان أحمد', role: 'Creative Director & Lead Photographer', role_ar: 'المديرة الإبداعية والمصورة الرئيسية', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARSYl-dyL6YPrsdEHG4IP8gQ6MOvp2JrcPs1d_euFGEnKJwuXLlwmKNGgTjlKi2-pP98Bty3-CTif5rqSnY4pLeQeKNyv4s2dju1FDw7LAZhdHqOULMCeEyZC-5omg30ERdACP9yBnt0WBGZnioXWx3C_i7ui9wOVdthM1B-JSWbQ0_OHolskTBkWwoZBjOpzyrg-32o2oEll2uTGfAUWnYQ3PJl-mFAtHOxzxbqk3jK59qcwDmVp5Tas7Org4KoLT4R10vdmDBwss', order: 1 },
          { name: 'Sarah Khalid', name_ar: 'سارة خالد', role: 'Senior Videographer', role_ar: 'مصورة فيديو أولى', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHKKUMMEwSYQTJSHHVi6vR9HNDaE04n6YVLU8TwJwEOX3aHW6KH8QtQz_mkOJDu44VL-qTFWzwZimVnouZd3Jso99q0w4lTA8YVRAWHWuJud9IAE586lA7lpSrK9LazrZgV6PYMbORHv3dEoYOb1T0lH2gIlNfnLFAvzAXGIRoq77R2vILBezKjoU3Da1KfS-5v34a43cIxV0U04jogmUV90XJmD07KHvCNG5VIhTM4j7mf2XGHb_yyiWHkY1O2X7AbS_XBhVR3beR', order: 2 },
          { name: 'Noura Mansour', name_ar: 'نورة منصور', role: 'Lighting Specialist', role_ar: 'أخصائية إضاءة', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3KfROc4OkeZUesjuJMPEn8jPfi8_xg_xMitgyw8M5sJTwFVDz3YEiaHP5BifEHV7ESwyoQnuM1IPSykXdvPnZhCTvjo-MJvdFduoCjnY6LH9aNLfbo15Y150NMGI81YTBFR9LJ5Tr4kxeuoGRNQEvgbI-mv0uu6D99OMch_CVF_kA6m1Kv_niun-8dt3VDkm9ALSpJ48Ro466U7fzHmS9QTgUh9u0PJwdU2UBtrVTLWC6qJlDUewFosovZ_XyJ_jx5Noj5AK9Uxng', order: 3 }
        ]);
      }

      // Seed packages if empty
      const pkgCount = await Package.countDocuments();
      if (pkgCount === 0) {
        await Package.create([
          {
            name: 'Essential',
            name_ar: 'الأساسية',
            tier: 'essential',
            price: 6000,
            description: 'Perfect for intimate gatherings and focused coverage of your grand entrance.',
            description_ar: 'مثالية للتجمعات الحميمة والتغطية المركزة لإطلالتك المهيبة.',
            features: JSON.stringify(['4 Hours of Coverage', '1 Senior Photographer', '200 High-Res Edited Photos', 'Digital Gallery Access']),
            features_ar: JSON.stringify(['تغطية 4 ساعات', 'مصورة محترفة واحدة', '200 صورة معدلة بدقة عالية', 'وصول للمعرض الرقمي']),
            featured: 0,
            active: 1
          },
          {
            name: 'Premium',
            name_ar: 'المميزة',
            tier: 'premium',
            price: 12000,
            description: 'Our signature experience. Comprehensive coverage with a luxury physical album.',
            description_ar: 'تجربتنا المميزة. تغطية شاملة مع ألبوم مادي فاخر.',
            features: JSON.stringify(['Full Day Coverage (8 Hours)', '2 Photographers (Lead + Second)', '500+ Edited Highlights', 'Large Italian Leather Album', 'Complimentary Pre-Wedding Session']),
            features_ar: JSON.stringify(['تغطية يوم كامل (8 ساعات)', '2 مصورات (رئيسية + مساعدة)', 'أكثر من 500 لقطة مميزة معدلة', 'ألبوم جلد إيطالي كبير', 'جلسة تصوير مجانية قبل الزفاف']),
            featured: 1,
            active: 1
          },
          {
            name: 'Legacy',
            name_ar: 'الإرث',
            tier: 'legacy',
            price: 22000,
            description: 'The ultimate cinematic journey. Includes full video production and heirloom boxes.',
            description_ar: 'الرحلة السينمائية القصوى. تشمل إنتاج فيديو كامل وصناديق الذكرى.',
            features: JSON.stringify(['Unlimited Multi-Day Coverage', 'Full Media Team (4 Professionals)', '4K Cinematic Film & Highlights', '2 Mini-Albums for Parents', 'Drone Aerial Coverage']),
            features_ar: JSON.stringify(['تغطية غير محدودة لعدة أيام', 'فريق إعلامي كامل (4 محترفات)', 'فيلم سينمائي 4K ولقطات مميزة', '2 ألبوم صغير للوالدين', 'تغطية جوية بالدرون']),
            featured: 0,
            active: 1
          }
        ]);
      }

      // Seed gallery if empty
      const galleryCount = await GalleryItem.countDocuments();
      if (galleryCount === 0) {
        await GalleryItem.create([
          {
            title: "The Grand Reception",
            category: "Wedding",
            image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8gl9ovfxB2jRQCTbyGZf00f_iGqtwraTMi6RiC-31fIzcfkziOS-_82iIRai8MMOQykDNG1aWi2DqM-Sm5PMIdyszDaIpsfr3p_LtjL4XecvYjuwelyEV7R6qS9FzoKq3BtMxcLFEJSOmnlGo4Fy6Sglxkfe1zfIi64z9zYmTOaHUBGHN85KAftGcoA3NOfTGkttHm6tyZfBFZsWQgvuhTa8p4MEtCMpOApbyZqsy-GqDFSo2fY5ORSS4cpNacMsTajnwbaN99II_",
            location: "Riyadh",
            year: 2024,
            featured: 1
          },
          {
            title: "Bridal Elegance",
            category: "Portrait",
            image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdyLkmidK3oJvKx6vUxTqmRtvA7WtgCYNAp1FR6lxXVCdiN4MyBwoZonvdjCxDvt7GDXcNYgSQ1T8WsxqFsTOQVCPrn0AH1uAVp9oGG4559NW4enFcXCY83ZcLH6ntnbzairJa2YBeLezklYs38fmFJl16fGBxMtTzkVJWyNcyNVSU3kcPukVpiNsZIjGJ9aoWeH1rera84DnIj4k6Vp_1D4bNDBmpB9xCe0AHLT-lQB-hlcykZV5jYqsksb9hCFD0T9k3nNdlh5G0",
            location: "Jeddah",
            year: 2023,
            featured: 1
          },
          {
            title: "The Details",
            category: "Details",
            image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF77GBu85vj4zea3frOBsCHs85VymHap5GXAOAvE8q_HxL9W4fZS8b6xwXoMshhG-osK6uIi7_TKp8EMFWqILCfIuFtDvZJ3H_nZy7xecie04OQ2fIXdGpK5dynXhcaoVbK_0-6lAq3PFe7YcPo2s6rXuXrC1WCQtEUzIWBFB1UjhHz9px3L-8zmHdTK-cFRjnhd_0LwWkMDR84eAu4dYnhAFRLKhZ8oMj-4LSErfeWigHJg7qp7-Yke_ABHtm57glaRbrqQemxPB4",
            location: "Khobar",
            year: 2023,
            featured: 0
          },
          {
            title: "Cinematic Entrance",
            category: "Wedding",
            image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1QLxw_iZ5pj5oqyuj-YKSX6CCd_zE4fN2Z2R2UZ0D1eYx4QlWAs1IQ3fO_jazdTNwjAPzsd_cTYzJdqm1y5KxUawgjpFW4Pgd9QUiyxoyc1S6LknwmWBqU8QOjYbY3l7rPZTvj-TWne8ReA0puQmP-ki2uWqD4YM3KV4dsicGQvBiZdM7wvY8DJZpC5aD-BM_WjOW8jzREaTw54BMTjl3SAmb0gfHWdg1n-4WMBXEXKCY3I2_B6aX1UbYb9JlDQy-WRtsgpi9VSec",
            location: "Riyadh",
            year: 2024,
            featured: 0
          }
        ]);
      }

      // Seed blog if empty
      const blogCount = await BlogPost.countDocuments();
      if (blogCount === 0) {
        await BlogPost.create([
          {
            title: "Mastering the Grand Entrance: A Photographer's Perspective",
            title_ar: "إتقان الإطلالة المهيبة: منظور مصورة",
            slug: "mastering-grand-entrance",
            excerpt: "How we utilize dynamic lighting and composition to capture the most pivotal moment of your wedding night with cinematic precision.",
            excerpt_ar: "كيف نستخدم الإضاءة الديناميكية والتكوين لالتقاط اللحظة الأكثر أهمية في ليلة زفافك بدقة سينمائية.",
            image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC29sbIwehqeMi34PLutfaAJBxQEnHlXA2J3sorn0Eqg77IdMYBmtN1bESodqpiF5mtJc9QcdrjDGoAPj_lFFQ-1iTM4maBfw-h6Z4I5405qYITe-ZL9ygAu1T5NpSDFHDs4zk2afaN-Vv4C2DvKGDLqXDvdFB2WZ_VgIZ_NqpE2RRPRXueMgRLAEN3Q3u7UOd1u-xAgHdA8xhFTHj726ui-409Z2zyWNzplba8wNi7DGBIqvOLpVIMhac699Cv8HQhvKdGGHDp67wI",
            category: "Industry Insight",
            category_ar: "رؤية الصناعة",
            author: "Layan Ahmed",
            read_time: "8 min read",
            read_time_ar: "8 دقائق للقراءة",
            published: 1
          },
          {
            title: "The Symbolism of Bridal Henna: A Visual Journey",
            title_ar: "رمزية حناء العروس: رحلة بصرية",
            slug: "symbolism-bridal-henna",
            excerpt: "Exploring the traditional motifs of the Hijaz region and how we document their exquisite detail.",
            excerpt_ar: "استكشاف الزخارف التقليدية لمنطقة الحجاز وكيف نوثق تفاصيلها الرائعة.",
            image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBb9m3aJ17wA3KeUvlRXYeosMadrwziXWQGFI02JG2B-Q_64EE372QeCcebvh_aVkCRMyMInu9xsGJquuAL_zZoa5pnqRQaQfGxgzVMNMkLRPbOTbu2iSepw5ImRqPOGr3eXHfA1EGvaznsODDBpHgHJK-5-WyfDdwHuQjQRrunyuNRdMMtLmy7yDYmvfU4SEhV6ZEjUDBBrXHShDtkOBOqa1RX78fDUNBREeQYMCk5ZFZWfMR-S-obgusQXFddVX06tJkA_ExR72tc",
            category: "Planning",
            category_ar: "تخطيط",
            author: "Layan Ahmed",
            read_time: "5 min read",
            read_time_ar: "5 دقائق للقراءة",
            published: 1
          },
          {
            title: "Lighting the Desert: Outdoor Photography Challenges",
            title_ar: "إضاءة الصحراء: تحديات التصوير الخارجي",
            slug: "lighting-desert-outdoor",
            excerpt: "From golden hour to the starlit reception, how we manage natural light in Al-Ula's majestic landscape.",
            excerpt_ar: "من الساعة الذهبية إلى الاستقبال تحت النجوم، كيف ندير الضوء الطبيعي في مناظر العلا المهيبة.",
            image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgviQJ2vuxLx2cDH1N9eRsvLX9R0UYsjX_nIXtwM2WHOHlDs4iGNwzlMmCjrMNokp3kPN-FM3dDO8JgI7Wu6p-_6ZIwpsWUK0FpUb71IcSIwWmKUdFLcerCMjaO7-JF2BF39F5Ymm1n4rn_R6vIETu6MlALhtcsVSgV0NuEqfdPxZNWScuo9LTiHD-CGNlk-DXaN6Zh2LOGvar7GSfwSdqahrCWBg1-SGq8mYQoQH8uZ7AzVZYfGMy7eMDMYqQ09UUmJZJMggnLVYc",
            category: "Location",
            category_ar: "الموقع",
            author: "Sarah Khalid",
            read_time: "6 min read",
            read_time_ar: "6 دقائق للقراءة",
            published: 1
          }
        ]);
      }
    }
    
    await seed();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// ================= SCHEMAS =================

const BookingSchema = new mongoose.Schema({
  client_name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  event_type: { type: String, required: true },
  venue_location: String,
  package: { type: String, required: true },
  additional_services: String,
  notes: String,
  status: { type: String, default: 'pending' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const GalleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image_url: { type: String, required: true },
  location: String,
  year: Number,
  featured: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  title_ar: String,
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  excerpt_ar: String,
  content: String,
  content_ar: String,
  image_url: String,
  category: String,
  category_ar: String,
  author: { type: String, default: 'Layan Ahmed' },
  read_time: String,
  read_time_ar: String,
  published: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const NewsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_ar: String,
  tier: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  description_ar: String,
  features: String,
  features_ar: String,
  featured: { type: Number, default: 0 },
  active: { type: Number, default: 1 },
});

const SiteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: String,
});

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_ar: String,
  role: String,
  role_ar: String,
  image_url: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Convert _id to id in JSON outputs
const transformId = (doc: any, ret: any) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

BookingSchema.set('toJSON', { transform: transformId });
GalleryItemSchema.set('toJSON', { transform: transformId });
BlogPostSchema.set('toJSON', { transform: transformId });
NewsletterSubscriberSchema.set('toJSON', { transform: transformId });
PackageSchema.set('toJSON', { transform: transformId });
SiteSettingSchema.set('toJSON', { transform: transformId });
TeamMemberSchema.set('toJSON', { transform: transformId });

// ================= MODELS =================

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const GalleryItem = mongoose.models.GalleryItem || mongoose.model('GalleryItem', GalleryItemSchema);
export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
export const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
export const Package = mongoose.models.Package || mongoose.model('Package', PackageSchema);
export const SiteSetting = mongoose.models.SiteSetting || mongoose.model('SiteSetting', SiteSettingSchema);
export const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);

export default connectToDatabase;
