import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const db = getDb();
    const post = db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND published = 1").get(slug);
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  try {
    const data = await request.json();
    const db = getDb();
    
    const stmt = db.prepare(`
      UPDATE blog_posts 
      SET title = ?, title_ar = ?, excerpt = ?, excerpt_ar = ?, content = ?, content_ar = ?, image_url = ?, category = ?, category_ar = ?, read_time = ?, read_time_ar = ?, published = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      data.title,
      data.title_ar,
      data.excerpt,
      data.excerpt_ar,
      data.content,
      data.content_ar,
      data.image_url,
      data.category,
      data.category_ar,
      data.read_time,
      data.read_time_ar,
      data.published ? 1 : 0,
      params.slug // This will contain the ID because we pass the ID in the URL
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  try {
    const db = getDb();
    const stmt = db.prepare(`DELETE FROM blog_posts WHERE id = ?`);
    stmt.run(params.slug); // Using slug param as ID
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
