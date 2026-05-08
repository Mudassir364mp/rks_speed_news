import { getBreakingNews, saveBreakingNews } from '@/lib/db';

export async function GET() {
  const breakingNews = await getBreakingNews(); // ✅ await add kiya

  return Response.json(breakingNews, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function PUT(request) {
  try {
    const data = await request.json();
    await saveBreakingNews(data); // ✅ await add kiya

    return Response.json({ success: true, breakingNews: data });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to save breaking news' }, { status: 500 });
  }
}