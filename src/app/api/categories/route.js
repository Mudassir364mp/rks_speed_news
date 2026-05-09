import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';
import { getCategories } from '@/lib/db';

export async function GET() {
  const categories = await getCategories();
  return Response.json(categories, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Upsert — slug unique hai, agar exist kare to update karo warna create
    const category = await Category.findOneAndUpdate(
      { slug: data.slug },
      {
        name: data.name,
        slug: data.slug,
        color: data.color || '#ef4444',
        id: data.id || Date.now().toString(),
      },
      { upsert: true, new: true }
    );

    return Response.json({ success: true, category });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}