import dbConnect from '@/lib/mongoose';
import BreakingNews from '@/models/BreakingNews';
import { getBreakingNews } from '@/lib/db';

export async function GET() {
  try {
    const breakingNews = await getBreakingNews();
    return Response.json(breakingNews, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('GET /api/breaking error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!Array.isArray(data)) {
      return Response.json({ success: false, error: 'Expected array of breaking news' }, { status: 400 });
    }

    // ✅ SEEDHA UPSERT करो
    for (const item of data) {
      await BreakingNews.findOneAndUpdate(
        { _id: item._id || item.id },
        {
          text: item.text,
          link: item.link,
        },
        { upsert: true, new: true }
      );
    }

    console.log('Breaking news updated');

    return Response.json({ success: true });
  } catch (error) {
    console.error('PUT /api/breaking error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}