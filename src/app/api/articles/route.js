import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';
import { getArticles } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');
  const isBreaking = searchParams.get('breaking');

  let articles = await getArticles();

  if (categoryId) {
    articles = articles.filter(a => String(a.categoryId) === String(categoryId));
  }
  if (isBreaking === 'true') {
    articles = articles.filter(a => a.isBreaking);
  }

  return Response.json(articles, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // ✅ Seedha MongoDB mein save — deleteMany/insertMany nahi
    const newArticle = new Article({
      ...data,
      publishedAt: new Date(),
      views: 0,
    });

    await newArticle.save();

    return Response.json({ success: true, article: newArticle });
  } catch (error) {
    console.error('POST /api/articles error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}