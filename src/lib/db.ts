import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'ayla.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDb(db);
  }
  return db;
}

function initializeDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT,
      event_type TEXT NOT NULL,
      venue_location TEXT,
      package TEXT NOT NULL,
      additional_services TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      location TEXT,
      year INTEGER,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_ar TEXT,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      excerpt_ar TEXT,
      content TEXT,
      content_ar TEXT,
      image_url TEXT,
      category TEXT,
      category_ar TEXT,
      author TEXT DEFAULT 'Layan Ahmed',
      read_time TEXT,
      read_time_ar TEXT,
      published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_ar TEXT,
      tier TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      description_ar TEXT,
      features TEXT,
      features_ar TEXT,
      featured INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration: Add missing columns if they don't exist
  const tables = ['blog_posts', 'packages'];
  const columnsToAdd: Record<string, string[]> = {
    blog_posts: ['title_ar', 'excerpt_ar', 'content_ar', 'category_ar', 'read_time_ar'],
    packages: ['name_ar', 'description_ar', 'features_ar']
  };

  for (const table of tables) {
    const info = database.prepare(`PRAGMA table_info(${table})`).all() as any[];
    const existing = info.map(c => c.name);
    for (const col of columnsToAdd[table]) {
      if (!existing.includes(col)) {
        database.exec(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`);
      }
    }
  }

  // Seed settings if empty
  const settingsCount = database.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const insertSetting = database.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    insertSetting.run('logo_url', '');
    insertSetting.run('logo_width', '150');
    insertSetting.run('hero_video_url', '');
    insertSetting.run('font_en', 'Playfair Display');
    insertSetting.run('font_ar', 'Tajawal');
  }

  // Seed packages if empty
  const pkgCount = database.prepare('SELECT COUNT(*) as count FROM packages').get() as { count: number };
  if (pkgCount.count === 0) {
    const insertPkg = database.prepare(`
      INSERT INTO packages (name, name_ar, tier, price, description, description_ar, features, features_ar, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPkg.run('Essential', 'الأساسية', 'essential', 6000, 
      'Perfect for intimate gatherings and focused coverage of your grand entrance.',
      'مثالية للتجمعات الحميمة والتغطية المركزة لإطلالتك المهيبة.',
      JSON.stringify(['4 Hours of Coverage', '1 Senior Photographer', '200 High-Res Edited Photos', 'Digital Gallery Access']),
      JSON.stringify(['تغطية 4 ساعات', 'مصورة محترفة واحدة', '200 صورة معدلة بدقة عالية', 'وصول للمعرض الرقمي']), 0);
    
    insertPkg.run('Premium', 'المميزة', 'premium', 12000, 
      'Our signature experience. Comprehensive coverage with a luxury physical album.',
      'تجربتنا المميزة. تغطية شاملة مع ألبوم مادي فاخر.',
      JSON.stringify(['Full Day Coverage (8 Hours)', '2 Photographers (Lead + Second)', '500+ Edited Highlights', 'Large Italian Leather Album', 'Complimentary Pre-Wedding Session']),
      JSON.stringify(['تغطية يوم كامل (8 ساعات)', '2 مصورات (رئيسية + مساعدة)', 'أكثر من 500 لقطة مميزة معدلة', 'ألبوم جلد إيطالي كبير', 'جلسة تصوير مجانية قبل الزفاف']), 1);
    
    insertPkg.run('Legacy', 'الإرث', 'legacy', 22000, 
      'The ultimate cinematic journey. Includes full video production and heirloom boxes.',
      'الرحلة السينمائية القصوى. تشمل إنتاج فيديو كامل وصناديق الذكرى.',
      JSON.stringify(['Unlimited Multi-Day Coverage', 'Full Media Team (4 Professionals)', '4K Cinematic Film & Highlights', '2 Mini-Albums for Parents', 'Drone Aerial Coverage']),
      JSON.stringify(['تغطية غير محدودة لعدة أيام', 'فريق إعلامي كامل (4 محترفات)', 'فيلم سينمائي 4K ولقطات مميزة', '2 ألبوم صغير للوالدين', 'تغطية جوية بالدرون']), 0);
  } else {
    // Update existing packages with Arabic if missing
    const firstPkg = database.prepare('SELECT name_ar FROM packages LIMIT 1').get() as { name_ar: string | null };
    if (!firstPkg?.name_ar) {
      database.prepare("UPDATE packages SET name_ar = 'الأساسية', description_ar = 'مثالية للتجمعات الحميمة والتغطية المركزة لإطلالتك المهيبة.', features_ar = ? WHERE tier = 'essential'").run(JSON.stringify(['تغطية 4 ساعات', 'مصورة محترفة واحدة', '200 صورة معدلة بدقة عالية', 'وصول للمعرض الرقمي']));
      database.prepare("UPDATE packages SET name_ar = 'المميزة', description_ar = 'تجربتنا المميزة. تغطية شاملة مع ألبوم مادي فاخر.', features_ar = ? WHERE tier = 'premium'").run(JSON.stringify(['تغطية يوم كامل (8 ساعات)', '2 مصورات (رئيسية + مساعدة)', 'أكثر من 500 لقطة مميزة معدلة', 'ألبوم جلد إيطالي كبير', 'جلسة تصوير مجانية قبل الزفاف']));
      database.prepare("UPDATE packages SET name_ar = 'الإرث', description_ar = 'الرحلة السينمائية القصوى. تشمل إنتاج فيديو كامل وصناديق الذكرى.', features_ar = ? WHERE tier = 'legacy'").run(JSON.stringify(['تغطية غير محدودة لعدة أيام', 'فريق إعلامي كامل (4 محترفات)', 'فيلم سينمائي 4K ولقطات مميزة', '2 ألبوم صغير للوالدين', 'تغطية جوية بالدرون']));
    }
  }

  // Seed blog posts if empty
  const bCount = database.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as { count: number };
  if (bCount.count === 0) {
    const insertPost = database.prepare(`
      INSERT INTO blog_posts (title, title_ar, slug, excerpt, excerpt_ar, image_url, category, category_ar, author, read_time, read_time_ar, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPost.run(
      'Mastering the Grand Entrance: A Photographer\'s Perspective', 
      'إتقان الإطلالة المهيبة: منظور مصورة',
      'mastering-grand-entrance',
      'How we utilize dynamic lighting and composition to capture the most pivotal moment of your wedding night with cinematic precision.',
      'كيف نستخدم الإضاءة الديناميكية والتكوين لالتقاط اللحظة الأكثر أهمية في ليلة زفافك بدقة سينمائية.',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC29sbIwehqeMi34PLutfaAJBxQEnHlXA2J3sorn0Eqg77IdMYBmtN1bESodqpiF5mtJc9QcdrjDGoAPj_lFFQ-1iTM4maBfw-h6Z4I5405qYITe-ZL9ygAu1T5NpSDFHDs4zk2afaN-Vv4C2DvKGDLqXDvdFB2WZ_VgIZ_NqpE2RRPRXueMgRLAEN3Q3u7UOd1u-xAgHdA8xhFTHj726ui-409Z2zyWNzplba8wNi7DGBIqvOLpVIMhac699Cv8HQhvKdGGHDp67wI',
      'Industry Insight', 'رؤية الصناعة', 'Layan Ahmed', '8 min read', '8 دقائق للقراءة', 1
    );
    // ... other posts omitted for brevity, adding a few more
  } else {
    // Update blog posts if title_ar is missing
    const firstBlog = database.prepare('SELECT title_ar FROM blog_posts LIMIT 1').get() as { title_ar: string | null };
    if (!firstBlog?.title_ar) {
       database.prepare("UPDATE blog_posts SET title_ar = 'إتقان الإطلالة المهيبة: منظور مصورة', excerpt_ar = 'كيف نستخدم الإضاءة الديناميكية والتكوين لالتقاط اللحظة الأكثر أهمية في ليلة زفافك بدقة سينمائية.', category_ar = 'رؤية الصناعة', read_time_ar = '8 دقائق للقراءة' WHERE slug = 'mastering-grand-entrance'").run();
       database.prepare("UPDATE blog_posts SET title_ar = 'رمزية حناء العروس: رحلة بصرية', excerpt_ar = 'استكشاف الزخارف التقليدية لمنطقة الحجاز وكيف نوثق تفاصيلها الرائعة.', category_ar = 'تخطيط', read_time_ar = '5 دقائق للقراءة' WHERE slug = 'symbolism-bridal-henna'").run();
       database.prepare("UPDATE blog_posts SET title_ar = 'إضاءة الصحراء: تحديات التصوير الخارجي', excerpt_ar = 'من الساعة الذهبية إلى الاستقبال تحت النجوم، كيف ندير الضوء الطبيعي في مناظر العلا المهيبة.', category_ar = 'الموقع', read_time_ar = '6 دقائق للقراءة' WHERE slug = 'lighting-desert-outdoor'").run();
    }
  }
}

export default getDb;
