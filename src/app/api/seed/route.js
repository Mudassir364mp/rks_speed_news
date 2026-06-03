import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';
import Category from '@/models/Category';
import BreakingNews from '@/models/BreakingNews';
import Ad from '@/models/Ad';
import { saveArticles, saveCategories, saveBreakingNews, saveAds } from '@/lib/db';
import { initialArticles, initialCategories, initialBreakingNews, initialAds } from '@/lib/data';

export async function GET() {
  try {
    await saveCategories(initialCategories);
    await saveArticles(initialArticles);
    await saveBreakingNews(initialBreakingNews);
    await saveAds(initialAds);
    return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await Article.deleteMany({});
    await Category.deleteMany({});
    await BreakingNews.deleteMany({});
    await Ad.deleteMany({});
    return NextResponse.json({ success: true, message: 'All data cleared successfully!' });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

