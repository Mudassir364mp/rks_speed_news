import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';
import { getArticles } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');
  const isBreaking = searchParams.get('breaking');

  try {
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
  } catch (error) {
    console.error('GET /api/articles error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // âœ… SEEDHA MONGO MEIN SAVE â€” deleteMany nahi
    const newArticle = new Article({
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      categoryId: data.categoryId || '',
      author: data.author || '',
      imageUrl: data.imageUrl || '',
      isBreaking: data.isBreaking || false,
      publishedAt: new Date(data.publishedAt || Date.now()),
      views: 0,
    });

    const saved = await newArticle.save();

    console.log('Article saved to MongoDB:', saved._id);

    return Response.json({ success: true, article: saved });
  } catch (error) {
    console.error('POST /api/articles error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
