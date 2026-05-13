import { NextResponse } from "next/server";
import connectToDatabase, { BlogPost } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();
    const posts = await BlogPost.find({ published: 1 }).sort({ created_at: -1 }).lean();
    return NextResponse.json(posts.map(p => {
      const id = (p as any)._id.toString();
      delete (p as any)._id;
      delete (p as any).__v;
      return { ...p, id };
    }));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await connectToDatabase();
    
    // Generate a simple slug from the English title
    const slug = (data.title || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now();

    const newPost = await BlogPost.create({
      title: data.title || "Untitled",
      title_ar: data.title_ar || "",
      slug,
      excerpt: data.excerpt || "",
      excerpt_ar: data.excerpt_ar || "",
      content: data.content || "",
      content_ar: data.content_ar || "",
      image_url: data.image_url || "",
      category: data.category || "",
      category_ar: data.category_ar || "",
      read_time: data.read_time || "5 min read",
      read_time_ar: data.read_time_ar || "5 دقائق قراءة",
      published: data.published ? 1 : 0
    });

    return NextResponse.json({ success: true, id: newPost._id });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
