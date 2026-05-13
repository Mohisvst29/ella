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
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    
    // Seed initial data if empty
    const settingsCount = await cached.conn.models.SiteSetting?.countDocuments();
    if (settingsCount === 0) {
      await cached.conn.models.SiteSetting.insertMany([
        { key: 'logo_url', value: '' },
        { key: 'logo_width', value: '150' },
        { key: 'hero_video_url', value: '' },
        { key: 'font_en', value: 'Playfair Display' },
        { key: 'font_ar', value: 'Tajawal' },
      ]);
    }

    const pkgCount = await cached.conn.models.Package?.countDocuments();
    if (pkgCount === 0) {
      await cached.conn.models.Package.insertMany([
        {
          name: 'Essential', name_ar: 'الأساسية', tier: 'essential', price: 6000, 
          description: 'Perfect for intimate gatherings and focused coverage of your grand entrance.',
          description_ar: 'مثالية للتجمعات الحميمة والتغطية المركزة لإطلالتك المهيبة.',
          features: JSON.stringify(['4 Hours of Coverage', '1 Senior Photographer', '200 High-Res Edited Photos', 'Digital Gallery Access']),
          features_ar: JSON.stringify(['تغطية 4 ساعات', 'مصورة محترفة واحدة', '200 صورة معدلة بدقة عالية', 'وصول للمعرض الرقمي']),
          featured: 0
        },
        {
          name: 'Premium', name_ar: 'المميزة', tier: 'premium', price: 12000, 
          description: 'Our signature experience. Comprehensive coverage with a luxury physical album.',
          description_ar: 'تجربتنا المميزة. تغطية شاملة مع ألبوم مادي فاخر.',
          features: JSON.stringify(['Full Day Coverage (8 Hours)', '2 Photographers (Lead + Second)', '500+ Edited Highlights', 'Large Italian Leather Album', 'Complimentary Pre-Wedding Session']),
          features_ar: JSON.stringify(['تغطية يوم كامل (8 ساعات)', '2 مصورات (رئيسية + مساعدة)', 'أكثر من 500 لقطة مميزة معدلة', 'ألبوم جلد إيطالي كبير', 'جلسة تصوير مجانية قبل الزفاف']),
          featured: 1
        },
        {
          name: 'Legacy', name_ar: 'الإرث', tier: 'legacy', price: 22000, 
          description: 'The ultimate cinematic journey. Includes full video production and heirloom boxes.',
          description_ar: 'الرحلة السينمائية القصوى. تشمل إنتاج فيديو كامل وصناديق الذكرى.',
          features: JSON.stringify(['Unlimited Multi-Day Coverage', 'Full Media Team (4 Professionals)', '4K Cinematic Film & Highlights', '2 Mini-Albums for Parents', 'Drone Aerial Coverage']),
          features_ar: JSON.stringify(['تغطية غير محدودة لعدة أيام', 'فريق إعلامي كامل (4 محترفات)', 'فيلم سينمائي 4K ولقطات مميزة', '2 ألبوم صغير للوالدين', 'تغطية جوية بالدرون']),
          featured: 0
        }
      ]);
    }
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

// ================= MODELS =================

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const GalleryItem = mongoose.models.GalleryItem || mongoose.model('GalleryItem', GalleryItemSchema);
export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
export const NewsletterSubscriber = mongoose.models.NewsletterSubscriber || mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
export const Package = mongoose.models.Package || mongoose.model('Package', PackageSchema);
export const SiteSetting = mongoose.models.SiteSetting || mongoose.model('SiteSetting', SiteSettingSchema);

export default connectToDatabase;
