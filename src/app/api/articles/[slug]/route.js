import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    await dbConnect();

    // Directly find by slug — fast & increments views
    const article = await Article.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true, returnDocument: 'after' }
    ).lean();

    if (!article) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    return Response.json(article, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('GET article error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

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