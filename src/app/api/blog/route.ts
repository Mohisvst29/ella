import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const db = getDb();
    
    // Generate a simple slug from the English title
    const slug = (data.title || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now();

    const stmt = db.prepare(`
      INSERT INTO blog_posts (title, title_ar, slug, excerpt, excerpt_ar, content, content_ar, image_url, category, category_ar, read_time, read_time_ar, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.title || "Untitled",
      data.title_ar || "",
      slug,
      data.excerpt || "",
      data.excerpt_ar || "",
      data.content || "",
      data.content_ar || "",
      data.image_url || "",
      data.category || "",
      data.category_ar || "",
      data.read_time || "5 min read",
      data.read_time_ar || "5 دقائق قراءة",
      data.published ? 1 : 0
    );

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
