import { getArticles, saveArticles } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');
  const isBreaking = searchParams.get('breaking');

  let articles = await getArticles(); // ✅ await add kiya

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
    const data = await request.json();
    const articles = await getArticles(); // ✅ await add kiya

    const newArticle = {
      ...data,
      id: Date.now().toString(),
      publishedAt: new Date().toISOString(),
      views: 0
    };

    articles.push(newArticle);
    await saveArticles(articles); // ✅ await add kiya

    return Response.json({ success: true, article: newArticle });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to save article' }, { status: 500 });
  }
}