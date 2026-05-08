import { getCategories, saveCategories } from '@/lib/db';

export async function GET() {
  const categories = await getCategories(); // ✅ await add kiya

  return Response.json(categories, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request) {
  try {
    const data = await request.json();
    const categories = await getCategories(); // ✅ await add kiya

    const newCategory = {
      ...data,
      id: Date.now().toString(),
    };

    categories.push(newCategory);
    await saveCategories(categories); // ✅ await add kiya

    return Response.json({ success: true, category: newCategory });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to save category' }, { status: 500 });
  }
}