import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';

export async function GET(request, { params }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const countView = searchParams.get("view") === "1";
  try {
    await dbConnect();
    let article;
    if (countView) {
      article = await Article.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 } },
        { new: true, returnDocument: "after" }
      ).lean();
    } else {
      article = await Article.findOne({ slug }).lean();
    }
    if (!article) {
      return Response.json({ error: "Article not found" }, { status: 404 });
    }
    return Response.json(article, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET article error:", error);
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
export async function PUT(request, { params }) {
  const { slug } = await params;
  try {
    await dbConnect();
    const body = await request.json();
    const { title, excerpt, content, category, author, imageUrl, status } = body;

    if (!title || !excerpt || !content || !author) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updated = await Article.findOneAndUpdate(
      { slug },
      {
        title,
        excerpt,
        content,
        categoryId: category,
        author,
        imageUrl,
        status,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return Response.json({ error: 'Article not found' }, { status: 404 });
    }

    return Response.json({ success: true, article: updated });
  } catch (error) {
    console.error('PUT article error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}