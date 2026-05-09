import { getArticles } from '@/lib/db';
import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';

export async function GET(request, { params }) {
  const { slug } = await params;

  // ✅ await lagaya
  const articles = await getArticles();
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    return Response.json({ error: 'Article not found' }, { status: 404 });
  }

  return Response.json(article, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// ✅ DELETE route add kiya — admin panel se delete karne ke liye
export async function DELETE(request, { params }) {
  const { slug } = await params;
  try {
    await dbConnect();
    const deleted = await Article.findOneAndDelete({ slug });

    if (!deleted) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}